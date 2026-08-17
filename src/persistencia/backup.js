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
 * Dois tipos de snapshot, e a diferença importa:
 *   - `banco-<carimbo>.db`     rotina; a rotação mantém os mais novos.
 *   - `despedida-<carimbo>.db` tirado antes do `npm run recomecar`
 *     apagar tudo. NUNCA entra na rotação (local nem no espelho) — é o
 *     único arquivo com os dados de antes do recomeço, e seria apagado
 *     em poucos dias se contasse como rotina.
 *
 * Quem chama:
 *   - servidor.js, ao subir e a cada HORAS_ENTRE_BACKUPS;
 *   - o seed, antes de `npm run recomecar` apagar tudo (despedida);
 *   - ferramentas/backup.mjs (`npm run backup`), à mão.
 *
 * O espelho (PASTA_BACKUP_ESPELHO) é o segundo destino, fora do disco —
 * a pasta do Google Drive para desktop, quando existir na máquina.
 * ⚠️ npm test e npm run test:ui LIMPAM essa variável nos processos que
 * sobem (executar.mjs, servidor-smoke.mjs): snapshot de banco de teste
 * jamais pode chegar ao espelho de verdade.
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

// Só a ROTINA rotaciona; despedida-*.db fica fora do regex de propósito.
const NOME_DE_ROTINA = /^banco-\d{4}-\d{2}-\d{2}-\d{6}\.db$/;

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

/** Apaga as rotinas além do limite. `exceto` protege o recém-criado
 *  mesmo se um relógio atrasado lhe der o nome mais antigo da pasta. */
function apagarAlemDe(pasta, manter, exceto = '') {
  // Se o protegido é uma rotina, ele ocupa uma das vagas do limite.
  const vagas = NOME_DE_ROTINA.test(exceto) ? Math.max(0, manter - 1) : manter;
  const sobrando = fs
    .readdirSync(pasta)
    .filter((nome) => NOME_DE_ROTINA.test(nome) && nome !== exceto)
    .sort() // o carimbo no nome ordena por data
    .reverse()
    .slice(vagas);
  for (const nome of sobrando) fs.rmSync(path.join(pasta, nome), { force: true });
  return sobrando.length;
}

/**
 * Tira um snapshot datado e apaga as rotinas antigas além do limite.
 * Devolve `{ arquivo, apagados }`, ou null quando ainda não há banco.
 */
export function fazerBackup({
  caminhoBanco = CAMINHO_BANCO,
  pasta = PASTA_BACKUPS,
  manter = BACKUPS_MANTIDOS,
  agora = new Date(),
  nome = 'banco',
} = {}) {
  if (!fs.existsSync(caminhoBanco)) return null;
  fs.mkdirSync(pasta, { recursive: true });

  // Nome livre: se o segundo já tem dono (outro processo, dois backups
  // no mesmo instante), avança o carimbo — nunca apaga o do outro.
  let quando = agora;
  let destino = path.join(pasta, `${nome}-${carimbo(quando)}.db`);
  while (fs.existsSync(destino)) {
    quando = new Date(quando.getTime() + 1000);
    destino = path.join(pasta, `${nome}-${carimbo(quando)}.db`);
  }

  const origem = abrirParaLer(caminhoBanco);
  try {
    origem.exec(`VACUUM INTO '${destino.replaceAll("'", "''")}'`);
  } finally {
    origem.close();
  }

  return { arquivo: destino, apagados: apagarAlemDe(pasta, manter, path.basename(destino)) };
}

/**
 * Copia UM snapshot para o espelho (a rotação de lá também só toca as
 * rotinas — despedidas nunca são apagadas). Falhar aqui não derruba
 * nada, de propósito: o espelho pode estar desmontado (o Drive fora da
 * máquina), e o backup local continua valendo.
 */
export function espelhar(arquivo, pastaEspelho = PASTA_BACKUP_ESPELHO, manter = BACKUPS_MANTIDOS) {
  if (!pastaEspelho || !arquivo || !fs.existsSync(arquivo)) return null;
  try {
    fs.mkdirSync(pastaEspelho, { recursive: true });
    const destino = path.join(pastaEspelho, path.basename(arquivo));
    fs.copyFileSync(arquivo, destino);
    apagarAlemDe(pastaEspelho, manter, path.basename(destino));
    return destino;
  } catch (erro) {
    console.error(`O espelho do backup falhou (${pastaEspelho}): ${erro.message}`);
    return null;
  }
}

/** Backup + espelho, sem deixar um erro derrubar quem chamou. */
export function backupSeguro(motivo = '', opcoes = {}) {
  try {
    const feito = fazerBackup(opcoes);
    if (!feito) return null;
    espelhar(feito.arquivo);
    console.log(`Backup do banco${motivo ? ` (${motivo})` : ''}: ${feito.arquivo}`);
    return feito;
  } catch (erro) {
    console.error(`O backup falhou: ${erro.message}`);
    return null;
  }
}
