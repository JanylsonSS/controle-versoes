// sem-servidor
/* O backup do banco: snapshot consistente (inclusive o que só está no
 * -wal!), rotação que poupa a despedida, e espelho. Fala direto com o
 * módulo, no banco de verificação que o executar.mjs acabou de semear. */

import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { ok, secao, encerrar } from './ajuda.mjs';
import { fazerBackup, espelhar } from '../src/persistencia/backup.js';
import { CAMINHO_BANCO, PASTA_DADOS } from '../src/config.js';

secao('1. O snapshot pega até o que só está no -wal');

// A razão de ser do VACUUM INTO: uma linha gravada com a conexão ainda
// aberta (sem checkpoint) tem que aparecer na cópia — um copyFileSync
// ingênuo a perderia. Checkpoint automático desligado de propósito.
const vivo = new DatabaseSync(CAMINHO_BANCO);
vivo.exec('PRAGMA wal_autocheckpoint = 0');
vivo.prepare("INSERT INTO usuarios (nome, papel) VALUES ('Só No Wal', 'ENGENHARIA')").run();

const feito = fazerBackup();
ok('o backup foi criado', Boolean(feito) && fs.existsSync(feito.arquivo));
ok('o nome carrega data e hora', /banco-\d{4}-\d{2}-\d{2}-\d{6}\.db$/.test(feito?.arquivo ?? ''));

const copia = new DatabaseSync(feito.arquivo);
const pessoas = copia.prepare('SELECT COUNT(*) AS n FROM usuarios').get();
const orientacoes = copia.prepare('SELECT COUNT(*) AS n FROM orientacoes').get();
const integra = copia.prepare('PRAGMA integrity_check').get();
copia.close();
vivo.close();

ok('a linha que só existia no -wal está na cópia (8 do seed + 1)', pessoas.n === 9);
ok('a cópia trouxe as orientações do seed', orientacoes.n > 0);
ok('a cópia passa no integrity_check', integra.integrity_check === 'ok');

secao('2. A rotação — e a despedida que ela não pode tocar');

const pasta = path.dirname(feito.arquivo);
for (const nome of [
  'banco-2020-01-01-000001.db',
  'banco-2020-01-02-000001.db',
  'banco-2020-01-03-000001.db',
]) {
  fs.copyFileSync(feito.arquivo, path.join(pasta, nome));
}
const despedida = fazerBackup({ nome: 'despedida', agora: new Date(Date.now() + 30_000) });
const segundo = fazerBackup({ manter: 2, agora: new Date(Date.now() + 60_000) });

const rotinas = fs.readdirSync(pasta).filter((n) => n.startsWith('banco-')).sort();
ok('manter=2 deixa só as 2 rotinas mais novas', rotinas.length === 2, rotinas.join(', '));
ok('as antigas de 2020 se foram', !rotinas.some((n) => n.startsWith('banco-2020')));
ok('a despedida sobrevive à rotação (fora do limite de propósito)',
  fs.existsSync(despedida.arquivo) && /despedida-\d{4}/.test(path.basename(despedida.arquivo)));

secao('3. Nome ocupado não é apagado: o carimbo avança');

const mesmoInstante = fazerBackup({ agora: new Date(Date.now() + 60_000) });
ok('dois backups no mesmo segundo geram arquivos distintos',
  mesmoInstante.arquivo !== segundo.arquivo && fs.existsSync(segundo.arquivo));

secao('4. O espelho');

const pastaEspelho = path.join(PASTA_DADOS, 'espelho-de-teste');
const espelhado = espelhar(segundo.arquivo, pastaEspelho);
ok('espelha o snapshot pedido', Boolean(espelhado) && fs.existsSync(espelhado));
ok('a despedida também espelha, e lá também fica fora da rotação',
  Boolean(espelhar(despedida.arquivo, pastaEspelho)) &&
  fs.existsSync(path.join(pastaEspelho, path.basename(despedida.arquivo))));
ok('sem espelho configurado, não faz nada', espelhar(segundo.arquivo, '') === null);

secao('5. Sem banco, sem drama');

ok('banco inexistente devolve null em vez de quebrar',
  fazerBackup({ caminhoBanco: path.join(PASTA_DADOS, 'nao-existe.db') }) === null);

encerrar();
