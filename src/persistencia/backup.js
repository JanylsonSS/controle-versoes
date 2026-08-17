/* ══════════════════════════════════════════════════════════════════════
 * BACKUP DO BANCO
 *
 * O banco vive num arquivo único (dados/banco.db) — um disco queimado
 * apagaria todo o histórico de orientações e ciências. Este módulo tira
 * snapshots consistentes SEM parar o servidor:
 *
 *   - `VACUUM INTO` copia o banco inteiro numa transação de leitura.
 *     Funciona com o WAL ativo e com o servidor no ar; copiar o arquivo
 *     na mão, não — as últimas transações podem estar só no `-wal`.
 *   - A conexão do backup abre somente-leitura: não tem como estragar
 *     o banco de verdade.
 *
 * Quem chama:
 *   - servidor.js, ao subir e a cada HORAS_ENTRE_BACKUPS;
 *   - o seed, antes de `npm run recomecar` apagar tudo (despedida);
 *   - ferramentas/backup.mjs (`npm run backup`), à mão.
 *
 * O espelho (PASTA_BACKUP_ESPELHO) é o segundo destino, fora do disco —
 * a pasta do Google Drive para desktop, quando existir na máquina.
 * ══════════════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import {
  BACKUPS_MANTIDOS,
  CAMINHO_BANCO,
  PASTA_BACKUP_ESPELHO,
  PASTA_BACKUPS,
} from '../config.js';

const NOME_DE_BACKUP = /^banco-\d{4}-\d{2}-\d{2}-\d{6}\.db$/;

function carimbo(agora) {
  const p = (n) => String(n).padStart(2, '0');
  return `${agora.getFullYear()}-${p(agora.getMonth() + 1)}-${p(agora.getDate())}` +
    `-${p(agora.getHours())}${p(agora.getMinutes())}${p(agora.getSeconds())}`;
}

// `readOnly` não existe em todo Node que o engines aceita (>= 22.5);
// quando a opção não for entendida, abrir normal ainda é seguro — o
// VACUUM INTO só lê a origem.
function abrirParaLer(caminho) {
  try {
    return new DatabaseSync(caminho, { readOnly: true });
  } catch {
    return new DatabaseSync(caminho);
  }
}

function apagarAlemDe(pasta, manter) {
  const sobrando = fs
    .readdirSync(pasta)
    .filter((nome) => NOME_DE_BACKUP.test(nome))
    .sort() // o carimbo no nome ordena por data
    .reverse()
    .slice(manter);
  for (const nome of sobrando) fs.rmSync(path.join(pasta, nome));
  return sobrando.length;
}

/**
 * Tira um snapshot datado e apaga os antigos além do limite.
 * Devolve `{ arquivo, apagados }`, ou null quando ainda não há banco.
 */
export function fazerBackup({
  caminhoBanco = CAMINHO_BANCO,
  pasta = PASTA_BACKUPS,
  manter = BACKUPS_MANTIDOS,
  agora = new Date(),
} = {}) {
  if (!fs.existsSync(caminhoBanco)) return null;
  fs.mkdirSync(pasta, { recursive: true });

  const destino = path.join(pasta, `banco-${carimbo(agora)}.db`);
  // VACUUM INTO recusa destino existente (dois backups no mesmo segundo).
  if (fs.existsSync(destino)) fs.rmSync(destino);

  const origem = abrirParaLer(caminhoBanco);
  try {
    origem.exec(`VACUUM INTO '${destino.replaceAll("'", "''")}'`);
  } finally {
    origem.close();
  }

  return { arquivo: destino, apagados: apagarAlemDe(pasta, manter) };
}

/**
 * Copia o snapshot mais novo para o espelho. Falhar aqui não derruba
 * nada, de propósito: o espelho pode estar desmontado (o Drive fora da
 * máquina), e o backup local continua valendo.
 */
export function espelharUltimo(
  pastaEspelho = PASTA_BACKUP_ESPELHO,
  pastaOrigem = PASTA_BACKUPS,
  manter = BACKUPS_MANTIDOS,
) {
  if (!pastaEspelho || !fs.existsSync(pastaOrigem)) return null;
  const ultimo = fs
    .readdirSync(pastaOrigem)
    .filter((nome) => NOME_DE_BACKUP.test(nome))
    .sort()
    .at(-1);
  if (!ultimo) return null;

  try {
    fs.mkdirSync(pastaEspelho, { recursive: true });
    const destino = path.join(pastaEspelho, ultimo);
    fs.copyFileSync(path.join(pastaOrigem, ultimo), destino);
    apagarAlemDe(pastaEspelho, manter);
    return destino;
  } catch (erro) {
    console.error(`O espelho do backup falhou (${pastaEspelho}): ${erro.message}`);
    return null;
  }
}

/** Backup + espelho, sem deixar um erro derrubar quem chamou. */
export function backupSeguro(motivo = '') {
  try {
    const feito = fazerBackup();
    if (!feito) return null;
    espelharUltimo();
    console.log(`Backup do banco${motivo ? ` (${motivo})` : ''}: ${feito.arquivo}`);
    return feito;
  } catch (erro) {
    console.error(`O backup falhou: ${erro.message}`);
    return null;
  }
}
