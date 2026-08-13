import { esc, data, dataHora, dinheiro } from '../html.js';

/**
 * RETRABALHO POR VERSÃO ERRADA — R11.
 *
 * É a linha de base das metas do CEO ("menos revisões de retrabalho e
 * menos horas refazendo"). Sem contar os casos, não há como comparar
 * antes e depois. A tela é uma lista e um total, nada mais.
 */
export function telaRetrabalho({ incidentes, resumo }) {
  return `
  <h1>Retrabalho por versão errada</h1>
  <p class="ajuda">Cada vez que um serviço foi executado, orçado ou refeito
     sobre a versão errada. É o número que mostra se o sistema está funcionando.</p>

  <section class="bloco bloco-calmo">
    <div class="totais">
      <div><span class="total-numero">${resumo.quantidade}</span><span class="total-rotulo">${
        resumo.quantidade === 1 ? 'caso registrado' : 'casos registrados'
      }</span></div>
      <div><span class="total-numero">${esc(dinheiro(resumo.custo_total))}</span><span class="total-rotulo">custo estimado</span></div>
      <div><span class="total-numero">${esc(resumo.horas_total)} h</span><span class="total-rotulo">refazendo</span></div>
    </div>
  </section>

  <p><a class="botao botao-principal" href="/retrabalho/novo">Registrar um caso</a></p>

  ${
    incidentes.length
      ? `<ul class="incidentes incidentes-lista">
          ${incidentes
            .map(
              (i) => `<li>
                <span class="incidente-data">${esc(data(i.ocorrido_em))}</span>
                <strong>${esc(i.projeto_nome)}</strong>
                ${i.revisao_usada_codigo ? `<span class="selo selo-superada">executado na ${esc(i.revisao_usada_codigo)}</span>` : ''}
                <span class="incidente-texto">${esc(i.o_que_aconteceu)}</span>
                <span class="incidente-custo">${esc(dinheiro(i.custo_estimado))}${
                  i.horas_refazendo ? ` · ${esc(i.horas_refazendo)} h` : ''
                }</span>
                <span class="assinatura">Registrado por ${esc(i.registrador_nome)} em ${esc(
                  dataHora(i.registrado_em)
                )}</span>
              </li>`
            )
            .join('')}
        </ul>`
      : `<p class="vazio">Nenhum caso registrado ainda.</p>`
  }`;
}

export function telaNovoIncidente({ projetos, projetoSelecionadoId, revisoes, hoje, erro }) {
  return `
  <p class="migalha"><a href="/retrabalho">Retrabalho</a> › Novo</p>
  <h1>Registrar um caso de versão errada</h1>

  ${erro ? `<p class="recado recado-erro">${esc(erro)}</p>` : ''}

  <form method="post" action="/retrabalho" class="formulario">
    <label for="projeto_id">Projeto</label>
    <select id="projeto_id" name="projeto_id" required
            onchange="location.href='/retrabalho/novo?projeto_id=' + this.value">
      ${projetos
        .map(
          (p) =>
            `<option value="${p.id}" ${p.id === projetoSelecionadoId ? 'selected' : ''}>${esc(
              p.nome
            )}</option>`
        )
        .join('')}
    </select>

    <label for="revisao_usada_id">Versão que acabou sendo usada (se souber)</label>
    <select id="revisao_usada_id" name="revisao_usada_id">
      <option value="">Não sei / não se aplica</option>
      ${revisoes.map((r) => `<option value="${r.id}">${esc(r.codigo)} — ${esc(r.o_que_mudou)}</option>`).join('')}
    </select>

    <label for="ocorrido_em">Quando aconteceu</label>
    <input type="date" id="ocorrido_em" name="ocorrido_em" value="${esc(hoje)}" required>

    <label for="o_que_aconteceu">O que aconteceu</label>
    <textarea id="o_que_aconteceu" name="o_que_aconteceu" rows="3" required
      placeholder="Ex.: pavimentação executada com a calçada que a revisão mandava remover; trecho demolido e refeito."></textarea>

    <label for="custo_estimado">Custo estimado (R$)</label>
    <input type="number" id="custo_estimado" name="custo_estimado" step="0.01" min="0" placeholder="Ex.: 18400">

    <label for="horas_refazendo">Horas refazendo</label>
    <input type="number" id="horas_refazendo" name="horas_refazendo" step="0.5" min="0" placeholder="Ex.: 24">

    <button class="botao botao-principal" type="submit">Registrar</button>
    <a class="botao botao-neutro" href="/retrabalho">Cancelar</a>
  </form>`;
}
