/* Tira um backup do banco agora:  npm run backup
 *
 * Pode rodar com o servidor no ar — o snapshot é consistente
 * (VACUUM INTO; ver src/persistencia/backup.js). */

import { espelharUltimo, fazerBackup } from '../src/persistencia/backup.js';

const feito = fazerBackup();
if (!feito) {
  console.log('Ainda não existe banco para copiar (dados/banco.db).');
  process.exit(0);
}

console.log(`Backup criado: ${feito.arquivo}`);
if (feito.apagados) console.log(`Backups antigos apagados: ${feito.apagados}`);

const espelhado = espelharUltimo();
if (espelhado) console.log(`Espelhado em: ${espelhado}`);
else console.log('Sem espelho configurado (variável PASTA_BACKUP_ESPELHO) — só a cópia local.');
