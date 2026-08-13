import { esc, dataHora, haQuantoTempo } from '../html.js';
import { rotuloDoPapel } from '../../regras/papeis.js';
import { porQueNaoPodeAprovar } from '../../regras/aprovacao.js';

/**
 * R17 — FILA DE APROVAÇÃO.
 *
 * Só aparece para quem aprova (direção e coordenação de contratos).
 * Enquanto uma revisão está aqui, ela NÃO vale: a versão vigente do
 * projeto continua sendo a anterior, e a obra não foi avisada de nada.
 */
export function telaAprovacoes({ pendentes, usuario }) {
  return `
  <h1>Esperando aprovação</h1>
  <p class="ajuda">Revisões que mudam orçamento ou prazo. Enquanto estão aqui,
     não valem: a obra continua executando pela versão anterior.</p>

  ${
    pendentes.length
      ? `<ul class="aprovacoes">${pendentes.map((r) => cartao(r, usuario)).join('')}</ul>`
      : `<p class="vazio">Nada esperando aprovação.</p>`
  }`;
}

function cartao(revisao, usuario) {
  const impedimento = porQueNaoPodeAprovar(usuario, revisao);
  return `
  <li class="aprovacao-cartao">
    <p class="bloco-rotulo">${esc(revisao.projeto_codigo)}</p>
    <h2>${esc(revisao.projeto_nome)} — ${esc(revisao.codigo)}</h2>
    <p class="mudanca">${esc(revisao.o_que_mudou)}</p>
    <p class="assinatura">
      Publicada por ${esc(revisao.autor_nome)} (${esc(rotuloDoPapel(revisao.autor_papel))})
      em ${esc(dataHora(revisao.publicada_em))} · esperando ${esc(haQuantoTempo(revisao.publicada_em))}
    </p>

    ${
      impedimento
        ? `<p class="ajuda">${esc(impedimento)}</p>`
        : formularioDeDecisao(revisao)
    }

    <p><a href="/revisoes/${revisao.id}">Ver a revisão inteira</a></p>
  </li>`;
}

function formularioDeDecisao(revisao) {
  return `
  <form method="post" action="/revisoes/${revisao.id}/aprovar" class="aprovacao-acao">
    <button class="botao botao-principal" type="submit">Aprovar — passa a valer e a equipe é avisada</button>
  </form>

  <details class="secao-perigo">
    <summary>Não aprovar</summary>
    <form method="post" action="/revisoes/${revisao.id}/reprovar">
      <label for="motivo-${revisao.id}">Por que não foi aprovada</label>
      <input type="text" id="motivo-${revisao.id}" name="motivo" required
             placeholder="Ex.: o aumento de custo precisa de aditivo antes.">
      <button class="botao botao-perigo" type="submit">Não aprovar</button>
    </form>
  </details>`;
}
