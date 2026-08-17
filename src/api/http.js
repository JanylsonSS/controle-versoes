/* ══════════════════════════════════════════════════════════════════════
 * ENCANAMENTO DA API
 *
 * A API fala só JSON: recebe JSON, devolve JSON, e erro tem sempre o
 * mesmo formato — { erro: "mensagem legível" }. O frontend em React é o
 * único cliente.
 *
 * Segurança de sessão, enquanto o login com Google não chega:
 *   - o cookie é HttpOnly + SameSite=Lax, como antes;
 *   - todo método com corpo EXIGE content-type application/json. Um
 *     formulário de outro site não consegue mandar esse content-type
 *     sem disparar CORS, então isso soma com o SameSite contra CSRF.
 * ══════════════════════════════════════════════════════════════════════ */

import { usuarios } from '../persistencia/repositorio.js';

/** Erro que vira resposta JSON com status. Lançar em qualquer handler. */
export class ErroApi extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

/** Atalho para guardas: `exigir(condicao, 403, 'Isso é da coordenação.')` */
export function exigir(condicao, status, mensagem) {
  if (!condicao) throw new ErroApi(status, mensagem);
}

const CABECALHOS = {
  'content-type': 'application/json; charset=utf-8',
  'x-content-type-options': 'nosniff',
  'cache-control': 'no-store', // dados operacionais: sempre frescos
};

export function json(res, status, corpo) {
  res.writeHead(status, CABECALHOS);
  res.end(JSON.stringify(corpo));
}

/* ─── Sessão ────────────────────────────────────────────────────────── */

/**
 * No protótipo não há senha: a sessão é quem está "entrando como", e uma
 * requisição sem cookie (ou com id inválido) cai no primeiro usuário do
 * seed — o sistema ABRE logado de propósito, para a demonstração.
 *
 * Quando o login com a conta Google entrar (ver PENDENCIAS.md), este
 * fallback vira `throw new ErroApi(401, ...)` — não existe mais "abrir
 * como alguém" em produção.
 */
export function usuarioDaSessao(req) {
  const bruto = req.headers.cookie || '';
  let id = null;
  for (const parte of bruto.split(';')) {
    const i = parte.indexOf('=');
    if (i > 0 && parte.slice(0, i).trim() === 'usuario_id') id = Number(parte.slice(i + 1).trim());
  }
  return usuarios.porId(id) ?? usuarios.todos()[0];
}

export function definirSessao(res, usuarioId) {
  // Cookie de SESSÃO, sem Max-Age: fechar o navegador desfaz o "entrar
  // como". Durava 30 dias; encurtado em 17/08/2026 — o acidente típico
  // do piloto é agir dias depois como outra pessoa sem lembrar da troca.
  res.setHeader(
    'set-cookie',
    `usuario_id=${Number(usuarioId)}; Path=/; HttpOnly; SameSite=Lax`
  );
}

/** O endereço de quem chamou, para o rastro das trocas de sessão. */
export function enderecoDe(req) {
  return req.socket?.remoteAddress ?? null;
}

/* ─── Corpo e rotas ─────────────────────────────────────────────────── */

const LIMITE_CORPO = 256 * 1024; // JSON de formulário; nada aqui é grande

async function lerCorpoJson(req) {
  const pedacos = [];
  let total = 0;
  for await (const pedaco of req) {
    total += pedaco.length;
    if (total > LIMITE_CORPO) throw new ErroApi(413, 'Corpo grande demais.');
    pedacos.push(pedaco);
  }

  // POST de ação sem corpo (confirmar, aprovar, resolver) é legítimo e não
  // tem o que forjar — a exigência de JSON vale só quando HÁ corpo.
  if (total === 0) return {};

  const tipo = req.headers['content-type'] || '';
  if (!tipo.startsWith('application/json')) {
    throw new ErroApi(415, 'A API só aceita application/json.');
  }
  try {
    return JSON.parse(Buffer.concat(pedacos).toString('utf8'));
  } catch {
    throw new ErroApi(400, 'JSON inválido.');
  }
}

/* O caminho chega CRU (percent-encoded). Os segmentos fixos das rotas são
 * ASCII simples e comparam direto; só o valor de um :param é decodificado —
 * uma vez, e sem deixar um encoding inválido virar exceção solta. */
function casar(padrao, caminho) {
  const p = padrao.split('/').filter(Boolean);
  const c = caminho.split('/').filter(Boolean);
  if (p.length !== c.length) return null;
  const params = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(':')) {
      try {
        params[p[i].slice(1)] = decodeURIComponent(c[i]);
      } catch {
        throw new ErroApi(400, 'Endereço malformado.');
      }
    } else if (p[i] !== c[i]) return null;
  }
  return params;
}

/**
 * Atende uma requisição /api/*. `rotas` é uma lista de
 * [metodo, padrao, handler]; o handler recebe
 * { req, res, params, url, usuario, corpo } e DEVOLVE o objeto de
 * resposta (ou usa `res` direto quando precisar de cabeçalho próprio).
 */
export async function atenderApi(rotas, req, res) {
  const url = new URL(req.url, 'http://localhost');
  const caminho = url.pathname; // cru; `casar` decodifica só os :params

  try {
    for (const [metodo, padrao, handler] of rotas) {
      if (metodo !== req.method) continue;
      const params = casar(padrao, caminho);
      if (!params) continue;

      const usuario = usuarioDaSessao(req);
      const temCorpo = ['POST', 'PUT', 'PATCH'].includes(req.method);
      const corpo = temCorpo ? await lerCorpoJson(req) : {};

      const resposta = await handler({ req, res, params, url, usuario, corpo });
      if (!res.writableEnded) json(res, 200, resposta ?? { ok: true });
      return;
    }
    json(res, 404, { erro: 'Rota não existe.' });
  } catch (erro) {
    if (erro instanceof ErroApi) return json(res, erro.status, { erro: erro.message });
    console.error(erro);
    json(res, 500, { erro: 'Deu erro do lado do servidor.' });
  }
}

/* ─── Utilidades de entrada ─────────────────────────────────────────── */

/** Texto obrigatório de um corpo JSON, aparado. */
export function texto(corpo, campo, mensagem) {
  const valor = String(corpo?.[campo] ?? '').trim();
  if (!valor) throw new ErroApi(400, mensagem ?? `Preencha o campo "${campo}".`);
  return valor;
}

/** Texto opcional: devolve null quando vazio. */
export function textoOpcional(corpo, campo) {
  const valor = String(corpo?.[campo] ?? '').trim();
  return valor || null;
}

/** Data YYYY-MM-DD válida de verdade (30/02 não passa). */
export function dia(corpo, campo, mensagem) {
  const valor = texto(corpo, campo, mensagem);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  const valida =
    m && !Number.isNaN(Date.parse(`${valor}T00:00:00Z`)) &&
    new Date(`${valor}T00:00:00Z`).getUTCDate() === Number(m[3]);
  if (!valida) throw new ErroApi(400, mensagem ?? `A data em "${campo}" precisa ser AAAA-MM-DD.`);
  return valor;
}
