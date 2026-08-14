import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* Em desenvolvimento, o Vite roda em :5173 e repassa /api para o servidor
 * Node em :3000 — os dois sobem lado a lado.
 * O build sai em ../dist, que o servidor.js já serve sozinho: compilar e
 * abrir :3000 é tudo o que a produção local precisa. */
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': 'http://localhost:3000' },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
