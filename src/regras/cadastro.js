/* ══════════════════════════════════════════════════════════════════════
 * VOCABULÁRIO DO CADASTRO DE PROJETO
 *
 * Situação e tipo de obra, definidos pela coordenação em 06/08/2026.
 * Ficam aqui, e não espalhados pelas telas, porque são as palavras que a
 * empresa usa — e palavra de empresa muda.
 * ══════════════════════════════════════════════════════════════════════ */

/**
 * Situação da obra — em que pé o contrato está, nas palavras da empresa.
 *
 * `ativa` decide se o projeto aparece na listagem normal: obra concluída
 * ou parada só aparece quando alguém pede para ver.
 */
export const SITUACOES = {
  EM_PROJETO: { rotulo: 'Em projeto', ativa: true },
  EM_EXECUCAO: { rotulo: 'Em execução', ativa: true },
  CONCLUIDA: { rotulo: 'Concluída', ativa: false },
  PARADA: { rotulo: 'Parada', ativa: false },
};

export const SITUACAO_PADRAO = 'EM_PROJETO';

export const TIPOS = {
  PAVIMENTACAO: 'Pavimentação',
  EDIFICACAO: 'Edificação',
  REFORMA: 'Reforma',
  OUTRO: 'Outro',
};

export const TIPO_PADRAO = 'OUTRO';

export function rotuloDaSituacao(situacao) {
  return SITUACOES[situacao]?.rotulo ?? situacao ?? '—';
}

export function rotuloDoTipo(tipo) {
  return TIPOS[tipo] ?? tipo ?? '—';
}

export function ehAtiva(situacao) {
  return SITUACOES[situacao]?.ativa ?? true;
}

/** Aceita só valores conhecidos; qualquer outra coisa cai no padrão. */
export function situacaoValida(valor) {
  return SITUACOES[valor] ? valor : SITUACAO_PADRAO;
}

export function tipoValido(valor) {
  return TIPOS[valor] ? valor : TIPO_PADRAO;
}
