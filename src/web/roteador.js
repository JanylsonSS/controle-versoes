/* ══════════════════════════════════════════════════════════════════════
 * ROTEADOR — cada rota existe porque um requisito pediu.
 * A referência de qual rota atende qual R está em REQUISITOS-COBERTOS.md.
 * ══════════════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

import { PASTA_PUBLICA, PASTA_ARQUIVOS, LIMITE_ARQUIVO_MB } from '../config.js';
import {
  usuarios, projetos, revisoes, avisos, acessos, incidentes, equipes, andamentos, flags,
  atividades,
} from '../persistencia/repositorio.js';
import { podePublicar, podeCancelar, podeCadastrarProjeto } from '../regras/papeis.js';
import { quemDeveSerAvisado } from '../regras/notificacao.js';
import { veTodosOsProjetos, podeVerProjeto } from '../regras/visibilidade.js';
import { podeAbrirArquivo } from '../regras/ciencia.js';
import { ehAtiva, situacaoValida, tipoValido } from '../regras/cadastro.js';
import { ehAprovador, podeAprovarEsta, porQueNaoPodeAprovar } from '../regras/aprovacao.js';
import {
  colunaValida, datasAoMover, podeMexerNoQuadro, podeExcluirAtividade, COLUNA_INICIAL,
} from '../regras/atividades.js';

import { telaAtividades } from './paginas/atividades.js';
import { telaAprovacoes } from './paginas/aprovacoes.js';
import { pagina, recado } from './paginas/layout.js';
import { telaInicial } from './paginas/inicio.js';
import { telaCadastroProjeto } from './paginas/novo-projeto.js';
import { telaConjunto } from './paginas/conjunto.js';
import { telaProjeto } from './paginas/projeto.js';
import { telaRevisao } from './paginas/revisao.js';
import { telaPublicar } from './paginas/publicar.js';
import { telaAvisos } from './paginas/avisos.js';
import { telaRetrabalho, telaNovoIncidente } from './paginas/retrabalho.js';
import { esc } from './html.js';

/* ─── Rotas ─────────────────────────────────────────────────────────── */

const ROTAS = [
  ['GET', '/', inicio],
  ['POST', '/entrar', entrar],

  ['GET', '/projetos/novo', formularioNovoProjeto],
  ['POST', '/projetos', criarProjeto],
  ['GET', '/projetos/:id', verProjeto],
  ['GET', '/projetos/:id/editar', formularioEditarProjeto],
  ['POST', '/projetos/:id/editar', salvarProjeto],
  ['GET', '/projetos/:id/publicar', formularioPublicar],
  ['POST', '/projetos/:id/publicar', publicarRevisao],
  ['POST', '/projetos/:id/equipe', salvarEquipe],
  ['POST', '/projetos/:id/andamento', registrarAndamento],
  ['POST', '/projetos/:id/flag', criarFlag],
  ['POST', '/projetos/:id/flag/:flagId/resolver', resolverFlag],

  ['GET', '/projetos/:id/atividades', verQuadro],
  ['POST', '/projetos/:id/atividades', criarAtividade],
  ['POST', '/atividades/:id', salvarAtividade],
  ['POST', '/atividades/:id/mover', moverAtividade],
  ['POST', '/atividades/:id/excluir', excluirAtividade],

  ['GET', '/conjuntos/:nome', verConjunto],

  ['GET', '/aprovacoes', verAprovacoes],
  ['POST', '/revisoes/:id/aprovar', aprovarRevisao],
  ['POST', '/revisoes/:id/reprovar', reprovarRevisao],

  ['GET', '/revisoes/:id', verRevisao],
  ['POST', '/revisoes/:id/confirmar', confirmarCiencia],
  ['POST', '/revisoes/:id/cancelar', cancelarRevisao],

  ['GET', '/arquivos/:id', baixarArquivo],

  ['GET', '/avisos', verAvisos],

  ['GET', '/retrabalho', verRetrabalho],
  ['GET', '/retrabalho/novo', formularioIncidente],
  ['POST', '/retrabalho', registrarIncidente],
];

export async function atender(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const caminho = decodeURIComponent(url.pathname);

  if (caminho === '/favicon.ico') return responder(res, 204, {}, '');
  if (await servirEstatico(caminho, res)) return;

  const usuario = usuarioDaSessao(req);

  for (const [metodo, padrao, acao] of ROTAS) {
    if (metodo !== req.method) continue;
    const params = casar(padrao, caminho);
    if (!params) continue;
    return acao({ req, res, params, url, usuario });
  }

  paginaSimples(res, usuario, 'Não encontrado', `<h1>Página não encontrada</h1>
    <p><a href="/">Voltar para os projetos</a></p>`, 404);
}

/* ─── Telas ─────────────────────────────────────────────────────────── */

function inicio({ res, url, usuario }) {
  const pendentes = maisAntigosPrimeiro(avisosVisiveis(usuario, { apenasPendentes: true }));

  // R8 + R13 — o projeto em que mudou algo que você ainda não viu sobe para
  // o topo. O que exige atenção não deve depender de você ir procurar.
  const comPendencia = new Set(pendentes.map((a) => a.projeto_id));
  const todos = projetosVisiveis(usuario).sort(
    (a, b) =>
      (comPendencia.has(a.id) ? 0 : 1) - (comPendencia.has(b.id) ? 0 : 1) ||
      a.nome.localeCompare(b.nome, 'pt-BR')
  );

  // Obra concluída ou parada só aparece quando alguém pede.
  const mostrandoTodas = url.searchParams.get('todas') === '1';
  const ativos = todos.filter((p) => ehAtiva(p.situacao));

  const conteudo =
    recadoDaUrl(url) +
    telaInicial({
      projetos: mostrandoTodas ? todos : ativos,
      pendentes,
      podeCadastrar: podeCadastrarProjeto(usuario),
      veTudo: veTodosOsProjetos(usuario),
      mostrandoTodas,
      quantasInativas: todos.length - ativos.length,
    });
  paginaSimples(res, usuario, 'Projetos', conteudo, 200, 'projetos');
}

