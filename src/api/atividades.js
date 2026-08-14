/* ══════════════════════════════════════════════════════════════════════
 * QUADRO DE ATIVIDADES, agora por JSON.
 *
 * As regras não mudaram: qualquer pessoa da equipe cria e move; apagar é
 * de quem criou ou da coordenação; as datas de início e fim são do
 * sistema, nunca digitadas. Atividade vinda de orientação carrega
 * `orientacao_id` — o frontend mostra o vínculo.
 * ══════════════════════════════════════════════════════════════════════ */

import { atividades, andamentos, equipes, usuarios } from '../persistencia/repositorio.js';
import {
  COLUNAS, datasAoMover, podeExcluirAtividade, COLUNA_INICIAL, ORDEM_DAS_COLUNAS,
} from '../regras/atividades.js';
import { exigir, texto, textoOpcional } from './http.js';
import { projetoVisivel, atividadeVisivel } from './guardas.js';

function responsavelValido(corpo, projetoId) {
  const id = corpo.responsavel_id == null || corpo.responsavel_id === ''
    ? null
    : Number(corpo.responsavel_id);
  if (id === null) return null;
  exigir(usuarios.porId(id), 400, 'O responsável indicado não existe.');
  exigir(equipes.contem(projetoId, id), 400, 'O responsável precisa estar na equipe do projeto.');
  return id;
}

/**
 * Coluna vinda do cliente: precisa ser uma das quatro, dito com todas as
 * letras. Cair num padrão silencioso aqui já causou perda de dados — um
 * mover sem `situacao` arrastava o cartão para "não iniciado" e apagava a
 * data de conclusão.
 */
function colunaExigida(valor, mensagem) {
  const pedido = valor == null || valor === '' ? null : String(valor);
  exigir(pedido === null || COLUNAS[pedido], 400,
    mensagem ?? `Coluna desconhecida. Use uma destas: ${ORDEM_DAS_COLUNAS.join(', ')}.`);
  return pedido;
}

/** A decisão de poder apagar vai pronta em cada cartão — o front não
 * reimplementa a regra, e o botão certo aparece para a pessoa certa. */
const paraTela = (usuario) => (a) => ({ ...a, pode_excluir: podeExcluirAtividade(usuario, a) });

export const rotasDeAtividades = [
  ['GET', '/api/projetos/:id/atividades', ({ usuario, params }) => {
    const projeto = projetoVisivel(usuario, params.id);
    return {
      colunas: ORDEM_DAS_COLUNAS.map((codigo) => ({ codigo, rotulo: COLUNAS[codigo].rotulo })),
      atividades: atividades.doProjeto(projeto.id).map(paraTela(usuario)),
    };
  }],

  ['POST', '/api/projetos/:id/atividades', ({ usuario, params, corpo }) => {
    const projeto = projetoVisivel(usuario, params.id);
    const id = atividades.criar({
      projetoId: projeto.id,
      nome: texto(corpo, 'nome', 'Escreva o que precisa ser feito.'),
      descricao: textoOpcional(corpo, 'descricao'),
      responsavelId: responsavelValido(corpo, projeto.id),
      situacao: colunaExigida(corpo.situacao) ?? COLUNA_INICIAL,
      criadaPor: usuario.id,
    });
    return { id };
  }],

  /* PATCH parcial de verdade: campo ausente fica como está; limpar é
   * mandar null (ou vazio) explícito. Sem isso, renomear um cartão
   * desmarcava o responsável e apagava a descrição em silêncio. */
  ['PATCH', '/api/atividades/:id', ({ usuario, params, corpo }) => {
    const atividade = atividadeVisivel(usuario, params.id);

    atividades.atualizar(atividade.id, {
      nome: 'nome' in corpo
        ? texto(corpo, 'nome', 'A atividade precisa de um nome.')
        : atividade.nome,
      descricao: 'descricao' in corpo ? textoOpcional(corpo, 'descricao') : atividade.descricao,
      responsavelId: 'responsavel_id' in corpo
        ? responsavelValido(corpo, atividade.projeto_id)
        : atividade.responsavel_id,
    });

    // Mudar de coluna pelo formulário de edição (quem não arrasta).
    if ('situacao' in corpo) {
      const situacao = colunaExigida(corpo.situacao) ?? atividade.situacao;
      if (situacao !== atividade.situacao) {
        atividades.mover({
          id: atividade.id,
          situacao,
          posicao: Number.MAX_SAFE_INTEGER,
          datas: datasAoMover(atividade, situacao, new Date().toISOString()),
        });
      }
    }
    return { atividade: paraTela(usuario)(atividades.porId(atividade.id)) };
  }],

  /* O arrastar do quadro chama isto. A coluna é obrigatória. */
  ['POST', '/api/atividades/:id/mover', ({ usuario, params, corpo }) => {
    const atividade = atividadeVisivel(usuario, params.id);
    const situacao = colunaExigida(corpo.situacao, 'Diga para qual coluna o cartão vai.');
    exigir(situacao !== null, 400, 'Diga para qual coluna o cartão vai.');
    const posicao = Number(corpo.posicao);
    atividades.mover({
      id: atividade.id,
      situacao,
      posicao: Number.isFinite(posicao) ? posicao : 0,
      datas: datasAoMover(atividade, situacao, new Date().toISOString()),
    });
    return { atividade: paraTela(usuario)(atividades.porId(atividade.id)) };
  }],

  ['DELETE', '/api/atividades/:id', ({ usuario, params }) => {
    const atividade = atividadeVisivel(usuario, params.id);
    exigir(podeExcluirAtividade(usuario, atividade), 403,
      'Só quem criou a atividade, ou a coordenação, pode apagá-la.');
    atividades.excluir(atividade.id);
    return { ok: true };
  }],

  /* Andamento do trabalho: o "commit". Continua separado do quadro. */
  ['GET', '/api/projetos/:id/andamentos', ({ usuario, params }) => {
    const projeto = projetoVisivel(usuario, params.id);
    return { andamentos: andamentos.doProjeto(projeto.id) };
  }],

  ['POST', '/api/projetos/:id/andamentos', ({ usuario, params, corpo }) => {
    const projeto = projetoVisivel(usuario, params.id);
    const id = andamentos.registrar({
      projetoId: projeto.id,
      usuarioId: usuario.id,
      oQueFiz: texto(corpo, 'o_que_fiz', 'Escreva o que você fez.'),
      dificuldade: textoOpcional(corpo, 'dificuldade'),
      duvida: textoOpcional(corpo, 'duvida'),
    });
    return { id };
  }],
];
