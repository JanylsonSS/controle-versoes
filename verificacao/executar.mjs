/* ══════════════════════════════════════════════════════════════════════
 * EXECUTA TODAS AS VERIFICAÇÕES
 *
 *     npm test
 *
 * Para cada script, na ordem:
 *   1. apaga e recria o banco de verificação;
 *   2. sobe um servidor só para ele;
 *   3. roda o script;
 *   4. derruba o servidor.
 *
 * Recriar entre um script e outro é necessário: eles publicam revisões,
 * aprovam e cadastram, então sujam os dados de propósito.
 *
 * ── Por que porta e banco separados ──────────────────────────────────
 * O executor usa a pasta `dados-verificacao/` e a porta 3999. Assim dá
 * para rodar a verificação com a demonstração aberta na porta 3000 sem
 * apagar nada do que estiver na tela. Isso vem das variáveis PASTA_DADOS
 * e PORTA, lidas em src/config.js.
 *
 * ── Sobre os números fixos nos scripts ───────────────────────────────
 * Alguns scripts falam em /revisoes/4 ou /arquivos/11. Esses ids vêm da
 * ordem em que o seed cria as coisas, que é determinística. Se você mexer
 * na ordem do seed, alguns scripts vão quebrar — e devem mesmo, para você
 * perceber.
 * ══════════════════════════════════════════════════════════════════════ */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..');

const PORTA = process.env.PORTA_VERIFICACAO || '3999';
const PASTA_DADOS = 'dados-verificacao';
const AMBIENTE = { ...process.env, PORTA, PASTA_DADOS };

const SCRIPTS = fs
  .readdirSync(AQUI)
  .filter((nome) => /^\d\d-.*\.mjs$/.test(nome))
  .sort();

if (!SCRIPTS.length) {
  console.error('Nenhum script de verificação encontrado em verificacao/.');
  process.exit(1);
}

/** Roda um comando até o fim. `silencioso` engole a saída. */
function rodar(args, { silencioso = false } = {}) {
  return new Promise((resolve) => {
    const filho = spawn(process.execPath, args, {
      cwd: RAIZ,
      env: AMBIENTE,
      stdio: silencioso ? 'ignore' : 'inherit',
    });
    filho.on('exit', (codigo) => resolve(codigo ?? 1));
  });
}

/** Sobe o servidor e devolve o processo, já respondendo. */
async function subirServidor() {
  const servidor = spawn(process.execPath, ['servidor.js'], {
    cwd: RAIZ,
    env: AMBIENTE,
    stdio: 'ignore',
  });

  for (let tentativa = 0; tentativa < 60; tentativa += 1) {
    try {
      await fetch(`http://localhost:${PORTA}/`);
      return servidor;
    } catch {
      await new Promise((r) => setTimeout(r, 150));
    }
  }
  servidor.kill();
  throw new Error(`O servidor não respondeu na porta ${PORTA} em 9 segundos.`);
}

function derrubar(servidor) {
  return new Promise((resolve) => {
    if (servidor.exitCode !== null) return resolve();
    servidor.once('exit', resolve);
    servidor.kill();
    setTimeout(resolve, 2000); // não trava se o processo demorar a morrer
  });
}

/* ─── Vai ────────────────────────────────────────────────────────────── */

console.log(`\nVerificando na porta ${PORTA}, com banco em ${PASTA_DADOS}/`);
console.log('(a demonstração na porta 3000, se estiver aberta, não é tocada)\n');

const resultados = [];

for (const script of SCRIPTS) {
  console.log('─'.repeat(70));
  console.log(script);
  console.log('─'.repeat(70));

  fs.rmSync(path.join(RAIZ, PASTA_DADOS), { recursive: true, force: true });
  await rodar(['src/persistencia/seed.js', '--recriar'], { silencioso: true });

  // Script marcado com "sem-servidor" fala direto com o repositório —
  // é assim que se verifica o domínio sem depender da camada web.
  const precisaDeServidor = !fs
    .readFileSync(path.join(AQUI, script), 'utf8')
    .includes('// sem-servidor');

  let servidor = null;
  if (precisaDeServidor) {
    try {
      servidor = await subirServidor();
    } catch (erro) {
      console.error(`  FALHA ao subir o servidor: ${erro.message}`);
      resultados.push({ script, codigo: 1 });
      continue;
    }
  }

  const codigo = await rodar([path.join('verificacao', script)]);
  if (servidor) await derrubar(servidor);
  resultados.push({ script, codigo });
}

fs.rmSync(path.join(RAIZ, PASTA_DADOS), { recursive: true, force: true });

console.log('═'.repeat(70));
console.log('RESUMO');
console.log('═'.repeat(70));
for (const { script, codigo } of resultados) {
  console.log(`  ${codigo === 0 ? 'passou' : 'FALHOU'}  ${script}`);
}

const quebrados = resultados.filter((r) => r.codigo !== 0).length;
console.log(
  quebrados
    ? `\n${quebrados} de ${resultados.length} script(s) falharam.\n`
    : `\nTudo passou (${resultados.length} scripts).\n`
);
process.exit(quebrados ? 1 : 0);