/** Obras correlatas num lugar só, respeitando o R19. */
function verConjunto({ res, params, usuario }) {
  const nome = params.nome;
  const doConjunto = projetos.doConjunto(nome);
  if (!doConjunto.length) return naoEncontrado(res, usuario);

  const visiveis = doConjunto.filter((p) => enxerga(usuario, p.id));
  paginaSimples(
    res,
    usuario,
    nome,
    telaConjunto({
      nome,
      projetos: projetos.comVigente(visiveis),
      escondidos: doConjunto.length - visiveis.length,
    }),
    200,
    'projetos'
  );
}

/* ─── Cadastro de projeto e equipe (R1, R19) ────────────────────────── */

function formularioNovoProjeto({ res, usuario }) {
  if (!podeCadastrarProjeto(usuario)) return semPermissaoCadastro(res, usuario);
  paginaSimples(
    res,
    usuario,
    'Cadastrar projeto',
    telaCadastroProjeto({
      pessoas: usuarios.todos(),
      conjuntosConhecidos: projetos.conjuntos(),
      marcados: [usuario.id],
      erro: null,
    }),
    200,
    'projetos'
  );
}

/** Lê os campos do cadastro que são comuns a criar e corrigir. */
function camposDoCadastro(corpo) {
  const texto = (campo) => (corpo.get(campo) || '').toString().trim();
  return {
    codigo: texto('codigo'),
    nome: texto('nome'),
    local: texto('local') || null,
    cliente: texto('cliente') || null,
    numeroContrato: texto('numero_contrato') || null,
    dataInicio: texto('data_inicio') || null,
    prazo: texto('prazo') || null,
    situacao: situacaoValida(texto('situacao')),
    tipo: tipoValido(texto('tipo')),
    conjunto: texto('conjunto') || null,
    linkDrive: texto('link_drive') || null,
    caminhoRede: texto('caminho_rede') || null,
  };
}

/** Devolve os mesmos campos no formato que o formulário relê (nomes do banco). */
function deVoltaAoFormulario(c) {
  return {
    codigo: c.codigo, nome: c.nome, local: c.local, cliente: c.cliente,
    numero_contrato: c.numeroContrato, data_inicio: c.dataInicio, prazo: c.prazo,
    situacao: c.situacao, tipo: c.tipo, conjunto: c.conjunto, link_drive: c.linkDrive,
    caminho_rede: c.caminhoRede,
  };
}

function criarProjeto({ req, res, usuario }) {
  if (!podeCadastrarProjeto(usuario)) return semPermissaoCadastro(res, usuario);

  return comCorpo(req, res, usuario, (corpo) => {
    const campos = camposDoCadastro(corpo);
    const equipe = todosOsValores(corpo, 'equipe').map(Number).filter(Number.isFinite);

    const recusar = (mensagem) =>
      paginaSimples(
        res,
        usuario,
        'Cadastrar projeto',
        telaCadastroProjeto({
          pessoas: usuarios.todos(),
          conjuntosConhecidos: projetos.conjuntos(),
          valores: deVoltaAoFormulario(campos),
          marcados: equipe,
          erro: mensagem,
        }),
        400,
        'projetos'
      );

    if (!campos.codigo) return recusar('Informe o código do projeto.');
    if (!campos.nome) return recusar('Informe o nome do projeto.');
    if (projetos.todos().some((p) => p.codigo.toLowerCase() === campos.codigo.toLowerCase())) {
      return recusar(`Já existe um projeto com o código ${campos.codigo}.`);
    }
    if (!equipe.length) {
      return recusar('Marque pelo menos uma pessoa: sem equipe, ninguém vê o projeto nem é avisado.');
    }

    const novoId = projetos.criar({ ...campos, equipe });
    redirecionar(res, `/projetos/${novoId}?feito=projeto`);
  });
}

function formularioEditarProjeto({ res, params, usuario }) {
  if (!podeCadastrarProjeto(usuario)) return semPermissaoCadastro(res, usuario);
  const projeto = projetos.porId(params.id);
  if (!projeto) return naoEncontrado(res, usuario);

  paginaSimples(
    res,
    usuario,
    'Corrigir cadastro',
    telaCadastroProjeto({
      pessoas: usuarios.todos(),
      conjuntosConhecidos: projetos.conjuntos(),
      valores: projeto,
      editando: projeto,
      erro: null,
    }),
    200,
    'projetos'
  );
}

function salvarProjeto({ req, res, params, usuario }) {
  if (!podeCadastrarProjeto(usuario)) return semPermissaoCadastro(res, usuario);
  const projeto = projetos.porId(params.id);
  if (!projeto) return naoEncontrado(res, usuario);

  return comCorpo(req, res, usuario, (corpo) => {
    const campos = camposDoCadastro(corpo);

    const recusar = (mensagem) =>
      paginaSimples(
        res,
        usuario,
        'Corrigir cadastro',
        telaCadastroProjeto({
          pessoas: usuarios.todos(),
          conjuntosConhecidos: projetos.conjuntos(),
          valores: deVoltaAoFormulario(campos),
          editando: projeto,
          erro: mensagem,
        }),
        400,
        'projetos'
      );

    if (!campos.codigo) return recusar('Informe o código do projeto.');
    if (!campos.nome) return recusar('Informe o nome do projeto.');
    if (
      projetos
        .todos()
        .some((p) => p.id !== projeto.id && p.codigo.toLowerCase() === campos.codigo.toLowerCase())
    ) {
      return recusar(`Já existe outro projeto com o código ${campos.codigo}.`);
    }

    projetos.atualizar(projeto.id, campos);
    redirecionar(res, `/projetos/${projeto.id}?feito=cadastro`);
  });
}

