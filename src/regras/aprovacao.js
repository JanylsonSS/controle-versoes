/* ══════════════════════════════════════════════════════════════════════
 * R17 — APROVAÇÃO DE ALTERAÇÃO GRANDE
 *
 * Definição da coordenação (06/08/2026): grande é a orientação que
 * **muda orçamento ou muda prazo**.
 *
 * Por isso não existe classificação de níveis na tela: existe uma
 * pergunta só, respondida por quem publica. Uma pergunta é um clique;
 * três níveis são uma decisão, e decisão a cada publicação é atrito —
 * e atrito é o que faz a equipe voltar para o WhatsApp (R13).
 *
 * ── Mudança de 13/08/2026: o aval não é mais um portão ───────────────
 * Antes, a orientação ficava parada esperando aprovação e ninguém era
 * avisado. Agora a orientação vale desde que é publicada: a atividade
 * nasce e a equipe é avisada na hora.
 *
 * A aprovação virou **registro em paralelo** — a orientação que mexe em
 * orçamento ou prazo entra numa fila para o CEO ou a coordenação
 * registrar o aval (ou negar, com motivo). O trabalho não espera.
 *
 * Consequência que vale saber: dá para o serviço começar e o aval vir
 * depois, ou não vir. Foi decisão de 13/08/2026, para o quadro de
 * atividades não ficar travado esperando assinatura.
 * ══════════════════════════════════════════════════════════════════════ */

import { podeAprovar } from './papeis.js';

/**
 * Quem pode dar o aval: CEO e coordenação de contratos.
 * É a regra de `podeAprovar` (papeis.js), com o nome que as rotas usam.
 */
export function ehAprovador(usuario) {
  return podeAprovar(usuario);
}

/**
 * Ninguém aprova a própria orientação.
 *
 * Como a coordenação agora também publica, sem esta regra a Thayna
 * poderia publicar uma mudança de orçamento e aprová-la sozinha — o que
 * esvazia a aprovação. Quando isso acontecer, quem aprova é o outro.
 *
 * Devolve o PORQUÊ (texto para a tela explicar em vez de só recusar),
 * ou null quando a pessoa pode aprovar.
 */
export function porQueNaoPodeAprovar(usuario, orientacao) {
  if (!ehAprovador(usuario)) {
    return 'Aprovar alteração grande é atribuição da direção e da coordenação de contratos.';
  }
  if (orientacao.publicada_por === usuario.id) {
    return 'Você publicou esta orientação, então quem aprova é a outra pessoa com essa atribuição.';
  }
  return null;
}
