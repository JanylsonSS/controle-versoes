import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
export const RAIZ = path.resolve(AQUI, '..');

/* ══════════════════════════════════════════════════════════════════════
 * NOME EXIBIDO NA TELA
 *
 * O nome definitivo será escolhido com a equipe durante o piloto.
 * Este é o ÚNICO lugar do código onde ele aparece: trocar aqui troca em
 * todas as telas. Não repita este texto em nenhum outro arquivo.
 * ══════════════════════════════════════════════════════════════════════ */
export const NOME_EXIBICAO = 'Controle de Versões';
export const CHAMADA = 'qual versão vale agora';

export const PORTA = Number(process.env.PORTA || 3000);
export const FUSO = 'America/Sao_Paulo';

/* Onde ficam banco e arquivos. A variável de ambiente PASTA_DADOS existe para
 * a verificação automática rodar num banco separado — assim `npm test` nunca
 * apaga os dados da demonstração. Em uso normal, ninguém precisa mexer. */
export const PASTA_DADOS = path.resolve(RAIZ, process.env.PASTA_DADOS || 'dados');
export const CAMINHO_BANCO = path.join(PASTA_DADOS, 'banco.db');
export const PASTA_ARQUIVOS = path.join(PASTA_DADOS, 'arquivos');
export const PASTA_PUBLICA = path.join(RAIZ, 'publico');

/** Tamanho máximo de arquivo aceito no upload (protótipo). */
export const LIMITE_ARQUIVO_MB = 25;
