import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
export const RAIZ = path.resolve(AQUI, '..');

/* ══════════════════════════════════════════════════════════════════════
 * NOME EXIBIDO NA TELA
 *
 * Veio do modelo visual aprovado ("Promav — Gestão de projetos").
 * Este é o ÚNICO lugar do código onde ele mora: o frontend recebe pelo
 * /api/sessao. Trocar aqui troca em todas as telas.
 * ══════════════════════════════════════════════════════════════════════ */
export const NOME_EXIBICAO = 'Promav';
export const CHAMADA = 'Gestão de projetos';

export const PORTA = Number(process.env.PORTA || 3000);
export const FUSO = 'America/Sao_Paulo';

/* Onde ficam os dados. A variável de ambiente PASTA_DADOS existe para a
 * verificação automática rodar num banco separado — assim `npm test`
 * nunca apaga os dados da demonstração. */
export const PASTA_DADOS = path.resolve(RAIZ, process.env.PASTA_DADOS || 'dados');
export const CAMINHO_BANCO = path.join(PASTA_DADOS, 'banco.db');

/* Backup (ver src/persistencia/backup.js). Os snapshots ficam dentro de
 * PASTA_DADOS e sobrevivem ao `npm run recomecar`, que só apaga o banco.
 * O espelho é um segundo destino FORA do disco — ex.: a pasta do Google
 * Drive para desktop — e fica vazio até alguém apontá-lo. */
export const PASTA_BACKUPS = path.join(PASTA_DADOS, 'backups');
// resolve(RAIZ, ...) como a PASTA_DADOS: um valor relativo não pode
// depender de ONDE o comando foi rodado, senão o espelho fragmenta.
export const PASTA_BACKUP_ESPELHO = process.env.PASTA_BACKUP_ESPELHO
  ? path.resolve(RAIZ, process.env.PASTA_BACKUP_ESPELHO)
  : '';
export const HORAS_ENTRE_BACKUPS = 6;
export const BACKUPS_MANTIDOS = 40;

/* O frontend em React é compilado para `dist/` (npm run app:build — o
 * iniciar.bat roda isso sozinho quando falta). Enquanto o build não
 * existir nesta máquina, o servidor mostra a página provisória de
 * `publico/`. */
export const PASTA_DIST = path.join(RAIZ, 'dist');
export const PASTA_PUBLICA = path.join(RAIZ, 'publico');
