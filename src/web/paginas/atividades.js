import { esc, data, dataHora, haQuantoTempo } from '../html.js';
import { rotuloDoPapel } from '../../regras/papeis.js';
import { COLUNAS, ORDEM_DAS_COLUNAS, rotuloDaColuna } from '../../regras/atividades.js';

/**
 * QUADRO DE ATIVIDADES — a aba de acompanhamento do projeto.
 *
 * Fica separada da tela do projeto de propósito: a versão vigente precisa
 * ser a primeira coisa que alguém vê ao abrir uma obra, e um quadro de
 * tarefas competiria com ela.
 *
 * Os cartões são arrastáveis por `publico/quadro.js`, que usa eventos de
 * ponteiro — funcionam com mouse e com o dedo, sem biblioteca. Quem não
 * puder arrastar tem o mesmo efeito pela janela de detalhes, que traz um
 * seletor de coluna. Nada aqui depende de JavaScript para ser LIDO.
 */
export function telaAtividades({
  projeto,
  atividades,
  pessoas,
  usuario,
  podeMexer,
  atividadeAberta,
}) {
  const porColuna = Object.fromEntries(ORDEM_DAS_COLUNAS.map((c) => [c, []]));
  for (const a of atividades) (porColuna[a.situacao] ?? porColuna.NAO_INICIADO).push(a);

  return `
  <p class="migalha">
    <a href="/">Projetos</a> ›
    <a href="/projetos/${projeto.id}">${esc(projeto.codigo)}</a> › Atividades
  </p>
  <h1>${esc(projeto.nome)}</h1>

  ${abas(projeto, 'atividades')}

  <p class="ajuda">
    O que está sendo feito nesta obra. Arraste o cartão para mudar de coluna,
    ou toque nele para ver os detalhes.
    <strong>Mover cartão não muda a versão do projeto</strong> — para isso,
    publique uma revisão na aba do projeto.
  </p>

  ${podeMexer ? formularioNovaAtividade(projeto, pessoas, usuario) : ''}

  <div class="quadro" data-projeto="${projeto.id}" data-pode-mexer="${podeMexer ? '1' : '0'}">
    ${ORDEM_DAS_COLUNAS.map((chave) => coluna(chave, porColuna[chave])).join('')}
  </div>

  ${atividades.map((a) => janelaDaAtividade(a, projeto, pessoas, podeMexer, atividadeAberta)).join('')}`;
}

/** Abas do projeto. Usada também pela tela do projeto. */
export function abas(projeto, atual) {
  const aba = (chave, rotulo, href) =>
    `<a href="${href}" class="${atual === chave ? 'atual' : ''}">${esc(rotulo)}</a>`;
  return `
  <nav class="abas">
    ${aba('projeto', 'Projeto e versões', `/projetos/${projeto.id}`)}
    ${aba('atividades', 'Atividades', `/projetos/${projeto.id}/atividades`)}
  </nav>`;
}

function coluna(chave, cartoes) {
  const { rotulo, classe } = COLUNAS[chave];
  return `
  <section class="coluna ${classe}" data-coluna="${chave}">
    <h2 class="coluna-titulo">
      ${esc(rotulo)} <span class="coluna-contagem">${cartoes.length}</span>
    </h2>
    <div class="coluna-cartoes" data-alvo="${chave}">
      ${cartoes.map(cartao).join('')}
      <p class="coluna-vazia">Nada aqui.</p>
    </div>
  </section>`;
}

/**
 * O cartão traz só o que o pedido pediu: nome, quem está fazendo e desde
 * quando. O resto fica na janela — cartão cheio de texto deixa de ser
 * legível de relance, que é a única vantagem de um quadro.
 */
function cartao(a) {
  return `
  <article class="cartao-atividade" data-atividade="${a.id}" tabindex="0">
    <a class="cartao-atividade-nome" href="?atividade=${a.id}">${esc(a.nome)}</a>
    <p class="cartao-atividade-quem">
      ${
        a.responsavel_nome
          ? `${esc(a.responsavel_nome)} <span class="ciencia-papel">${esc(
              rotuloDoPapel(a.responsavel_papel)
            )}</span>`
          : '<span class="sem-responsavel">sem responsável</span>'
      }
    </p>
    <p class="cartao-atividade-quando">
      ${
        a.iniciada_em
          ? `Iniciada em ${esc(data(a.iniciada_em))} · ${esc(haQuantoTempo(a.iniciada_em))}`
          : 'Ainda não começou'
      }
    </p>
    ${a.descricao ? '<p class="cartao-atividade-tem-nota">tem descrição</p>' : ''}
  </article>`;
}

