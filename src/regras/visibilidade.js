/* ══════════════════════════════════════════════════════════════════════
 * R19 — QUEM VÊ QUAL PROJETO
 *
 * Regra decidida com a direção: a coordenação cadastra o projeto e liga
 * a ele as pessoas que vão trabalhar nele. Cada um vê apenas os projetos
 * em que está na equipe.
 *
 * Duas exceções, e são decisão minha (ver PENDENCIAS.md):
 *   - a coordenação vê todos, porque é quem monta as equipes — não teria
 *     como cadastrar um projeto que ela mesma não enxerga;
 *   - a direção vê todos, porque responde pela empresa inteira.
 *
 * Esta mesma equipe define quem recebe aviso quando o projeto muda
 * (ver notificacao.js). Uma lista só, dois usos: assim é impossível
 * alguém ver um projeto e não ser avisado dele, ou o contrário.
 *
 * Para mudar a regra, mexa APENAS neste arquivo.
 * ══════════════════════════════════════════════════════════════════════ */

import { PAPEIS } from './papeis.js';

/** Quem enxerga a empresa inteira, independente de equipe. */
export function veTodosOsProjetos(usuario) {
  return Boolean(usuario && PAPEIS[usuario.papel]?.aprova);
}

/**
 * @param {object} usuario
 * @param {boolean} estaNaEquipe se a pessoa está ligada àquele projeto
 */
export function podeVerProjeto(usuario, estaNaEquipe) {
  return veTodosOsProjetos(usuario) || Boolean(estaNaEquipe);
}
