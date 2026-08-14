/* Ponto de partida do sistema.  Rodar:  node servidor.js
 *
 * O servidor faz duas coisas:
 *   /api/*  → a API JSON (src/api/)
 *   o resto → o aplicativo React compilado em dist/ (quando existir);
 *             antes disso, a página provisória de publico/.
 *
 * Antes de subir, confere o que costuma dar errado e explica em
 * português o que fazer — em vez de despejar um erro técnico na tela. */

import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

/* ─── 1. A versão do Node serve? ────────────────────────────────────── */

const VERSAO_MINIMA = [22, 5];
const versao = process.versions.node.split('.').map(Number);
if (versao[0] < VERSAO_MINIMA[0] || (versao[0] === VERSAO_MINIMA[0] && versao[1] < VERSAO_MINIMA[1])) {
  console.error(`
┌──────────────────────────────────────────────────────────────┐
│  O Node.js instalado é antigo demais.                        │
└──────────────────────────────────────────────────────────────┘

  Instalado aqui:  ${process.versions.node}
  Necessário:      22.5 ou mais novo

  O que fazer: baixe a versão LTS em https://nodejs.org, instale,
  FECHE esta janela do terminal, abra outra e rode de novo.
`);
  process.exit(1);
}

/* ─── 2. O comando está sendo rodado na pasta certa? ────────────────── */

// fileURLToPath e não `new URL(...).pathname`: em caminho com acento
// (como "C:\Users\Fábio Ernesto") o pathname vem percent-encoded.
const RAIZ = path.dirname(fileURLToPath(import.meta.url));
if (!fs.existsSync(path.join(RAIZ, 'src', 'config.js'))) {
  console.error(`
  Não encontrei os arquivos do sistema.
  Abra o terminal DENTRO da pasta do projeto (a que tem o arquivo
  servidor.js) e rode de novo:  node servidor.js
`);
  process.exit(1);
}

/* ─── 3. Agora sim ──────────────────────────────────────────────────── */

const { PORTA, NOME_EXIBICAO, PASTA_DIST, PASTA_PUBLICA } = await import('./src/config.js');
const { popularSeVazio } = await import('./src/persistencia/seed.js');
const { atenderApi } = await import('./src/api/http.js');
const { rotas } = await import('./src/api/indice.js');

if (await popularSeVazio()) {
  console.log('Primeira execução: dados de teste criados.');
}

const TIPOS_ESTATICOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

/**
 * Serve o frontend: dist/ (build do React) quando existir, senão a
 * página provisória. Qualquer rota que não seja arquivo devolve o
 * index.html — é assim que uma SPA cuida das próprias rotas.
 */
function servirFrontend(caminho, res) {
  const base = fs.existsSync(path.join(PASTA_DIST, 'index.html')) ? PASTA_DIST : PASTA_PUBLICA;

  let alvo = path.join(base, caminho);
  if (caminho.includes('..') || !alvo.startsWith(base)) alvo = path.join(base, 'index.html');
  if (!fs.existsSync(alvo) || !fs.statSync(alvo).isFile()) alvo = path.join(base, 'index.html');

  if (!fs.existsSync(alvo)) {
    res.writeHead(503, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('A API está no ar em /api. O aplicativo ainda não foi compilado.');
    return;
  }

  const extensao = path.extname(alvo).toLowerCase();
  res.writeHead(200, {
    'content-type': TIPOS_ESTATICOS[extensao] ?? 'application/octet-stream',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    // o index nunca é cacheado; os assets do Vite têm hash no nome
    'cache-control': extensao === '.html' ? 'no-store' : 'public, max-age=31536000, immutable',
  });
  fs.createReadStream(alvo).pipe(res);
}

const servidor = http.createServer((req, res) => {
  // decodeURIComponent LANÇA em percent-encoding inválido (ex.: /%E0%A4%A).
  // Sem este try, uma única requisição torta derruba o processo inteiro.
  let caminho;
  try {
    caminho = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ erro: 'Endereço malformado.' }));
    return;
  }

  const tarefa = caminho === '/api' || caminho.startsWith('/api/')
    ? atenderApi(rotas, req, res)
    : Promise.resolve(servirFrontend(caminho, res));

  tarefa.catch((erro) => {
    console.error(erro);
    if (res.headersSent) return res.end();
    res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ erro: 'Deu erro do lado do servidor.' }));
  });
});

servidor.on('error', (erro) => {
  if (erro.code === 'EADDRINUSE') {
    console.error(`
  A porta ${PORTA} já está ocupada.
  Quase sempre é o próprio sistema já rodando em outra janela do
  terminal — procure e use aquela, ou feche-a com Ctrl+C.

  Para rodar numa porta diferente:
      Windows (PowerShell):  $env:PORTA=3001; node servidor.js
`);
    process.exit(1);
  }
  throw erro;
});

servidor.listen(PORTA, () => {
  console.log(`\n${NOME_EXIBICAO} no ar.\n`);
  console.log(`  Neste computador:`);
  console.log(`      http://localhost:${PORTA}\n`);

  const { servem, naoServem } = enderecosDaRede();
  if (servem.length) {
    console.log('  Na rede do escritório:');
    for (const { endereco, adaptador } of servem) {
      console.log(`      http://${endereco}:${PORTA}       (${adaptador})`);
    }
  }
  if (naoServem.length) {
    console.log('\n  Ignore estes (são de VPN ou máquina virtual):');
    for (const { endereco, adaptador } of naoServem) {
      console.log(`      http://${endereco}:${PORTA}       (${adaptador})`);
    }
  }
  console.log('\nPara parar: Ctrl+C\n');
});

/* Vários adaptadores criam IPv4 que parece legítimo e não serve (VPN,
 * Docker, máquina virtual). Não dá para distinguir pelo número; a
 * separação é pelo nome do adaptador. */
const ADAPTADORES_QUE_NAO_SERVEM =
  /vEthernet|VMware|VirtualBox|Hyper-V|NordLynx|WireGuard|OpenVPN|ProtonVPN|Tailscale|ZeroTier|TAP-|Docker|WSL|Radmin|Bluetooth/i;

function enderecosDaRede() {
  const servem = [];
  const naoServem = [];
  for (const [adaptador, lista] of Object.entries(os.networkInterfaces())) {
    for (const i of lista ?? []) {
      if (!i || i.family !== 'IPv4' || i.internal) continue;
      (ADAPTADORES_QUE_NAO_SERVEM.test(adaptador) ? naoServem : servem)
        .push({ endereco: i.address, adaptador });
    }
  }
  return { servem, naoServem };
}
