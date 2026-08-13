/* Ponto de partida do sistema.  Rodar:  node servidor.js
 *
 * Antes de qualquer coisa, confere o que costuma dar errado e explica em
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

  O sistema usa o banco de dados que já vem dentro do Node, e ele só
  existe a partir da versão 22.5.

  O que fazer: baixe a versão LTS em https://nodejs.org, instale,
  FECHE esta janela do terminal, abra outra e rode de novo.
  (Fechar e reabrir é importante: sem isso o computador continua
  enxergando a versão antiga.)
`);
  process.exit(1);
}

/* ─── 2. O comando está sendo rodado na pasta certa? ────────────────── */

// fileURLToPath e não `new URL(...).pathname`: em caminho com acento ou
// espaço (como "C:\Users\Fábio Ernesto") o pathname vem codificado e a
// verificação daria falso negativo.
const RAIZ = path.dirname(fileURLToPath(import.meta.url));
if (!fs.existsSync(path.join(RAIZ, 'src', 'config.js'))) {
  console.error(`
  Não encontrei os arquivos do sistema.

  Abra o terminal DENTRO da pasta do projeto (a que tem o arquivo
  servidor.js) e rode de novo:

      node servidor.js
`);
  process.exit(1);
}

/* ─── 3. Agora sim ──────────────────────────────────────────────────── */

const { PORTA, NOME_EXIBICAO } = await import('./src/config.js');
const { popularSeVazio } = await import('./src/persistencia/seed.js');
const { atender } = await import('./src/web/roteador.js');

if (await popularSeVazio()) {
  console.log('Primeira execução: dados de teste criados.');
}

const servidor = http.createServer((req, res) => {
  atender(req, res).catch((erro) => {
    console.error(erro);
    if (res.headersSent) return res.end();
    res.writeHead(500, { 'content-type': 'text/html; charset=utf-8' });
    res.end('<h1>Deu erro aqui do lado</h1><p><a href="/">Voltar</a></p>');
  });
});

servidor.on('error', (erro) => {
  if (erro.code === 'EADDRINUSE') {
    console.error(`
  A porta ${PORTA} já está ocupada.

  Quase sempre é o próprio sistema já rodando em outra janela do
  terminal — procure e use aquela, ou feche-a com Ctrl+C.

  Se precisar rodar numa porta diferente:
      Windows (PowerShell):  $env:PORTA=3001; node servidor.js
      Mac / Linux:           PORTA=3001 node servidor.js
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
    console.log('  No celular (mesma rede Wi-Fi):');
    for (const { endereco, adaptador } of servem) {
      console.log(`      http://${endereco}:${PORTA}       (${adaptador})`);
    }
  } else {
    console.log('  Nenhum endereço de rede encontrado — o computador parece estar');
    console.log('  sem Wi-Fi nem cabo. Sem isso, o celular não consegue abrir.');
  }

  if (naoServem.length) {
    console.log('\n  Ignore estes (são de VPN ou máquina virtual, o celular não alcança):');
    for (const { endereco, adaptador } of naoServem) {
      console.log(`      http://${endereco}:${PORTA}       (${adaptador})`);
    }
    console.log('\n  Se o celular não abrir mesmo usando o endereço certo, desligue a VPN:');
    console.log('  muitas bloqueiam o acesso entre aparelhos da rede local.');
  }

  console.log('\nPara parar: Ctrl+C\n');
});

/* R10 — a obra confere a versão pelo celular, então o endereço de rede
 * precisa aparecer. O problema é que VPN, Docker e máquina virtual criam
 * endereços IPv4 que parecem legítimos e não servem: quem tentar por eles
 * conclui que o acesso pelo celular está quebrado.
 *
 * Não dá para distinguir pelo número (todos são de faixa privada), então a
 * separação é pelo nome do adaptador. A lista abaixo cobre os casos comuns
 * no Windows; se aparecer um caso novo, é só acrescentar aqui. */
const ADAPTADORES_QUE_NAO_SERVEM =
  /vEthernet|VMware|VirtualBox|Hyper-V|NordLynx|WireGuard|OpenVPN|ProtonVPN|Tailscale|ZeroTier|TAP-|Docker|WSL|Radmin|Bluetooth/i;

function enderecosDaRede() {
  const servem = [];
  const naoServem = [];

  for (const [adaptador, lista] of Object.entries(os.networkInterfaces())) {
    for (const i of lista ?? []) {
      if (!i || i.family !== 'IPv4' || i.internal) continue;
      const entrada = { endereco: i.address, adaptador };
      if (ADAPTADORES_QUE_NAO_SERVEM.test(adaptador)) naoServem.push(entrada);
      else servem.push(entrada);
    }
  }
  return { servem, naoServem };
}
