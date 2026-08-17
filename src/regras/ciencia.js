/* ══════════════════════════════════════════════════════════════════════
 * R6 — CONFIRMAÇÃO DE CIÊNCIA
 *
 * Quem recebe uma orientação confirma que viu. Fica registrado quem e
 * quando, e a tela mostra quem ainda falta.
 *
 * ── Mudança de 13/08/2026 ────────────────────────────────────────────
 * Confirmar deixou de BLOQUEAR. Antes, o arquivo da mudança só abria
 * depois da confirmação; como o sistema não guarda mais arquivo e a
 * orientação já vira atividade na hora, travar não faz mais sentido —
 * atrasaria o trabalho sem proteger nada.
 *
 * O que sobrou é o que sempre importou: o registro. Ele responde ao "eu
 * não fui avisado" sem impedir ninguém de trabalhar.
 *
 * Uma orientação editada reabre a ciência de todos: se o texto mudou,
 * "eu vi" não significa mais a mesma coisa (ver repositorio.js).
 * ══════════════════════════════════════════════════════════════════════ */

/** A partir de quantos dias sem confirmar o aviso é destacado como atrasado. */
export const DIAS_PARA_COBRAR_CIENCIA = 2;

function diasDesde(iso, agora = new Date()) {
  return Math.floor((agora.getTime() - new Date(iso).getTime()) / 86400000);
}

/**
 * Um aviso está atrasado quando passou do prazo sem confirmação.
 * @param {{enviado_em:string, confirmado_em:string|null}} aviso
 */
export function estaAtrasado(aviso, agora = new Date()) {
  if (aviso.confirmado_em) return false;
  return diasDesde(aviso.enviado_em, agora) >= DIAS_PARA_COBRAR_CIENCIA;
}