/* ─── Quadro de atividades ──────────────────────────────────────────── */

function verQuadro({ res, params, url, usuario }) {
  const projeto = projetos.porId(params.id);
  if (!projeto) return naoEncontrado(res, usuario);
  if (!enxerga(usuario, projeto.id)) return foraDaEquipe(res, usuario);

  const conteudo =
    recadoDaUrl(url) +
    telaAtividades({
      projeto,
      atividades: atividades.doProjeto(projeto.id),
      pessoas: equipes.doProjeto(projeto.id),
      usuario,
      podeMexer: podeMexerNoQuadro(usuario),
      atividadeAberta: url.searchParams.get('atividade'),
    });
  paginaSimples(res, usuario, `${projeto.nome} — atividades`, conteudo, 200, 'projetos');
}

function criarAtividade({ req, res, params, usuario }) {
  const projeto = projetos.porId(params.id);
  if (!projeto) return naoEncontrado(res, usuario);
  if (!enxerga(usuario, projeto.id)) return foraDaEquipe(res, usuario);

  return comCorpo(req, res, usuario, (corpo) => {
    const texto = (campo) => (corpo.get(campo) || '').toString().trim();
    if (!texto('nome')) {
      return redirecionar(res, `/projetos/${projeto.id}/atividades?feito=atividade_sem_nome`);
    }
    atividades.criar({
      projetoId: projeto.id,
      nome: texto('nome'),
      descricao: texto('descricao'),
      responsavelId: Number(texto('responsavel_id')) || null,
      situacao: colunaValida(texto('situacao') || COLUNA_INICIAL),
      criadaPor: usuario.id,
    });
    redirecionar(res, `/projetos/${projeto.id}/atividades?feito=atividade`);
  });
}

/** Guarda comum às rotas que mexem numa atividade específica. */
function atividadeAcessivel(params, usuario) {
  const atividade = atividades.porId(params.id);
  if (!atividade) return { erro: 'nao_encontrada' };
  if (!enxerga(usuario, atividade.projeto_id)) return { erro: 'fora_da_equipe' };
  return { atividade };
}

function salvarAtividade({ req, res, params, usuario }) {
  const { atividade, erro } = atividadeAcessivel(params, usuario);
  if (erro === 'nao_encontrada') return naoEncontrado(res, usuario);
  if (erro) return foraDaEquipe(res, usuario);

  return comCorpo(req, res, usuario, (corpo) => {
    const texto = (campo) => (corpo.get(campo) || '').toString().trim();
    const volta = `/projetos/${atividade.projeto_id}/atividades`;
    if (!texto('nome')) return redirecionar(res, `${volta}?feito=atividade_sem_nome`);

    atividades.atualizar(atividade.id, {
      nome: texto('nome'),
      descricao: texto('descricao'),
      responsavelId: Number(texto('responsavel_id')) || null,
    });

    // O seletor de coluna da janela é o caminho de quem não arrasta.
    const novaSituacao = colunaValida(texto('situacao') || atividade.situacao);
    if (novaSituacao !== atividade.situacao) {
      atividades.mover({
        id: atividade.id,
        situacao: novaSituacao,
        posicao: Number.MAX_SAFE_INTEGER, // vai para o fim da coluna
        datas: datasAoMover(atividade, novaSituacao, new Date().toISOString()),
      });
    }
    redirecionar(res, `${volta}?feito=atividade_salva`);
  });
}

/** Chamada pelo arrastar-e-soltar. Responde vazio: quem chama é o navegador. */
function moverAtividade({ req, res, params, usuario }) {
  const { atividade, erro } = atividadeAcessivel(params, usuario);
  if (erro) return responder(res, erro === 'nao_encontrada' ? 404 : 403, {}, '');

  return comCorpo(req, res, usuario, (corpo) => {
    const situacao = colunaValida((corpo.get('situacao') || '').toString());
    const posicao = Number((corpo.get('posicao') || '0').toString());
    atividades.mover({
      id: atividade.id,
      situacao,
      posicao: Number.isFinite(posicao) ? posicao : 0,
      datas: datasAoMover(atividade, situacao, new Date().toISOString()),
    });
    responder(res, 204, {}, '');
  });
}

function excluirAtividade({ req, res, params, usuario }) {
  const { atividade, erro } = atividadeAcessivel(params, usuario);
  if (erro === 'nao_encontrada') return naoEncontrado(res, usuario);
  if (erro) return foraDaEquipe(res, usuario);

  return comCorpo(req, res, usuario, () => {
    if (!podeExcluirAtividade(usuario, atividade)) {
      return paginaSimples(
        res,
        usuario,
        'Sem permissão',
        `<h1>Só quem criou pode apagar</h1>
         <p>Esta atividade foi criada por outra pessoa. Quem pode apagar é ela,
            ou a coordenação.</p>
         <p><a href="/projetos/${atividade.projeto_id}/atividades">Voltar ao quadro</a></p>`,
        403
      );
    }
    atividades.excluir(atividade.id);
    redirecionar(res, `/projetos/${atividade.projeto_id}/atividades?feito=atividade_apagada`);
  });
}

/* ─── Aprovação de alteração grande (R17) ───────────────────────────── */

function verAprovacoes({ res, url, usuario }) {
  if (!ehAprovador(usuario)) return semPermissaoAprovar(res, usuario);
  const conteudo =
    recadoDaUrl(url) + telaAprovacoes({ pendentes: revisoes.todasAguardando(), usuario });
  paginaSimples(res, usuario, 'Aprovações', conteudo, 200, 'aprovacoes');
}

