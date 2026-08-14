/* ══════════════════════════════════════════════════════════════════════
 * PROJETOS: listagem com busca, ficha, cadastro, equipe e a placa de
 * aviso de cadastro errado.
 *
 * R19 em tudo: a lista só traz os projetos da pessoa, e as rotas de item
 * passam por `projetoVisivel`.
 * ══════════════════════════════════════════════════════════════════════ */

import {
  projetos, equipes, usuarios, orientacoes, flags, avisos, andamentos,
} from '../persistencia/repositorio.js';
import { veTodosOsProjetos } from '../regras/visibilidade.js';
import { podeCadastrarProjeto, rotuloDoPapel } from '../regras/papeis.js';
import {
  ehAtiva, situacaoValida, tipoValido, rotuloDaSituacao, rotuloDoTipo, SITUACOES, TIPOS,
} from '../regras/cadastro.js';
import { estaAtrasado } from '../regras/ciencia.js';
import { ErroApi, exigir, texto, textoOpcional } from './http.js';
import { projetoVisivel } from './guardas.js';

/** O cartão da listagem: a ficha resumida + a última orientação. */
function cartao(p) {
  const atual = orientacoes.atualDoProjeto(p.id);
  return {
    id: p.id,
    codigo: p.codigo,
    nome: p.nome,
    local: p.local,
    tipo: p.tipo,
    tipo_rotulo: rotuloDoTipo(p.tipo),
    situacao: p.situacao,
    situacao_rotulo: rotuloDaSituacao(p.situacao),
    conjunto: p.conjunto,
    orientacao_atual: atual
      ? {
          id: atual.id,
          titulo: atual.titulo,
          data_da_mudanca: atual.data_da_mudanca,
          responsavel_nome: atual.responsavel_nome,
          publicada_em: atual.publicada_em,
        }
      : null,
  };
}

/**
 * A página do projeto inteira numa resposta: ficha, orientação atual COM
 * a ciência dela, andamento e equipe — para o frontend não precisar de
 * quatro chamadas para pintar uma tela.
 */
function fichaCompleta(usuario, projeto) {
  const atual = orientacoes.atualDoProjeto(projeto.id) ?? null;
  const cienciaDaAtual = atual
    ? avisos.daOrientacao(atual.id).map((a) => ({ ...a, atrasado: estaAtrasado(a) }))
    : [];
  const meuAviso = atual ? avisos.doUsuarioNaOrientacao(usuario.id, atual.id) : null;

  return {
    projeto,
    tipo_rotulo: rotuloDoTipo(projeto.tipo),
    situacao_rotulo: rotuloDaSituacao(projeto.situacao),
    orientacao_atual: atual,
    ciencia_da_atual: cienciaDaAtual,
    minha_confirmacao_pendente: Boolean(meuAviso && !meuAviso.confirmado_em),
    total_orientacoes: orientacoes.contar(projeto.id),
    andamentos: andamentos.doProjeto(projeto.id),
    equipe: equipes.doProjeto(projeto.id).map((u) => ({
      id: u.id, nome: u.nome, papel: u.papel, papel_rotulo: rotuloDoPapel(u.papel),
    })),
    flags_abertas: flags.abertasDoProjeto(projeto.id),
    pode_corrigir: podeCadastrarProjeto(usuario),
  };
}

/** Lê e valida os campos do cadastro (criar e corrigir usam o mesmo). */
function camposDoCadastro(corpo) {
  return {
    codigo: texto(corpo, 'codigo', 'Informe o código do projeto.'),
    nome: texto(corpo, 'nome', 'Informe o nome do projeto.'),
    local: textoOpcional(corpo, 'local'),
    cliente: textoOpcional(corpo, 'cliente'),
    numeroContrato: textoOpcional(corpo, 'numero_contrato'),
    dataInicio: textoOpcional(corpo, 'data_inicio'),
    prazo: textoOpcional(corpo, 'prazo'),
    situacao: situacaoValida(textoOpcional(corpo, 'situacao')),
    tipo: tipoValido(textoOpcional(corpo, 'tipo')),
    conjunto: textoOpcional(corpo, 'conjunto'),
    linkDrive: textoOpcional(corpo, 'link_drive'),
    caminhoRede: textoOpcional(corpo, 'caminho_rede'),
  };
}

function codigoJaExiste(codigo, ignorarId = null) {
  return projetos
    .todos()
    .some((p) => p.id !== ignorarId && p.codigo.toLowerCase() === codigo.toLowerCase());
}

