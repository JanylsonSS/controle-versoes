/* ══════════════════════════════════════════════════════════════════════
 * A conversa com o servidor. Um único jeito de chamar a API em todo o
 * frontend: quem chama recebe os dados prontos ou uma Error com a
 * mensagem que o servidor mandou — já em português, pronta para a tela.
 * ══════════════════════════════════════════════════════════════════════ */

async function chamar(metodo, rota, corpo) {
  const resposta = await fetch(rota, {
    method: metodo,
    headers: corpo !== undefined ? { 'content-type': 'application/json' } : {},
    body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
  });

  let dados = null;
  try {
    dados = await resposta.json();
  } catch {
    /* resposta sem corpo */
  }

  if (!resposta.ok) {
    throw new Error(dados?.erro ?? `Deu erro (${resposta.status}).`);
  }
  return dados;
}

export const api = {
  pegar: (rota) => chamar('GET', rota),
  criar: (rota, corpo = {}) => chamar('POST', rota, corpo),
  trocar: (rota, corpo = {}) => chamar('PUT', rota, corpo),
  ajustar: (rota, corpo = {}) => chamar('PATCH', rota, corpo),
  apagar: (rota) => chamar('DELETE', rota),
};

/* ─── Datas para gente ler ──────────────────────────────────────────── */

/** "2026-08-14" → "14/08/2026", sem deslizar um dia por fuso horário. */
export function dataBr(diaIso) {
  if (!diaIso) return '';
  const [ano, mes, dia] = String(diaIso).slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

export function dataHoraBr(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function haQuantoTempo(iso) {
  if (!iso) return '';
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (dias <= 0) return 'hoje';
  if (dias === 1) return 'ontem';
  if (dias < 30) return `há ${dias} dias`;
  const meses = Math.floor(dias / 30);
  if (meses < 12) return meses === 1 ? 'há 1 mês' : `há ${meses} meses`;
  const anos = Math.floor(meses / 12);
  return anos === 1 ? 'há 1 ano' : `há ${anos} anos`;
}

/** Hoje como YYYY-MM-DD, no horário local (não em UTC). */
export function hojeIso() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}