function aprovarRevisao({ req, res, params, usuario }) {
  return comCorpo(req, res, usuario, () => {
    const revisao = revisoes.porId(params.id);
    if (!revisao) return naoEncontrado(res, usuario);
    const impedimento = porQueNaoPodeAprovar(usuario, revisao);
    if (impedimento) return semPermissaoAprovar(res, usuario, impedimento);

    revisoes.aprovar({ revisaoId: revisao.id, aprovadorId: usuario.id });
    redirecionar(res, `/revisoes/${revisao.id}?feito=aprovada`);
  });
}

function reprovarRevisao({ req, res, params, usuario }) {
  return comCorpo(req, res, usuario, (corpo) => {
    const revisao = revisoes.porId(params.id);
    if (!revisao) return naoEncontrado(res, usuario);
    const impedimento = porQueNaoPodeAprovar(usuario, revisao);
    if (impedimento) return semPermissaoAprovar(res, usuario, impedimento);

    const motivo = (corpo.get('motivo') || '').toString().trim();
    if (!motivo) return redirecionar(res, '/aprovacoes?feito=sem_motivo');

    revisoes.reprovar({ revisaoId: revisao.id, aprovadorId: usuario.id, motivo });
    redirecionar(res, `/revisoes/${revisao.id}?feito=reprovada`);
  });
}

/* ─── Placa de aviso no cadastro (R21) ──────────────────────────────── */

function criarFlag({ req, res, params, usuario }) {
  const projeto = projetos.porId(params.id);
  if (!projeto) return naoEncontrado(res, usuario);
  if (!enxerga(usuario, projeto.id)) return foraDaEquipe(res, usuario);

  return comCorpo(req, res, usuario, (corpo) => {
    flags.criar({
      projetoId: projeto.id,
      usuarioId: usuario.id,
      campo: (corpo.get('campo') || '').toString().trim() || null,
      observacao: (corpo.get('observacao') || '').toString().trim(),
    });
    redirecionar(res, `/projetos/${projeto.id}?feito=flag#ficha`);
  });
}

function resolverFlag({ req, res, params, usuario }) {
  if (!podeCadastrarProjeto(usuario)) return semPermissaoCadastro(res, usuario);
  return comCorpo(req, res, usuario, () => {
    flags.resolver({ flagId: params.flagId, usuarioId: usuario.id });
    redirecionar(res, `/projetos/${params.id}?feito=flag_resolvida#ficha`);
  });
}

/** O "commit": registro de andamento. Não é revisão e não gera aviso. */
function registrarAndamento({ req, res, params, usuario }) {
  const projeto = projetos.porId(params.id);
  if (!projeto) return naoEncontrado(res, usuario);
  if (!enxerga(usuario, projeto.id)) return foraDaEquipe(res, usuario);

  return comCorpo(req, res, usuario, (corpo) => {
    const texto = (campo) => (corpo.get(campo) || '').toString().trim();
    if (!texto('o_que_fiz')) {
      return redirecionar(res, `/projetos/${projeto.id}?feito=andamento_vazio`);
    }
    andamentos.registrar({
      projetoId: projeto.id,
      usuarioId: usuario.id,
      oQueFiz: texto('o_que_fiz'),
      dificuldade: texto('dificuldade'),
      duvida: texto('duvida'),
    });
    redirecionar(res, `/projetos/${projeto.id}?feito=andamento`);
  });
}

function salvarEquipe({ req, res, params, usuario }) {
  if (!podeCadastrarProjeto(usuario)) return semPermissaoCadastro(res, usuario);
  return comCorpo(req, res, usuario, (corpo) => {
    const projeto = projetos.porId(params.id);
    if (!projeto) return naoEncontrado(res, usuario);
    equipes.definir(projeto.id, todosOsValores(corpo, 'equipe'));
    redirecionar(res, `/projetos/${projeto.id}?feito=equipe`);
  });
}

