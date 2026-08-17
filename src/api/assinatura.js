/* ══════════════════════════════════════════════════════════════════════
 * ASSINATURA DO COOKIE DE SESSÃO
 *
 * A revisão adversarial provou o óbvio: um cookie `usuario_id=8` em
 * texto puro era forjável com um curl — alguém viraria a direção SEM
 * passar pelo POST /api/sessao, e portanto sem linha no rastro de
 * trocas. Assinado, o cookie só nasce no servidor: toda mudança de
 * identidade é obrigada a passar pela troca registrada.
 *
 * O segredo é um por instalação, gerado na primeira vez e guardado em
 * PASTA_DADOS (fora do git, junto do banco — quem tem acesso ao disco
 * já tem acesso ao banco de qualquer jeito). Isto NÃO é o login (R16):
 * a troca continua livre; ela só deixou de ser anônima.
 * ══════════════════════════════════════════════════════════════════════ */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { PASTA_DADOS } from '../config.js';

const CAMINHO_SEGREDO = path.join(PASTA_DADOS, 'segredo-sessao.txt');

function carregarSegredo() {
  try {
    return fs.readFileSync(CAMINHO_SEGREDO, 'utf8').trim();
  } catch {
    fs.mkdirSync(PASTA_DADOS, { recursive: true });
    const novo = crypto.randomBytes(32).toString('hex');
    try {
      // 'wx' = só cria se não existe: dois processos subindo juntos não
      // se atropelam — quem perder a corrida lê o do vencedor.
      fs.writeFileSync(CAMINHO_SEGREDO, novo, { flag: 'wx' });
      return novo;
    } catch {
      return fs.readFileSync(CAMINHO_SEGREDO, 'utf8').trim();
    }
  }
}

const SEGREDO = carregarSegredo();

function assinatura(id) {
  return crypto.createHmac('sha256', SEGREDO).update(String(id)).digest('hex').slice(0, 32);
}

/** id → valor do cookie: "8.3f2a…". */
export function valorDeSessao(usuarioId) {
  return `${Number(usuarioId)}.${assinatura(Number(usuarioId))}`;
}

/** valor do cookie → id, ou null (ausente, forjado ou do formato antigo). */
export function usuarioDoValor(valor) {
  const [id, dada] = String(valor ?? '').split('.');
  if (!id || !dada) return null;
  const esperada = assinatura(id);
  if (dada.length !== esperada.length) return null;
  return crypto.timingSafeEqual(Buffer.from(dada), Buffer.from(esperada)) ? Number(id) : null;
}
