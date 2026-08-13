import { esc, dataHora, haQuantoTempo } from '../html.js';
import { estaAtrasado } from '../../regras/ciencia.js';

/**
 * MEUS AVISOS — R5 (o aviso chegou) e R6 (eu confirmo que vi).
 *
 * Um botão por aviso, direto na lista: confirmar não deve custar uma
 * navegação. Quem quiser ver o que mudou antes, clica no título.
 */
export function telaAvisos({ pendentes, jaVistos, usuario }) {
  return `
  <h1>Avisos de versão nova</h1>
  <p class="ajuda">Para ${esc(usuario.nome)}.</p>

  <section class="secao">
    <h3>Esperando você confirmar</h3>
    ${
      pendentes.length
        ? `<ul class="lista-avisos lista-avisos-grande">${pendentes.map(cartaoAviso).join('')}</ul>`
        : `<p class="vazio">Nada pendente. Você viu todas as versões novas.</p>`
    }
  </section>

  <section class="secao">
    <h3>Já confirmados</h3>
    ${
      jaVistos.length
        ? `<ul class="lista-avisos">${jaVistos
            .map(
              (a) => `<li>
                <a href="/revisoes/${a.revisao_id}">
                  <strong>${esc(a.projeto_nome)}</strong> — ${esc(a.revisao_codigo)}
                </a>
                <span class="quando">Confirmado em ${esc(dataHora(a.confirmado_em))}</span>
              </li>`
            )
            .join('')}</ul>`
        : `<p class="vazio">Nenhum ainda.</p>`
    }
  </section>`;
}

function cartaoAviso(a) {
  const atrasado = estaAtrasado(a);
  return `
  <li class="aviso-cartao ${atrasado ? 'atrasado' : ''}">
    <a class="aviso-titulo" href="/revisoes/${a.revisao_id}">
      <strong>${esc(a.projeto_nome)}</strong>
      <span>passou a valer a ${esc(a.revisao_codigo)}</span>
    </a>
    <p class="mudanca">${esc(a.o_que_mudou)}</p>
    <p class="assinatura">
      Publicada por ${esc(a.autor_nome)} · avisado ${esc(haQuantoTempo(a.enviado_em))}
      ${atrasado ? '<strong class="alerta-texto">— sem confirmação até agora</strong>' : ''}
    </p>
    <form method="post" action="/revisoes/${a.revisao_id}/confirmar">
      <input type="hidden" name="voltar_para" value="/avisos">
      <button class="botao botao-confirmar" type="submit">Confirmo que vi</button>
    </form>
  </li>`;
}
