/* ══════════════════════════════════════════════════════════════════════
 * R5 — QUEM É AVISADO QUANDO UMA VERSÃO É PUBLICADA
 *
 * Regra atual: avisa a EQUIPE DO PROJETO, menos quem publicou.
 *
 * A equipe é a mesma lista que decide quem vê o projeto (ver
 * visibilidade.js), montada pela coordenação no cadastro. Uma lista só,
 * dois usos — assim é impossível alguém enxergar um projeto e não ser
 * avisado quando ele muda, ou receber aviso de obra que não é sua.
 *
 * Ninguém escolhe destinatário na hora de publicar: escolher a cada
 * publicação é mais um clique e mais uma chance de errar, e errar aqui é
 * exatamente a falha que custou a pavimentação.
 *
 * ⚑ Falta definir por qual CANAL o aviso sai. Hoje ele só aparece dentro
 *   do sistema. Ficou decidido que também deve sair por e-mail da Promav
 *   com modelo padrão (R18) — ainda não construído.
 *
 * Para mudar quem é avisado, mexa APENAS em `quemDeveSerAvisado`.
 * ══════════════════════════════════════════════════════════════════════ */

/**
 * @param {{id:number, papel:string}[]} equipeDoProjeto
 * @param {{id:number}} quemPublicou
 * @returns {{id:number}[]} pessoas que recebem o aviso desta publicação
 */
export function quemDeveSerAvisado(equipeDoProjeto, quemPublicou) {
  return equipeDoProjeto.filter((u) => u.id !== quemPublicou.id);
}
