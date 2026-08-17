/* Tira um backup do banco agora:  npm run backup
 *
 * Pode rodar com o servidor no ar — o snapshot é consistente
 * (VACUUM INTO; ver src/persistencia/backup.js). */

import { espelhar, fazerBackup } from '../src/persistencia/backup.js';
import { PASTA_BACKUP_ESPELHO } from '../src/config.js';

let feito;
try {
  feito = fazerBackup();
} catch (erro) {
  console.error(`O backup falhou: ${erro.message}`);
  process.exit(1);
}

if (!feito) {
  console.log('Ainda não existe banco para copiar (dados/banco.db).');
  process.exit(0);
}

console.log(`Backup criado: ${feito.arquivo}`);
if (feito.apagados) console.log(`Backups antigos apagados: ${feito.apagados}`);

if (!PASTA_BACKUP_ESPELHO) {
  console.log('Sem espelho configurado (variável PASTA_BACKUP_ESPELHO) — só a cópia local.');
} else {
  const espelhado = espelhar(feito.arquivo);
  if (espelhado) console.log(`Espelhado em: ${espelhado}`);
  else console.error(`O espelho está configurado (${PASTA_BACKUP_ESPELHO}) mas a cópia FALHOU — veja o erro acima.`);
}
