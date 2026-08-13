/* ══════════════════════════════════════════════════════════════════════
 * Auxiliares comuns às verificações.
 *
 * Os scripts sobem contra um servidor rodando e conferem o comportamento
 * pela porta — do mesmo jeito que uma pessoa usaria. Não há framework de
 * teste porque não há dependências no projeto (ver PARA-DESENVOLVEDORES.md).
 *
 * O `executar.mjs` cuida de subir o servidor num banco separado. Se quiser
 * rodar um script à mão, ele fala com http://localhost:3000 por padrão —
 * ou com a porta que estiver em PORTA.
 * ══════════════════════════════════════════════════════════════════════ */

export const BASE = `http://localhost:${process.env.PORTA || 3000}`;

/**
 * Quem é quem, na ordem em que o seed cria as pessoas.
 * No protótipo a sessão é só um cookie com o id — não há senha.
 */
export const COMO = {
  alvaro: 'usuario_id=1', // Engenharia — é por onde a demonstração começa
  luiza: 'usuario_id=2', // Engenharia
  lya: 'usuario_id=3', // Arquitetura
  vanessa: 'usuario_id=4', // Arquitetura
  rafaela: 'usuario_id=5', // Estágio — só consulta
  micael: 'usuario_id=6', // Orçamento — só consulta
  thayna: 'usuario_id=7', // Coordenação — cadastra, publica e aprova
  matheus: 'usuario_id=8', // Direção — idem
};

let falhas = 0;
let total = 0;

/** Uma verificação. `condicao` verdadeira passa. */
export function ok(nome, condicao, detalhe = '') {
  total += 1;
  if (!condicao) falhas += 1;
  console.log(`${condicao ? '  ok  ' : ' FALHA'} ${nome}${detalhe ? ' — ' + detalhe : ''}`);
}

export function secao(titulo) {
  console.log(`\n${titulo}\n`);
}

/** Encerra com código de saída — é o que o executar.mjs lê. */
export function encerrar() {
  console.log(
    falhas ? `\n${falhas} de ${total} FALHARAM\n` : `\n${total} verificações, todas passaram.\n`
  );
  process.exit(falhas ? 1 : 0);
}

/* ─── Conversar com o sistema ───────────────────────────────────────── */

export const pegar = async (rota, cookie) =>
  (await fetch(BASE + rota, { headers: { cookie } })).text();

export const status = async (rota, cookie) =>
  (await fetch(BASE + rota, { headers: { cookie } })).status;

export const resposta = (rota, cookie) => fetch(BASE + rota, { headers: { cookie } });

/** Formulário comum. `dados` pode repetir chave passando um array de pares. */
export const form = (rota, cookie, dados) =>
  fetch(BASE + rota, {
    method: 'POST',
    headers: { cookie, 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(dados),
    redirect: 'manual',
  });

/** Formulário com arquivo — é como as revisões são publicadas de verdade. */
export const enviarArquivo = (rota, cookie, campos, arquivo) => {
  const fd = new FormData();
  for (const [chave, valor] of Object.entries(campos)) fd.append(chave, valor);
  if (arquivo) {
    fd.append(
      'arquivo',
      new File([Buffer.from(arquivo.conteudo ?? '%PDF-1.4 exemplo')], arquivo.nome, {
        type: arquivo.tipo ?? 'application/pdf',
      })
    );
  }
  return fetch(BASE + rota, { method: 'POST', headers: { cookie }, body: fd, redirect: 'manual' });
};

/** Tira as etiquetas do HTML, para conferir texto sem depender da marcação. */
export const semHtml = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
