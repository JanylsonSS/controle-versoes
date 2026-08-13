import { esc, dataHora, haQuantoTempo } from '../html.js';
import { listaCiencia, botaoDoArquivo } from './componentes.js';
import { rotuloDoPapel } from '../../regras/papeis.js';

/**
 * TELA DE UMA REVISÃO — R2, R3, R4, R6, R8.
 *
 * Quando a revisão aberta não é a vigente, a tela inteira avisa disso
 * antes de mostrar qualquer conteúdo, e oferece o caminho de volta para
 * a que vale. É o antídoto direto do caso da pavimentação.
 */
export function telaRevisao({
  revisao,
  projeto,
  vigente,
  anterior,
  ciencia,
  meuAvisoPendente,
  acessos,
  podeCancelar,
}) {
  return `
  <p class="migalha">
    <a href="/">Projetos</a> ›
    <a href="/projetos/${projeto.id}">${esc(projeto.codigo)}</a> ›
    ${esc(revisao.codigo)}
  </p>

  ${faixaDeSituacao(revisao, vigente)}

  <h1>${esc(projeto.nome)} — ${esc(revisao.codigo)}</h1>

  <section class="secao">
    <h3>${anterior ? `O que mudou da ${esc(anterior.codigo)} para a ${esc(revisao.codigo)}` : 'O que é esta versão'}</h3>
    <p class="mudanca-destaque">${esc(revisao.o_que_mudou)}</p>
    <p class="assinatura">
      Publicada por ${esc(revisao.autor_nome)} (${esc(rotuloDoPapel(revisao.autor_papel))})
      em ${esc(dataHora(revisao.publicada_em))}
    </p>
    ${botaoDoArquivo(revisao, meuAvisoPendente)}
  </section>

  ${
    meuAvisoPendente
      ? `<form method="post" action="/revisoes/${revisao.id}/confirmar" class="confirmar-ciencia">
           <input type="hidden" name="voltar_para" value="/revisoes/${revisao.id}">
           <p>Você foi avisado desta versão ${esc(haQuantoTempo(meuAvisoPendente.enviado_em))} e ainda
              não confirmou — por isso o arquivo está bloqueado para você.</p>
           <button class="botao botao-confirmar" type="submit">Confirmo que vi a ${esc(revisao.codigo)}</button>
         </form>`
      : ''
  }

  <section class="secao">
    <h3>Quem foi avisado desta versão</h3>
    ${listaCiencia(ciencia)}
  </section>

  ${blocoAcessos(revisao, acessos)}

  ${podeCancelar && revisao.situacao !== 'CANCELADA' ? formularioCancelar(revisao) : ''}`;
}

/* R2 + R4 + R8 + R17 — a primeira coisa que a tela diz é se esta versão vale. */
function faixaDeSituacao(revisao, vigente) {
  if (revisao.situacao === 'AGUARDANDO_APROVACAO') {
    return `
    <section class="faixa faixa-aguardando">
      <h2>Esta versão ainda não vale</h2>
      <p>Ela muda orçamento ou prazo, então está esperando o aval da direção ou da
         coordenação de contratos. <strong>Não execute nem orce por ela.</strong></p>
      ${
        vigente
          ? `<p>Quem vale hoje é a <strong>${esc(vigente.codigo)}</strong>.</p>
             <a class="botao botao-principal" href="/revisoes/${vigente.id}">Ver a ${esc(vigente.codigo)}</a>`
          : `<p><strong>Este projeto ainda não tem versão vigente.</strong></p>`
      }
    </section>`;
  }

  if (revisao.situacao === 'CANCELADA') {
    return `
    <section class="faixa faixa-cancelada">
      <h2>Versão cancelada — não use</h2>
      <p>Esta versão não vale para executar nem para orçar.
         ${revisao.motivo_cancelamento ? `Motivo: ${esc(revisao.motivo_cancelamento)}.` : ''}</p>
      <p class="faixa-meta">Cancelada por ${esc(revisao.cancelador_nome ?? '—')} em ${esc(
        dataHora(revisao.cancelada_em)
      )}.</p>
      ${
        vigente
          ? `<a class="botao botao-principal" href="/projetos/${revisao.projeto_id}">Ir para a versão que vale (${esc(
              vigente.codigo
            )})</a>`
          : `<p><strong>Este projeto está sem versão vigente.</strong></p>`
      }
    </section>`;
  }

  if (revisao.situacao === 'SUPERADA') {
    return `
    <section class="faixa faixa-antiga">
      <h2>Esta não é a versão que vale hoje</h2>
      <p>Você está vendo uma versão antiga. ${
        vigente ? `A que vale é a <strong>${esc(vigente.codigo)}</strong>.` : ''
      }</p>
      <p class="faixa-meta">Este acesso ficou registrado.</p>
      ${
        vigente
          ? `<a class="botao botao-principal" href="/revisoes/${vigente.id}">Ver a ${esc(vigente.codigo)}</a>`
          : ''
      }
    </section>`;
  }

  return `
  <section class="faixa faixa-vigente">
    <h2>Esta é a versão que vale hoje</h2>
    <p>Pode executar e orçar por ela.</p>
  </section>`;
}

/* R8 — "abrir uma versão antiga exige ação deliberada e fica registrado". */
function blocoAcessos(revisao, acessos) {
  if (revisao.situacao === 'VIGENTE') return '';
  return `
  <section class="secao">
    <h3>Quem abriu esta versão antiga</h3>
    ${
      acessos.length
        ? `<ul class="acessos">${acessos
            .map(
              (a) =>
                `<li>${esc(a.usuario_nome)} <span class="ciencia-papel">${esc(
                  rotuloDoPapel(a.usuario_papel)
                )}</span> <span class="quando">${esc(dataHora(a.acessado_em))}</span></li>`
            )
            .join('')}</ul>`
        : `<p class="vazio">Ninguém abriu esta versão desde que ela deixou de valer.</p>`
    }
  </section>`;
}

/* R4 — marcar cancelada, restrito a quem publica (R9). */
function formularioCancelar(revisao) {
  return `
  <details class="secao secao-perigo">
    <summary>Marcar esta versão como cancelada</summary>
    <form method="post" action="/revisoes/${revisao.id}/cancelar">
      <p class="ajuda">Uma versão cancelada continua no histórico, mas fica marcada como
         não utilizável para executar ou orçar.
         ${
           revisao.situacao === 'VIGENTE'
             ? '<strong>Atenção: esta é a versão vigente. Se você cancelar, o projeto ficará sem versão que valha.</strong>'
             : ''
         }</p>
      <label for="motivo">Por que está sendo cancelada</label>
      <input type="text" id="motivo" name="motivo" required
             placeholder="Ex.: base topográfica errada, não usar">
      <button class="botao botao-perigo" type="submit">Cancelar esta versão</button>
    </form>
  </details>`;
}