function entrar({ req, res, usuario }) {
  return comCorpo(req, res, usuario, (corpo) => {
    const id = Number(corpo.get('usuario_id'));
    const escolhido = usuarios.porId(id);
    const destino = paraOndeVoltar(caminhoDoReferer(req.headers.referer));
    if (!escolhido) return redirecionar(res, destino);
    // HttpOnly: nenhum JavaScript da página precisa ler quem está logado, e
    // deixar legível só amplia o estrago de um XSS.
    // SameSite=Lax: o cookie não viaja em POST vindo de outro site.
    // Falta Secure — só faz sentido quando o sistema estiver em HTTPS; ver
    // PENDENCIAS.md, item de hospedagem.
    res.setHeader(
      'set-cookie',
      `usuario_id=${escolhido.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
    );
    redirecionar(res, destino);
  });
}

function verProjeto({ res, params, url, usuario }) {
  const projeto = projetos.porId(params.id);
  if (!projeto) return naoEncontrado(res, usuario);
  if (!enxerga(usuario, projeto.id)) return foraDaEquipe(res, usuario);

  const todas = revisoes.doProjeto(projeto.id);
  const vigente = todas.find((r) => r.situacao === 'VIGENTE') ?? null;
  const meuAviso = vigente ? avisos.doUsuarioNaRevisao(usuario.id, vigente.id) : null;

  const conteudo =
    recadoDaUrl(url) +
    telaProjeto({
      projeto,
      vigente,
      anteriores: todas.filter((r) => r.id !== vigente?.id),
      cienciaDaVigente: vigente ? avisos.daRevisao(vigente.id) : [],
      meuAvisoPendente: meuAviso && !meuAviso.confirmado_em ? meuAviso : null,
      podePublicar: podePublicar(usuario),
      incidentes: incidentes.doProjeto(projeto.id),
      equipe: equipes.doProjeto(projeto.id),
      todasAsPessoas: usuarios.todos(),
      podeMexerNaEquipe: podeCadastrarProjeto(usuario),
      andamentos: andamentos.doProjeto(projeto.id),
      usuario,
      projetosDoConjunto: projeto.conjunto ? projetos.doConjunto(projeto.conjunto).length : 0,
      aguardando: revisoes.aguardandoAprovacao(projeto.id) ?? null,
      flagsAbertas: flags.abertasDoProjeto(projeto.id),
      corrigindoCampo: url.searchParams.get('corrigir'),
    });
  paginaSimples(res, usuario, projeto.nome, conteudo, 200, 'projetos');
}

function verRevisao({ res, params, usuario }) {
  const revisao = revisoes.porId(params.id);
  if (!revisao) return naoEncontrado(res, usuario);
  if (!enxerga(usuario, revisao.projeto_id)) return foraDaEquipe(res, usuario);

  // R8 — abrir uma versão que não vale é ação deliberada e fica registrada.
  if (revisao.situacao !== 'VIGENTE') {
    acessos.registrarSemRepetir({ revisaoId: revisao.id, usuarioId: usuario.id });
  }

  const meuAviso = avisos.doUsuarioNaRevisao(usuario.id, revisao.id);
  const conteudo = telaRevisao({
    revisao,
    projeto: projetos.porId(revisao.projeto_id),
    vigente: revisoes.vigenteDoProjeto(revisao.projeto_id) ?? null,
    anterior: revisoes.anteriorA(revisao) ?? null,
    ciencia: avisos.daRevisao(revisao.id),
    meuAvisoPendente: meuAviso && !meuAviso.confirmado_em ? meuAviso : null,
    acessos: acessos.daRevisao(revisao.id),
    podeCancelar: podeCancelar(usuario),
  });
  paginaSimples(res, usuario, `${revisao.projeto_nome} — ${revisao.codigo}`, conteudo, 200, 'projetos');
}

function formularioPublicar({ res, params, usuario }) {
  const projeto = projetos.porId(params.id);
  if (!projeto) return naoEncontrado(res, usuario);
  if (!enxerga(usuario, projeto.id)) return foraDaEquipe(res, usuario);
  if (!podePublicar(usuario)) return semPermissao(res, usuario);

  paginaSimples(
    res,
    usuario,
    'Publicar revisão',
    telaPublicar({
      projeto,
      vigenteAtual: revisoes.vigenteDoProjeto(projeto.id) ?? null,
      codigoSugerido: proximoCodigo(projeto.id),
      seraoAvisados: quemDeveSerAvisado(equipes.doProjeto(projeto.id), usuario),
      erro: null,
    }),
    200,
    'projetos'
  );
}

function publicarRevisao({ req, res, params, usuario }) {
  const projeto = projetos.porId(params.id);
  if (!projeto) return naoEncontrado(res, usuario);
  if (!enxerga(usuario, projeto.id)) return foraDaEquipe(res, usuario);
  if (!podePublicar(usuario)) return semPermissao(res, usuario);

  return comCorpo(req, res, usuario, async (corpo) => {
    const codigo = (corpo.get('codigo') || '').toString().trim();
    const oQueMudou = (corpo.get('o_que_mudou') || '').toString().trim();

    const recusar = (mensagem) =>
      paginaSimples(
        res,
        usuario,
        'Publicar revisão',
        telaPublicar({
          projeto,
          vigenteAtual: revisoes.vigenteDoProjeto(projeto.id) ?? null,
          codigoSugerido: codigo || proximoCodigo(projeto.id),
          seraoAvisados: quemDeveSerAvisado(equipes.doProjeto(projeto.id), usuario),
          erro: mensagem,
        }),
        400,
        'projetos'
      );

    if (!codigo) return recusar('Informe o número da revisão.');
    if (!oQueMudou) return recusar('Escreva o que mudou — é isso que a obra vai ler.');
    if (revisoes.doProjeto(projeto.id).some((r) => r.codigo.toLowerCase() === codigo.toLowerCase())) {
      return recusar(`Já existe uma revisão ${codigo} neste projeto. Use outro número.`);
    }
    // Duas esperando aprovação ao mesmo tempo deixariam ambíguo o que vem
    // depois da vigente — que é justamente o que o sistema evita.
    if (revisoes.aguardandoAprovacao(projeto.id)) {
      return recusar(
        'Já existe uma revisão deste projeto esperando aprovação. Espere o aval antes de publicar outra.'
      );
    }

    const guardado = await guardarArquivo(corpo.get('arquivo'));
    const mudaOrcamentoOuPrazo = Boolean(corpo.get('muda_orcamento_ou_prazo'));

    const novaId = revisoes.publicar({
      projetoId: projeto.id,
      codigo,
      oQueMudou,
      autorId: usuario.id,
      arquivoNome: guardado?.nomeOriginal ?? null,
      arquivoGuardado: guardado?.nomeNoDisco ?? null,
      mudaOrcamentoOuPrazo,
    });

    redirecionar(res, `/revisoes/${novaId}?feito=${mudaOrcamentoOuPrazo ? 'aguardando' : 'publicada'}`);
  });
}

function confirmarCiencia({ req, res, params, usuario }) {
  return comCorpo(req, res, usuario, (corpo) => {
    avisos.confirmar({ revisaoId: params.id, usuarioId: usuario.id });
    const voltar = paraOndeVoltar(corpo.get('voltar_para')?.toString());
    redirecionar(res, `${voltar}${voltar.includes('?') ? '&' : '?'}feito=ciencia`);
  });
}

function cancelarRevisao({ req, res, params, usuario }) {
  if (!podeCancelar(usuario)) return semPermissao(res, usuario);
  return comCorpo(req, res, usuario, (corpo) => {
    const revisao = revisoes.porId(params.id);
    if (!revisao) return naoEncontrado(res, usuario);
    if (!enxerga(usuario, revisao.projeto_id)) return foraDaEquipe(res, usuario);
    revisoes.cancelar({
      revisaoId: revisao.id,
      usuarioId: usuario.id,
      motivo: (corpo.get('motivo') || '').toString().trim(),
    });
    redirecionar(res, `/revisoes/${revisao.id}?feito=cancelada`);
  });
}

function verAvisos({ res, url, usuario }) {
  const todos = avisosVisiveis(usuario);
  const conteudo =
    recadoDaUrl(url) +
    telaAvisos({
      usuario,
      pendentes: maisAntigosPrimeiro(todos.filter((a) => !a.confirmado_em)),
      jaVistos: todos.filter((a) => a.confirmado_em),
    });
  paginaSimples(res, usuario, 'Avisos', conteudo, 200, 'avisos');
}

function verRetrabalho({ res, url, usuario }) {
  // R19 — os números precisam bater com os projetos que a pessoa enxerga.
  const lista = veTodosOsProjetos(usuario)
    ? incidentes.todos()
    : incidentes.dosProjetos(projetos.doUsuario(usuario.id).map((p) => p.id));

  const conteudo =
    recadoDaUrl(url) + telaRetrabalho({ incidentes: lista, resumo: incidentes.resumoDe(lista) });
  paginaSimples(res, usuario, 'Retrabalho', conteudo, 200, 'retrabalho');
}

function formularioIncidente({ res, url, usuario }) {
  const lista = projetosDaPessoa(usuario);
  if (!lista.length) return semProjetos(res, usuario);
  const pedido = Number(url.searchParams.get('projeto_id'));
  const selecionado = lista.some((p) => p.id === pedido) ? pedido : lista[0].id;

  paginaSimples(
    res,
    usuario,
    'Registrar retrabalho',
    telaNovoIncidente({
      projetos: lista,
      projetoSelecionadoId: selecionado,
      revisoes: revisoes.doProjeto(selecionado),
      hoje: new Date().toISOString().slice(0, 10),
      erro: null,
    }),
    200,
    'retrabalho'
  );
}

function registrarIncidente({ req, res, usuario }) {
  return comCorpo(req, res, usuario, (corpo) => {
    const texto = (n) => (corpo.get(n) || '').toString().trim();
    const numero = (n) => (texto(n) === '' ? null : Number(texto(n)));

    const projetoId = Number(texto('projeto_id'));
    const oQue = texto('o_que_aconteceu');
    const dia = texto('ocorrido_em');

    if (!projetos.porId(projetoId) || !enxerga(usuario, projetoId) || !oQue || !dia) {
      const lista = projetosDaPessoa(usuario);
      if (!lista.length) return semProjetos(res, usuario);
      return paginaSimples(
        res,
        usuario,
        'Registrar retrabalho',
        telaNovoIncidente({
          projetos: lista,
          projetoSelecionadoId: projetoId || lista[0].id,
          revisoes: revisoes.doProjeto(projetoId || lista[0].id),
          hoje: dia || new Date().toISOString().slice(0, 10),
          erro: 'Preencha o projeto, a data e o que aconteceu.',
        }),
        400,
        'retrabalho'
      );
    }

    incidentes.registrar({
      projetoId,
      revisaoUsadaId: numero('revisao_usada_id'),
      ocorridoEm: new Date(`${dia}T12:00:00-03:00`).toISOString(),
      oQueAconteceu: oQue,
      custoEstimado: numero('custo_estimado'),
      horasRefazendo: numero('horas_refazendo'),
      registradoPor: usuario.id,
    });
    redirecionar(res, '/retrabalho?feito=incidente');
  });
}

/* ─── Arquivos (R1, R8) ─────────────────────────────────────────────── */

const TIPOS = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.txt': 'text/plain; charset=utf-8',
  '.dwg': 'application/acad',
  '.dxf': 'application/dxf',
  '.ifc': 'application/octet-stream',
  '.zip': 'application/zip',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

/** O que pode ser exibido dentro do navegador. O resto é baixado. */
const ABRIR_NA_TELA = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.txt']);

function baixarArquivo({ res, params, usuario }) {
  const revisao = revisoes.porId(params.id);
  if (!revisao || !revisao.arquivo_guardado) return naoEncontrado(res, usuario);
  if (!enxerga(usuario, revisao.projeto_id)) return foraDaEquipe(res, usuario);

  // R6 — sem confirmar que viu a mudança, o arquivo não abre. A verificação
  // é aqui no servidor, não só escondendo o botão.
  const meuAviso = avisos.doUsuarioNaRevisao(usuario.id, revisao.id);
  if (!podeAbrirArquivo(meuAviso)) return arquivoTravado(res, usuario, revisao);

  // R8 — baixar uma versão que não é a vigente também é acesso, e fica registrado.
  if (revisao.situacao !== 'VIGENTE') {
    acessos.registrarSemRepetir({ revisaoId: revisao.id, usuarioId: usuario.id });
  }

  const caminho = path.join(PASTA_ARQUIVOS, path.basename(revisao.arquivo_guardado));
  if (!fs.existsSync(caminho)) return naoEncontrado(res, usuario);

  // Só abre no navegador o que sabemos ser seguro exibir. Qualquer outra
  // coisa vira download, para um arquivo enviado nunca virar página do
  // sistema. Junto com o nosniff, fecha o caminho de upload malicioso.
  const extensao = path.extname(revisao.arquivo_nome || caminho).toLowerCase();
  const tipo = TIPOS[extensao] ?? 'application/octet-stream';
  const abreNaTela = ABRIR_NA_TELA.has(extensao);

  res.writeHead(200, {
    ...CABECALHOS_DE_SEGURANCA,
    'content-type': tipo,
    'content-disposition': `${abreNaTela ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(
      revisao.arquivo_nome
    )}`,
  });
  fs.createReadStream(caminho).pipe(res);
}

async function servirEstatico(caminho, res) {
  if (caminho.includes('..') || caminho === '/') return false;
  const alvo = path.join(PASTA_PUBLICA, caminho);
  if (!alvo.startsWith(PASTA_PUBLICA) || !fs.existsSync(alvo) || !fs.statSync(alvo).isFile()) return false;
  res.writeHead(200, { 'content-type': TIPOS[path.extname(alvo).toLowerCase()] ?? 'application/octet-stream' });
  fs.createReadStream(alvo).pipe(res);
  return true;
}

/* ─── Encanamento ───────────────────────────────────────────────────── */

function casar(padrao, caminho) {
  const p = padrao.split('/').filter(Boolean);
  const c = caminho.split('/').filter(Boolean);
  if (p.length !== c.length) return null;
  const params = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(':')) params[p[i].slice(1)] = c[i];
    else if (p[i] !== c[i]) return null;
  }
  return params;
}

/** No protótipo não há senha: a sessão é só quem está "entrando como" (R9). */
function usuarioDaSessao(req) {
  const bruto = req.headers.cookie || '';
  let id = null;
  for (const parte of bruto.split(';')) {
    const i = parte.indexOf('=');
    if (i > 0 && parte.slice(0, i).trim() === 'usuario_id') id = Number(parte.slice(i + 1).trim());
  }
  return usuarios.porId(id) ?? usuarios.todos()[0];
}

/** Lê o corpo do POST. Aceita formulário comum e formulário com arquivo. */
async function lerCorpo(req) {
  const limite = LIMITE_ARQUIVO_MB * 1024 * 1024;
  const pedacos = [];
  let total = 0;
  for await (const pedaco of req) {
    total += pedaco.length;
    if (total > limite) throw new Error(`Arquivo acima de ${LIMITE_ARQUIVO_MB} MB.`);
    pedacos.push(pedaco);
  }
  const corpo = Buffer.concat(pedacos);
  const tipo = req.headers['content-type'] || '';
  if (tipo.startsWith('multipart/form-data')) {
    return await new Response(corpo, { headers: { 'content-type': tipo } }).formData();
  }
  return new URLSearchParams(corpo.toString('utf8'));
}

async function comCorpo(req, res, usuario, acao) {
  try {
    const corpo = await lerCorpo(req);
    return await acao(corpo);
  } catch (erro) {
    return paginaSimples(
      res,
      usuario,
      'Não deu certo',
      `<h1>Não deu para concluir</h1><p>${esc(erro.message)}</p><p><a href="/">Voltar</a></p>`,
      400
    );
  }
}

async function guardarArquivo(arquivo) {
  if (!arquivo || typeof arquivo === 'string' || !arquivo.size) return null;
  const nomeOriginal = arquivo.name || 'arquivo';
  const nomeNoDisco = `${crypto.randomUUID()}${path.extname(nomeOriginal)}`;
  fs.writeFileSync(path.join(PASTA_ARQUIVOS, nomeNoDisco), Buffer.from(await arquivo.arrayBuffer()));
  return { nomeOriginal, nomeNoDisco };
}

/** Sugere R00, R01, R02… a partir do que já existe no projeto. */
function proximoCodigo(projetoId) {
  const numeros = revisoes
    .doProjeto(projetoId)
    .map((r) => Number(String(r.codigo).replace(/\D/g, '')))
    .filter((n) => Number.isFinite(n));
  const proximo = numeros.length ? Math.max(...numeros) + 1 : 0;
  return `R${String(proximo).padStart(2, '0')}`;
}

/* ─── Visibilidade (R19) ────────────────────────────────────────────── */

/** A pessoa está na equipe do projeto — ou é quem enxerga a empresa toda. */
function enxerga(usuario, projetoId) {
  return podeVerProjeto(usuario, equipes.contem(projetoId, usuario.id));
}

function projetosDaPessoa(usuario) {
  return veTodosOsProjetos(usuario) ? projetos.todos() : projetos.doUsuario(usuario.id);
}

function projetosVisiveis(usuario) {
  return veTodosOsProjetos(usuario)
    ? projetos.todosComVigente()
    : projetos.doUsuarioComVigente(usuario.id);
}

/**
 * Avisos de projetos em que a pessoa ainda está. Se ela saiu da equipe, o
 * aviso antigo some da caixa dela — mas o registro de ciência continua no
 * histórico do projeto, que é o que importa para o R6.
 */
function avisosVisiveis(usuario, opcoes = {}) {
  const todos = avisos.doUsuario(usuario.id, opcoes);
  if (veTodosOsProjetos(usuario)) return todos;
  const meus = new Set(projetos.doUsuario(usuario.id).map((p) => p.id));
  return todos.filter((a) => meus.has(a.projeto_id));
}

/** Checkboxes de equipe chegam repetidos com o mesmo nome. */
function todosOsValores(corpo, campo) {
  return typeof corpo.getAll === 'function' ? corpo.getAll(campo).map(String) : [];
}

/**
 * O aviso mais antigo sem confirmação é o mais perigoso: é o que já teve
 * tempo de virar serviço executado na versão errada. Ele vem primeiro.
 */
function maisAntigosPrimeiro(lista) {
  return [...lista].sort((a, b) => a.enviado_em.localeCompare(b.enviado_em));
}

/** Só aceita voltar para dentro do próprio sistema. */
function paraOndeVoltar(valor) {
  if (typeof valor === 'string' && valor.startsWith('/') && !valor.startsWith('//')) return valor;
  return '/';
}

/** Trocar de pessoa mantém você na mesma tela (sem repetir o recado da ação anterior). */
function caminhoDoReferer(referer) {
  try {
    return new URL(referer).pathname;
  } catch {
    return '/';
  }
}

const RECADOS = {
  publicada: ['Revisão publicada. A equipe do projeto já foi avisada.', 'ok'],
  ciencia: ['Ciência confirmada. Ficou registrado que você viu.', 'ok'],
  cancelada: ['Versão marcada como cancelada.', 'alerta'],
  incidente: ['Caso de retrabalho registrado.', 'ok'],
  projeto: ['Projeto cadastrado. A equipe marcada já enxerga ele.', 'ok'],
  equipe: ['Equipe atualizada.', 'ok'],
  cadastro: ['Cadastro corrigido.', 'ok'],
  andamento: ['Andamento registrado.', 'ok'],
  andamento_vazio: ['Escreva o que você fez para registrar o andamento.', 'erro'],
  aguardando: [
    'Publicada e enviada para aprovação. Ela ainda não vale — a equipe será avisada quando o aval sair.',
    'alerta',
  ],
  aprovada: ['Aprovada. Passou a valer e a equipe do projeto já foi avisada.', 'ok'],
  reprovada: ['Não aprovada. A versão anterior continua valendo.', 'alerta'],
  sem_motivo: ['Escreva o motivo para não aprovar.', 'erro'],
  flag: ['A coordenação foi avisada de que este campo está errado.', 'ok'],
  flag_resolvida: ['Aviso encerrado.', 'ok'],
  atividade: ['Atividade acrescentada ao quadro.', 'ok'],
  atividade_salva: ['Atividade atualizada.', 'ok'],
  atividade_apagada: ['Atividade apagada.', 'alerta'],
  atividade_sem_nome: ['Escreva o que precisa ser feito.', 'erro'],
};

function recadoDaUrl(url) {
  const chave = url.searchParams.get('feito');
  const encontrado = RECADOS[chave];
  return encontrado ? recado(encontrado[0], encontrado[1]) : '';
}

function paginaSimples(res, usuario, titulo, conteudo, status = 200, ativo = '') {
  const corpo = pagina({
    titulo,
    usuario,
    todosUsuarios: usuarios.todos(),
    pendentes: usuario ? avisos.contarPendentes(usuario.id) : 0,
    conteudo,
    ativo,
    ehAprovador: ehAprovador(usuario),
    aprovacoesPendentes: ehAprovador(usuario) ? revisoes.todasAguardando().length : 0,
  });
  responder(res, status, { 'content-type': 'text/html; charset=utf-8' }, corpo);
}

function semPermissaoAprovar(res, usuario, motivo) {
  paginaSimples(
    res,
    usuario,
    'Sem permissão',
    `<h1>Você não pode aprovar esta revisão</h1>
     <p>${esc(motivo ?? 'Aprovar alteração grande é atribuição da direção e da coordenação de contratos.')}</p>
     <p><a href="/">Voltar para os projetos</a></p>`,
    403
  );
}

function naoEncontrado(res, usuario) {
  paginaSimples(res, usuario, 'Não encontrado', `<h1>Não encontrado</h1><p><a href="/">Voltar</a></p>`, 404);
}

function semPermissao(res, usuario) {
  paginaSimples(
    res,
    usuario,
    'Sem permissão',
    `<h1>Isso não é do seu papel</h1>
     <p>Publicar e cancelar revisões é atribuição de quem projeta (engenharia e arquitetura).</p>
     <p><a href="/">Voltar para os projetos</a></p>`,
    403
  );
}

function semPermissaoCadastro(res, usuario) {
  paginaSimples(
    res,
    usuario,
    'Sem permissão',
    `<h1>Isso é da coordenação</h1>
     <p>Cadastrar projeto e definir quem trabalha nele é atribuição da coordenação de
        contratos e da direção.</p>
     <p><a href="/">Voltar para os projetos</a></p>`,
    403
  );
}

/** R19 — a pessoa não está na equipe deste projeto. */
function foraDaEquipe(res, usuario) {
  paginaSimples(
    res,
    usuario,
    'Projeto de outra equipe',
    `<h1>Este projeto não é seu</h1>
     <p>Você não está na equipe deste projeto, por isso ele não aparece para você.
        Se precisar acompanhá-lo, peça à coordenação para incluir seu nome.</p>
     <p><a href="/">Voltar para os seus projetos</a></p>`,
    403
  );
}

/** R6 — arquivo bloqueado por falta de ciência. Oferece o caminho: confirmar. */
function arquivoTravado(res, usuario, revisao) {
  paginaSimples(
    res,
    usuario,
    'Confirme antes de abrir',
    `<h1>Confirme que você viu a mudança</h1>
     <p>O arquivo da ${esc(revisao.codigo)} de <strong>${esc(revisao.projeto_nome)}</strong>
        fica bloqueado até você confirmar que viu o que mudou.</p>
     <section class="bloco bloco-atencao">
       <p class="bloco-rotulo">O que mudou nesta versão</p>
       <p class="mudanca">${esc(revisao.o_que_mudou)}</p>
     </section>
     <form method="post" action="/revisoes/${revisao.id}/confirmar">
       <input type="hidden" name="voltar_para" value="/revisoes/${revisao.id}">
       <button class="botao botao-confirmar" type="submit">Confirmo que vi a ${esc(revisao.codigo)}</button>
     </form>
     <p><a href="/revisoes/${revisao.id}">Ver a revisão inteira antes de confirmar</a></p>`,
    403,
    'projetos'
  );
}

function semProjetos(res, usuario) {
  paginaSimples(
    res,
    usuario,
    'Sem projetos',
    `<h1>Você ainda não está em nenhum projeto</h1>
     <p>Fale com a coordenação para entrar na equipe de uma obra.</p>
     <p><a href="/">Voltar</a></p>`,
    200
  );
}

/* Cabeçalhos que valem para toda resposta.
 * nosniff: impede o navegador de "adivinhar" que um arquivo enviado é HTML
 *   e executá-lo — o que transformaria um upload numa página do sistema.
 * DENY: ninguém põe o sistema dentro de um iframe para enganar quem clica. */
const CABECALHOS_DE_SEGURANCA = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'same-origin',
};

function responder(res, status, cabecalhos, corpo) {
  res.writeHead(status, { ...CABECALHOS_DE_SEGURANCA, ...cabecalhos });
  res.end(corpo);
}

function redirecionar(res, destino) {
  res.writeHead(303, { location: destino });
  res.end();
}
