// sem-servidor
/* O backup do banco: snapshot consistente, rotação e espelho.
 * Fala direto com o módulo (src/persistencia/backup.js), no banco de
 * verificação que o executar.mjs acabou de semear. */

import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { ok, secao, encerrar } from './ajuda.mjs';
import { fazerBackup, espelharUltimo } from '../src/persistencia/backup.js';
import { PASTA_DADOS } from '../src/config.js';

secao('1. O snapshot');

const feito = fazerBackup();
ok('o backup foi criado', Boolean(feito) && fs.existsSync(feito.arquivo));
ok('o nome carrega data e hora', /banco-\d{4}-\d{2}-\d{2}-\d{6}\.db$/.test(feito?.arquivo ?? ''));

const copia = new DatabaseSync(feito.arquivo);
const pessoas = copia.prepare('SELECT COUNT(*) AS n FROM usuarios').get();
const orientacoes = copia.prepare('SELECT COUNT(*) AS n FROM orientacoes').get();
copia.close();
ok('a cópia abre e tem as 8 pessoas', pessoas.n === 8);
ok('a cópia trouxe as orientações do seed', orientacoes.n > 0);

secao('2. A rotação');

const pasta = path.dirname(feito.arquivo);
for (const nome of [
  'banco-2020-01-01-000001.db',
  'banco-2020-01-02-000001.db',
  'banco-2020-01-03-000001.db',
]) {
  fs.copyFileSync(feito.arquivo, path.join(pasta, nome));
}
// `agora` um minuto no futuro: senão este snapshot cai no mesmo segundo
// do primeiro e o sobrescreve (que é o comportamento certo do módulo).
fazerBackup({ manter: 2, agora: new Date(Date.now() + 60_000) });
const sobraram = fs.readdirSync(pasta).filter((n) => /^banco-.*\.db$/.test(n)).sort();
ok('manter=2 deixa só os 2 mais novos', sobraram.length === 2, sobraram.join(', '));
ok('os antigos de 2020 se foram', !sobraram.some((n) => n.startsWith('banco-2020')));

secao('3. O espelho');

const pastaEspelho = path.join(PASTA_DADOS, 'espelho-de-teste');
const espelhado = espelharUltimo(pastaEspelho);
ok('espelha o snapshot mais novo', Boolean(espelhado) && fs.existsSync(espelhado));
ok('sem espelho configurado, não faz nada', espelharUltimo('') === null);

secao('4. Sem banco, sem drama');

ok('banco inexistente devolve null em vez de quebrar',
  fazerBackup({ caminhoBanco: path.join(PASTA_DADOS, 'nao-existe.db') }) === null);

encerrar();