export const rotasDeProjetos = [
  /* Listagem da tela inicial: só as obras da pessoa; ativas por padrão;
   * busca por nome ou código. (Tipo e local entram como filtros depois —
   * os campos já vão no cartão para o frontend não esperar por nós.) */
  ['GET', '/api/projetos', ({ usuario, url }) => {
    const busca = (url.searchParams.get('busca') || '').trim().toLowerCase();
    const incluirInativas = url.searchParams.get('todas') === '1';

    let lista = veTodosOsProjetos(usuario) ? projetos.todos() : projetos.doUsuario(usuario.id);
    const inativas = lista.filter((p) => !ehAtiva(p.situacao)).length;
    if (!incluirInativas) lista = lista.filter((p) => ehAtiva(p.situacao));
    if (busca) {
      lista = lista.filter(
        (p) => p.nome.toLowerCase().includes(busca) || p.codigo.toLowerCase().includes(busca)
      );
    }
    return {
      projetos: lista.map(cartao),
      inativas_ocultas: incluirInativas ? 0 : inativas,
      ve_todos: veTodosOsProjetos(usuario),
    };
  }],

  ['GET', '/api/projetos/:id', ({ usuario, params }) =>
    fichaCompleta(usuario, projetoVisivel(usuario, params.id))],

  ['POST', '/api/projetos', ({ usuario, corpo }) => {
    exigir(podeCadastrarProjeto(usuario), 403,
      'Cadastrar projeto é atribuição da coordenação e da direção.');
    const campos = camposDoCadastro(corpo);
    exigir(!codigoJaExiste(campos.codigo), 400, `Já existe um projeto com o código ${campos.codigo}.`);

    const equipe = Array.isArray(corpo.equipe) ? corpo.equipe.map(Number).filter(Number.isFinite) : [];
    exigir(equipe.length > 0, 400,
      'Marque pelo menos uma pessoa: sem equipe, ninguém vê o projeto nem é avisado.');
    exigir(equipe.every((id) => usuarios.porId(id)), 400, 'Tem gente na lista que não existe.');

    const id = projetos.criar({ ...campos, equipe });
    return { id };
  }],

  ['PUT', '/api/projetos/:id', ({ usuario, params, corpo }) => {
    exigir(podeCadastrarProjeto(usuario), 403,
      'Corrigir o cadastro é atribuição da coordenação e da direção.');
    const projeto = projetoVisivel(usuario, params.id);
    const campos = camposDoCadastro(corpo);
    exigir(!codigoJaExiste(campos.codigo, projeto.id), 400,
      `Já existe outro projeto com o código ${campos.codigo}.`);
    projetos.atualizar(projeto.id, campos);
    return { ok: true };
  }],

  ['PUT', '/api/projetos/:id/equipe', ({ usuario, params, corpo }) => {
    exigir(podeCadastrarProjeto(usuario), 403,
      'Mudar a equipe é atribuição da coordenação e da direção.');
    const projeto = projetoVisivel(usuario, params.id);
    const ids = Array.isArray(corpo.usuario_ids) ? corpo.usuario_ids.map(Number).filter(Number.isFinite) : [];
    exigir(ids.length > 0, 400, 'A equipe não pode ficar vazia.');
    exigir(ids.every((id) => usuarios.porId(id)), 400, 'Tem gente na lista que não existe.');
    equipes.definir(projeto.id, ids);
    return { equipe: equipes.doProjeto(projeto.id) };
  }],

  /* Tudo o que o formulário de cadastro precisa, numa rota: os vocabulários
   * de situação e tipo (com rótulos — o front não duplica regra) e os
   * conjuntos já usados, para ninguém criar dois nomes para a mesma coisa.
   * Restrita a quem cadastra: a contagem de conjuntos revela projetos que
   * o resto da equipe não enxerga (R19). */
  ['GET', '/api/cadastro/opcoes', ({ usuario }) => {
    exigir(podeCadastrarProjeto(usuario), 403,
      'As opções de cadastro são de quem cadastra: coordenação e direção.');
    return {
      situacoes: Object.entries(SITUACOES).map(([codigo, s]) => ({
        codigo, rotulo: s.rotulo, ativa: s.ativa,
      })),
      tipos: Object.entries(TIPOS).map(([codigo, rotulo]) => ({ codigo, rotulo })),
      conjuntos: projetos.conjuntos(),
    };
  }],

  /* A placa ⚑: avisa a coordenação de que um campo do cadastro está errado. */
  ['POST', '/api/projetos/:id/flags', ({ usuario, params, corpo }) => {
    const projeto = projetoVisivel(usuario, params.id);
    const id = flags.criar({
      projetoId: projeto.id,
      usuarioId: usuario.id,
      campo: textoOpcional(corpo, 'campo'),
      observacao: textoOpcional(corpo, 'observacao'),
    });
    return { id };
  }],

  ['POST', '/api/projetos/:id/flags/:flagId/resolver', ({ usuario, params }) => {
    exigir(podeCadastrarProjeto(usuario), 403, 'Encerrar o aviso é de quem corrige: a coordenação.');
    const projeto = projetoVisivel(usuario, params.id);
    const aberta = flags.abertasDoProjeto(projeto.id).some((f) => f.id === Number(params.flagId));
    if (!aberta) throw new ErroApi(404, 'Esse aviso não está aberto neste projeto.');
    flags.resolver({ flagId: params.flagId, usuarioId: usuario.id });
    return { ok: true };
  }],
];
