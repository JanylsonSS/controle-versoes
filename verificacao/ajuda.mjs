/* ══════════════════════════════════════════════════════════════════════
 * Auxiliares comuns às verificações da API.
 *
 * Os scripts falam com o servidor pela porta, em JSON — do mesmo jeito
 * que o frontend em React fala. Não há framework de teste porque não há
 * dependências no projeto (ver PARA-DESENVOLVEDORES.md).
 *
 * O `executar.mjs` sobe o servidor num banco separado. Para rodar um
 * script à mão: suba o servidor numa janela e rode o script noutra.
 * ══════════════════════════════════════════════════════════════════════ */

export const BASE = `http://localhost:${process.env.PORTA || 3000}`;

/* O cookie de sessão é ASSINADO (src/api/assinatura.js) — um id em
 * texto puro cai no fallback. As suítes assinam com o mesmo segredo da
 * instalação de teste (PASTA_DADOS, criado pelo servidor ao subir). */
import { valorDeSessao } from '../src/api/assinatura.js';

/** Quem é quem, na ordem em que o seed cria as pessoas. */
export const COMO = {
  alvaro: 1,   // Engenharia — o sistema abre como ele
  luiza: 2,    // Engenharia
  lya: 3,      // Arquitetura
  vanessa: 4,  // Arquitetura
  rafaela: 5,  // Estágio — só consulta
  micael: 6,   // Orçamento — só consulta
  thayna: 7,   // Coordenação — cadastra, publica, aprova, marca para outros
  matheus: 8,  // Direção — idem
};

let falhas = 0;
let total = 0;

export function ok(nome, condicao, detalhe = '') {
  total += 1;
  if (!condicao) falhas += 1;
  console.log(`${condicao ? '  ok  ' : ' FALHA'} ${nome}${detalhe ? ' — ' + detalhe : ''}`);
}

export function secao(titulo) {
  console.log(`\n${titulo}\n`);
}

export function encerrar() {
  console.log(
    falhas ? `\n${falhas} de ${total} FALHARAM\n` : `\n${total} verificações, todas passaram.\n`
  );
  process.exit(falhas ? 1 : 0);
}

/* ─── Falar com a API ───────────────────────────────────────────────── */

/**
 * Chama a API como uma pessoa. Devolve { status, dados }.
 *   api('GET', '/api/projetos', COMO.alvaro)
 *   api('POST', '/api/agenda', COMO.thayna, { tipo: 'REUNIAO', ... })
 */
export async function api(metodo, rota, usuarioId, corpo) {
  const resposta = await fetch(BASE + rota, {
    method: metodo,
    headers: {
      cookie: `usuario_id=${valorDeSessao(usuarioId)}`,
      ...(corpo !== undefined ? { 'content-type': 'application/json' } : {}),
    },
    body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
  });
  let dados = null;
  try {
    dados = await resposta.json();
  } catch {
    /* respostas sem corpo */
  }
  return { status: resposta.status, dados };
}
