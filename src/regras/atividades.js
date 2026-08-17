/* ══════════════════════════════════════════════════════════════════════
 * QUADRO DE ATIVIDADES
 *
 * Pedido pela coordenação: acompanhar o que está sendo feito em cada obra,
 * num quadro de colunas, com quem está fazendo e desde quando.
 *
 * ⚠️ Isto é gestão de tarefas — que o documento original pôs fora de
 *   escopo. Entrou por decisão posterior. Está numa aba própria, e não na
 *   tela do projeto, de propósito: a pergunta "o que vale agora neste
 *   projeto?" não pode dividir espaço com um quadro de tarefas, senão o
 *   sistema deixa de responder rápido aquilo para que existe.
 *
 * Mover um cartão não muda orientação nenhuma, não gera aviso e não exige
 * ciência: o quadro acompanha o trabalho; a informação do projeto mora
 * nas orientações.
 * ══════════════════════════════════════════════════════════════════════ */

import { PAPEIS } from './papeis.js';

/** As colunas do quadro, na ordem em que aparecem. */
export const COLUNAS = {
  NAO_INICIADO: { rotulo: 'Não iniciado', classe: 'coluna-parada' },
  EM_EXECUCAO: { rotulo: 'Em execução', classe: 'coluna-andando' },
  // "Revisão" aqui é conferir o serviço feito — não a revisão de arquivo
  // do modelo antigo, que deixou de existir no pivô.
  REVISAO: { rotulo: 'Revisão', classe: 'coluna-revisao' },
  FINALIZADO: { rotulo: 'Finalizado', classe: 'coluna-pronta' },
};

export const COLUNA_INICIAL = 'NAO_INICIADO';
export const ORDEM_DAS_COLUNAS = Object.keys(COLUNAS);

export function rotuloDaColuna(situacao) {
  return COLUNAS[situacao]?.rotulo ?? situacao;
}

export function colunaValida(valor) {
  return COLUNAS[valor] ? valor : COLUNA_INICIAL;
}

/**
 * Quem mexe no quadro: qualquer pessoa da equipe do projeto.
 *
 * Não faz sentido restringir — quem está tocando a atividade é quem sabe
 * que ela mudou de estado, e pedir que outra pessoa mova por ela é o tipo
 * de atrito que faz o quadro ficar desatualizado e virar mentira.
 * A restrição de equipe vem do R19, aplicada no roteador.
 */
export function podeMexerNoQuadro(usuario) {
  return Boolean(usuario);
}

/**
 * Apagar é diferente de mover: some com o registro. Só quem criou a
 * atividade, ou quem coordena, pode.
 */
export function podeExcluirAtividade(usuario, atividade) {
  if (!usuario) return false;
  if (PAPEIS[usuario.papel]?.aprova) return true; // coordenação e direção
  return atividade.criada_por === usuario.id;
}

/**
 * Datas que o sistema preenche sozinho ao mover o cartão, para ninguém
 * precisar digitar data — que é o campo que mais fica errado.
 *
 * - entrou em execução pela primeira vez → marca o início;
 * - chegou em finalizado → marca o fim;
 * - saiu de finalizado → apaga o fim, senão a data mente.
 *
 * @returns {{iniciada_em?: string|null, finalizada_em?: string|null}}
 */
export function datasAoMover(atividade, novaSituacao, agora) {
  const mudancas = {};

  if (novaSituacao !== 'NAO_INICIADO' && !atividade.iniciada_em) {
    mudancas.iniciada_em = agora;
  }
  if (novaSituacao === 'FINALIZADO' && !atividade.finalizada_em) {
    mudancas.finalizada_em = agora;
  }
  if (novaSituacao !== 'FINALIZADO' && atividade.finalizada_em) {
    mudancas.finalizada_em = null;
  }
  return mudancas;
}
