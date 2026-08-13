import { esc } from '../html.js';
import { rotuloDoPapel } from '../../regras/papeis.js';
import { SITUACOES, TIPOS, SITUACAO_PADRAO, TIPO_PADRAO } from '../../regras/cadastro.js';

/**
 * CADASTRAR E CORRIGIR PROJETO — R1 (o projeto passa a existir num único
 * lugar) e R19 (quem trabalha nele é quem vai vê-lo e ser avisado).
 *
 * O mesmo formulário serve para cadastrar e para corrigir, porque são a
 * mesma informação — e manter dois formulários parecidos é o caminho mais
 * curto para eles ficarem diferentes sem ninguém perceber.
 *
 * A equipe não é detalhe de configuração: é ela que decide, ao mesmo
 * tempo, quem enxerga o projeto e quem recebe aviso quando ele muda.
 */
export function telaCadastroProjeto({
  pessoas,
  conjuntosConhecidos = [],
  valores = {},
  marcados = [],
  erro,
  editando = null,
}) {
  const acao = editando ? `/projetos/${editando.id}/editar` : '/projetos';
  const titulo = editando ? 'Corrigir cadastro do projeto' : 'Cadastrar projeto';

  return `
  <p class="migalha">
    <a href="/">Projetos</a> ›
    ${editando ? `<a href="/projetos/${editando.id}">${esc(editando.codigo)}</a> › Corrigir` : 'Novo'}
  </p>
  <h1>${esc(titulo)}</h1>

  ${erro ? `<p class="recado recado-erro">${esc(erro)}</p>` : ''}

  <form method="post" action="${acao}" class="formulario">
    ${camposDoProjeto(valores, conjuntosConhecidos)}
    ${editando ? '' : blocoEquipe(pessoas, marcados)}

    <button class="botao botao-principal" type="submit">
      ${editando ? 'Salvar correção' : 'Cadastrar projeto'}
    </button>
    <a class="botao botao-neutro" href="${editando ? `/projetos/${editando.id}` : '/'}">Cancelar</a>
  </form>

  ${
    editando
      ? `<p class="ajuda">Para mudar quem trabalha no projeto, use
           "Mudar quem trabalha neste projeto" na página do projeto.</p>`
      : ''
  }`;
}

function camposDoProjeto(v, conjuntosConhecidos) {
  const opcoes = (mapa, atual, padrao) =>
    Object.entries(mapa)
      .map(
        ([chave, valor]) =>
          `<option value="${chave}" ${(atual ?? padrao) === chave ? 'selected' : ''}>${esc(
            typeof valor === 'string' ? valor : valor.rotulo
          )}</option>`
      )
      .join('');

  return `
    <label for="codigo">Código do projeto</label>
    <input type="text" id="codigo" name="codigo" required
           value="${esc(v.codigo ?? '')}" placeholder="Ex.: PAV-005">

    <label for="nome">Nome do projeto</label>
    <input type="text" id="nome" name="nome" required
           value="${esc(v.nome ?? '')}" placeholder="Ex.: Pavimentação — Avenida Sul">

    <label for="tipo">Tipo de obra</label>
    <select id="tipo" name="tipo">${opcoes(TIPOS, v.tipo, TIPO_PADRAO)}</select>

    <label for="situacao">Situação da obra</label>
    <select id="situacao" name="situacao">${opcoes(SITUACOES, v.situacao, SITUACAO_PADRAO)}</select>
    <p class="ajuda">Obra concluída ou parada sai da lista principal, mas continua guardada.</p>

    <label for="local">Onde é</label>
    <input type="text" id="local" name="local"
           value="${esc(v.local ?? '')}" placeholder="Ex.: Avenida Sul, trecho 2">

    <label for="cliente">Cliente / contratante</label>
    <input type="text" id="cliente" name="cliente"
           value="${esc(v.cliente ?? '')}" placeholder="Ex.: Prefeitura Municipal">

    <label for="numero_contrato">Número do contrato</label>
    <input type="text" id="numero_contrato" name="numero_contrato"
           value="${esc(v.numero_contrato ?? '')}" placeholder="Ex.: 041/2026">

    <label for="data_inicio">Data de início</label>
    <input type="date" id="data_inicio" name="data_inicio" value="${esc(v.data_inicio ?? '')}">

    <label for="prazo">Prazo (término previsto)</label>
    <input type="date" id="prazo" name="prazo" value="${esc(v.prazo ?? '')}">

    <label for="conjunto">Conjunto de obras (opcional)</label>
    <input type="text" id="conjunto" name="conjunto" list="conjuntos-conhecidos"
           value="${esc(v.conjunto ?? '')}" placeholder="Ex.: Reformas de Escolas 2026">
    <datalist id="conjuntos-conhecidos">
      ${conjuntosConhecidos.map((c) => `<option value="${esc(c.nome)}"></option>`).join('')}
    </datalist>
    <p class="ajuda">Junta obras parecidas num lugar só. Escolha um conjunto que já
       existe na lista, para não criar dois nomes para a mesma coisa.</p>

    <label for="link_drive">Link da pasta no Drive</label>
    <input type="text" id="link_drive" name="link_drive"
           value="${esc(v.link_drive ?? '')}" placeholder="Cole aqui o link da pasta compartilhada">
    <p class="ajuda">Abre no navegador. É o que funciona no celular, no canteiro.</p>

    <label for="caminho_rede">Caminho da pasta no computador</label>
    <input type="text" id="caminho_rede" name="caminho_rede"
           value="${esc(v.caminho_rede ?? '')}"
           placeholder="G:\\Drives compartilhados\\PROMAV\\...">
    <p class="ajuda">Para quem trabalha no escritório e abre pelo explorador de arquivos.
       O sistema mostra esse caminho com um botão de copiar — o navegador não deixa
       nenhuma página abrir uma pasta do computador direto, então é copiar e colar
       na barra do Explorer.</p>`;
}

/** Lista de quem trabalha no projeto. Usada no cadastro e na edição da equipe. */
function blocoEquipe(pessoas, marcados, titulo = 'Quem trabalha neste projeto') {
  const marcado = new Set(marcados.map(Number));
  return `
  <fieldset class="equipe">
    <legend>${esc(titulo)}</legend>
    <p class="ajuda">Só quem estiver marcado aqui vê este projeto e recebe aviso
       quando uma revisão nova é publicada.</p>
    ${pessoas
      .map(
        (p) => `
      <label class="equipe-item">
        <input type="checkbox" name="equipe" value="${p.id}" ${marcado.has(p.id) ? 'checked' : ''}>
        <span>${esc(p.nome)} <span class="ciencia-papel">${esc(rotuloDoPapel(p.papel))}</span></span>
      </label>`
      )
      .join('')}
  </fieldset>`;
}

/** Seção de edição da equipe, dentro da tela do projeto. */
export function formularioEquipe(projeto, pessoas, equipeAtual) {
  return `
  <details class="secao">
    <summary class="editar-equipe">Mudar quem trabalha neste projeto</summary>
    <form method="post" action="/projetos/${projeto.id}/equipe" class="formulario">
      ${blocoEquipe(pessoas, equipeAtual.map((p) => p.id), 'Equipe')}
      <button class="botao botao-principal" type="submit">Salvar equipe</button>
    </form>
  </details>`;
}
