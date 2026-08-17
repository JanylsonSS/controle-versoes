/* Sobe o servidor para o smoke test do frontend (npm run test:ui):
 * porta e banco próprios, recriados a cada rodada — a demonstração na
 * porta 3000 nunca é tocada. O Playwright chama este script sozinho
 * (webServer, em frontend/playwright.config.js). */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

process.env.PORTA = process.env.PORTA_SMOKE || '3998';
process.env.PASTA_DADOS = 'dados-smoke';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
fs.rmSync(path.join(RAIZ, 'dados-smoke'), { recursive: true, force: true });

if (!fs.existsSync(path.join(RAIZ, 'dist', 'index.html'))) {
  console.error('O smoke testa o build de verdade: rode "npm run app:build" antes.');
  process.exit(1);
}

await import('../servidor.js');
