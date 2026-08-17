/* O smoke test do frontend:  npm run test:ui  (na raiz)
 *
 * Sobe o servidor de verdade (node servidor.js) servindo o build de
 * dist/, num banco descartável (dados-smoke/, porta 3998) — o mesmo
 * isolamento que o npm test usa para a API.
 *
 * Os cenários são SEQUENCIAIS de propósito (workers: 1): publicar →
 * confirmar → aprovar contam uma história sobre o mesmo banco. */

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './smoke',
  workers: 1,
  fullyParallel: false,
  timeout: 30_000,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3998',
  },
  webServer: {
    command: 'node ../ferramentas/servidor-smoke.mjs',
    url: 'http://localhost:3998/api/sessao',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
