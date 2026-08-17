/* ══════════════════════════════════════════════════════════════════════
 * R5 — QUEM É AVISADO QUANDO UMA ORIENTAÇÃO É PUBLICADA
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

/**
 * Agenda, decisão de 17/08/2026 (substitui o portão "só coordenação e
 * direção marcam para os outros"): TODOS marcam reunião e visita, para
 * quantas pessoas participarem. O controle virou transparência — quando
 * nem o criador nem participante algum é da coordenação, ela é incluída
 * automaticamente no compromisso: entra no calendário dela e nas
 * notificações ("marcaram para você"), com a marca de automática.
 *
 * @param {{id:number, papel:string}} criador
 * @param {number[]} participanteIds
 * @param {{id:number, papel:string}[]} todasAsPessoas
 * @returns {{id:number}[]} quem da coordenação ganha a linha automática
 */
export function coordenacaoAIncluir(criador, participanteIds, todasAsPessoas) {
  const envolvidos = new Set([Number(criador.id), ...participanteIds.map(Number)]);
  const coordenacao = todasAsPessoas.filter((u) => u.papel === 'COORDENACAO');
  if (coordenacao.some((u) => envolvidos.has(u.id))) return [];
  return coordenacao;
}
