import { NOME_EXIBICAO, CHAMADA } from '../../config.js';
import { esc } from '../html.js';
import { rotuloDoPapel } from '../../regras/papeis.js';

/**
 * Moldura de todas as telas: cabeçalho, seletor "entrar como" (R9) e
 * as três entradas do menu. Nada mais — cada item do menu existe porque
 * um requisito pediu.
 */
export function pagina({
  titulo, usuario, todosUsuarios = [], pendentes = 0, conteudo, ativo = '',
  aprovacoesPendentes = 0, ehAprovador = false,
}) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)} · ${esc(NOME_EXIBICAO)}</title>
<link rel="stylesheet" href="/estilo.css">
<script src="/copiar.js" defer></script>
<script src="/quadro.js" defer></script>
</head>
<body>

<header class="topo">
  <div class="topo-linha">
    <a class="marca" href="/">
      <strong>${esc(NOME_EXIBICAO)}</strong>
      <span class="marca-chamada">${esc(CHAMADA)}</span>
    </a>
    ${seletorDeUsuario(usuario, todosUsuarios)}
  </div>
  <nav class="menu">
    <a href="/" class="${ativo === 'projetos' ? 'atual' : ''}">Projetos</a>
    <a href="/avisos" class="${ativo === 'avisos' ? 'atual' : ''}">
      Avisos${pendentes > 0 ? ` <span class="contador">${pendentes}</span>` : ''}
    </a>
    ${
      ehAprovador
        ? `<a href="/aprovacoes" class="${ativo === 'aprovacoes' ? 'atual' : ''}">
             Aprovações${aprovacoesPendentes > 0 ? ` <span class="contador">${aprovacoesPendentes}</span>` : ''}
           </a>`
        : ''
    }
    <a href="/retrabalho" class="${ativo === 'retrabalho' ? 'atual' : ''}">Retrabalho</a>
  </nav>
</header>

<main>
${conteudo}
</main>

<footer class="rodape">
  Protótipo para validação com a equipe — os dados são fictícios.
</footer>

</body>
</html>`;
}

function seletorDeUsuario(usuario, todos) {
  if (!todos.length) return '';
  const opcoes = todos
    .map(
      (u) =>
        `<option value="${u.id}" ${u.id === usuario?.id ? 'selected' : ''}>${esc(u.nome)} — ${esc(
          rotuloDoPapel(u.papel)
        )}</option>`
    )
    .join('');
  return `
  <form class="entrar-como" method="post" action="/entrar">
    <label for="usuario_id">Você está como</label>
    <select id="usuario_id" name="usuario_id" onchange="this.form.submit()">${opcoes}</select>
    <noscript><button type="submit">Trocar</button></noscript>
  </form>`;
}

/** Aviso curto no topo de uma tela, depois de uma ação. */
export function recado(texto, tipo = 'ok') {
  if (!texto) return '';
  return `<p class="recado recado-${esc(tipo)}">${esc(texto)}</p>`;
}