function formularioNovaAtividade(projeto, pessoas, usuario) {
  return `
  <details class="nova-atividade">
    <summary>Acrescentar atividade</summary>
    <form method="post" action="/projetos/${projeto.id}/atividades" class="formulario">
      <label for="nome">O que precisa ser feito</label>
      <input type="text" id="nome" name="nome" required
             placeholder="Ex.: detalhamento do meio-fio do trecho leste">

      <label for="responsavel_id">Quem vai fazer</label>
      <select id="responsavel_id" name="responsavel_id">
        <option value="">Ninguém ainda</option>
        ${pessoas
          .map(
            (p) =>
              `<option value="${p.id}" ${p.id === usuario.id ? 'selected' : ''}>${esc(
                p.nome
              )} — ${esc(rotuloDoPapel(p.papel))}</option>`
          )
          .join('')}
      </select>

      <label for="descricao">Descrição (opcional)</label>
      <textarea id="descricao" name="descricao" rows="3"
        placeholder="O que envolve, o que precisa estar pronto antes, onde estão as referências."></textarea>

      <label for="situacao">Começa em qual coluna</label>
      <select id="situacao" name="situacao">
        ${ORDEM_DAS_COLUNAS.map(
          (c) => `<option value="${c}">${esc(rotuloDaColuna(c))}</option>`
        ).join('')}
      </select>

      <button class="botao botao-principal" type="submit">Acrescentar</button>
    </form>
  </details>`;
}

/**
 * A janela de detalhes. É um `<dialog>` nativo — sem biblioteca.
 *
 * Quando alguém chega por `?atividade=N` (link do cartão, ou navegador sem
 * JavaScript), o servidor já manda a janela com `open`. Com JavaScript, o
 * clique abre a mesma janela sem recarregar a página.
 */
function janelaDaAtividade(a, projeto, pessoas, podeMexer, atividadeAberta) {
  const aberta = Number(atividadeAberta) === a.id;
  return `
  <dialog class="janela" id="atividade-${a.id}" ${aberta ? 'open' : ''}>
    <div class="janela-topo">
      <p class="bloco-rotulo">${esc(rotuloDaColuna(a.situacao))}</p>
      <a class="janela-fechar" href="/projetos/${projeto.id}/atividades"
         data-fechar="${a.id}" aria-label="Fechar">✕</a>
    </div>

    <h2>${esc(a.nome)}</h2>

    <dl class="ficha">
      <div>
        <dt>Quem está fazendo</dt>
        <dd>${
          a.responsavel_nome
            ? `${esc(a.responsavel_nome)} (${esc(rotuloDoPapel(a.responsavel_papel))})`
            : '<span class="vazio">ninguém ainda</span>'
        }</dd>
      </div>
      <div>
        <dt>Iniciada em</dt>
        <dd>${a.iniciada_em ? esc(dataHora(a.iniciada_em)) : '<span class="vazio">ainda não começou</span>'}</dd>
      </div>
      ${
        a.finalizada_em
          ? `<div><dt>Finalizada em</dt><dd>${esc(dataHora(a.finalizada_em))}</dd></div>`
          : ''
      }
      <div>
        <dt>Criada por</dt>
        <dd>${esc(a.criador_nome)}, ${esc(dataHora(a.criada_em))}</dd>
      </div>
    </dl>

    <h3>Descrição</h3>
    <p class="janela-descricao">${
      a.descricao ? esc(a.descricao) : '<span class="vazio">Sem descrição.</span>'
    }</p>

    ${podeMexer ? formularioDaJanela(a, projeto, pessoas) : ''}
  </dialog>`;
}

function formularioDaJanela(a, projeto, pessoas) {
  return `
  <details class="janela-editar">
    <summary>Editar esta atividade</summary>
    <form method="post" action="/atividades/${a.id}" class="formulario">
      <label for="nome-${a.id}">Nome</label>
      <input type="text" id="nome-${a.id}" name="nome" required value="${esc(a.nome)}">

      <label for="resp-${a.id}">Quem está fazendo</label>
      <select id="resp-${a.id}" name="responsavel_id">
        <option value="">Ninguém ainda</option>
        ${pessoas
          .map(
            (p) =>
              `<option value="${p.id}" ${p.id === a.responsavel_id ? 'selected' : ''}>${esc(
                p.nome
              )}</option>`
          )
          .join('')}
      </select>

      <label for="desc-${a.id}">Descrição</label>
      <textarea id="desc-${a.id}" name="descricao" rows="4">${esc(a.descricao ?? '')}</textarea>

      <label for="sit-${a.id}">Coluna</label>
      <select id="sit-${a.id}" name="situacao">
        ${ORDEM_DAS_COLUNAS.map(
          (c) =>
            `<option value="${c}" ${c === a.situacao ? 'selected' : ''}>${esc(
              rotuloDaColuna(c)
            )}</option>`
        ).join('')}
      </select>
      <p class="ajuda">Serve para quem não puder arrastar o cartão.</p>

      <button class="botao botao-principal" type="submit">Salvar</button>
    </form>

    <form method="post" action="/atividades/${a.id}/excluir" class="excluir-atividade">
      <button class="botao botao-perigo" type="submit">Apagar atividade</button>
    </form>
  </details>`;
}
