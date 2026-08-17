/* ══════════════════════════════════════════════════════════════════════
 * CONEXÃO E ESQUEMA DO BANCO
 *
 * Este arquivo e o `repositorio.js` são os ÚNICOS que conhecem SQL.
 * O resto do sistema fala apenas com o repositório.
 *
 * ── Mudança de modelo, 13/08/2026 ────────────────────────────────────
 * O sistema deixou de versionar arquivos e passou a registrar
 * ORIENTAÇÕES: "mudou o orçamento", "mudou a estrutura". Cada orientação
 * tem título, data, descrição e quem vai fazer — e vira automaticamente
 * uma atividade no quadro.
 *
 * Não existe mais revisão numerada nem "versão vigente". A orientação
 * mais recente é a que vale; as anteriores ficam no histórico, para
 * comparar quando o cliente pedir mudança em reunião.
 * ══════════════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { CAMINHO_BANCO, PASTA_DADOS } from '../config.js';

fs.mkdirSync(PASTA_DADOS, { recursive: true });

export const banco = new DatabaseSync(CAMINHO_BANCO);

banco.exec('PRAGMA foreign_keys = ON');
banco.exec('PRAGMA journal_mode = WAL');

banco.exec(`
  -- A equipe. Sem senha ainda: o login com conta Google depende da
  -- hospedagem (ver PENDENCIAS.md).
  CREATE TABLE IF NOT EXISTS usuarios (
    id     INTEGER PRIMARY KEY,
    nome   TEXT NOT NULL,
    papel  TEXT NOT NULL,
    email  TEXT
  );

  CREATE TABLE IF NOT EXISTS projetos (
    id               INTEGER PRIMARY KEY,
    codigo           TEXT NOT NULL UNIQUE,
    nome             TEXT NOT NULL,
    local            TEXT,
    criado_em        TEXT NOT NULL,
    cliente          TEXT,
    numero_contrato  TEXT,
    data_inicio      TEXT,
    prazo            TEXT,
    situacao         TEXT NOT NULL DEFAULT 'EM_PROJETO',
    tipo             TEXT NOT NULL DEFAULT 'OUTRO',
    conjunto         TEXT,
    link_drive       TEXT,
    caminho_rede     TEXT
  );

  -- R19 — quem trabalha em qual projeto. Decide, ao mesmo tempo, quem VÊ
  -- o projeto e quem é AVISADO quando ele muda.
  CREATE TABLE IF NOT EXISTS equipes (
    projeto_id INTEGER NOT NULL REFERENCES projetos(id),
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    PRIMARY KEY (projeto_id, usuario_id)
  );

  -- O quadro de atividades. Uma atividade pode nascer sozinha ou vir de
  -- uma orientação (coluna orientacao_id).
  CREATE TABLE IF NOT EXISTS atividades (
    id             INTEGER PRIMARY KEY,
    projeto_id     INTEGER NOT NULL REFERENCES projetos(id),
    orientacao_id  INTEGER,
    nome           TEXT NOT NULL,
    descricao      TEXT,
    responsavel_id INTEGER REFERENCES usuarios(id),
    situacao       TEXT NOT NULL CHECK (situacao IN
                     ('NAO_INICIADO','EM_EXECUCAO','REVISAO','FINALIZADO')),
    ordem          INTEGER NOT NULL DEFAULT 0,
    iniciada_em    TEXT,
    finalizada_em  TEXT,
    criada_por     INTEGER NOT NULL REFERENCES usuarios(id),
    criada_em      TEXT NOT NULL
  );

  -- ORIENTAÇÃO: o que mudou no projeto e quem vai executar.
  -- A mais recente é a que vale; não há numeração nem "vigente".
  --
  -- A aprovação (R17) continua existindo para mudança de orçamento ou
  -- prazo, mas NÃO segura nada: a atividade já nasce e a pessoa já é
  -- avisada. O aval é registro em paralelo, não portão.
  CREATE TABLE IF NOT EXISTS orientacoes (
    id                      INTEGER PRIMARY KEY,
    projeto_id              INTEGER NOT NULL REFERENCES projetos(id),
    titulo                  TEXT NOT NULL,
    descricao               TEXT NOT NULL,
    -- R15: de onde a mudança veio ("pedido do cliente na reunião de
    -- 12/08", "ofício da prefeitura") — opcional, mas é o que responde
    -- "eu não pedi isso" meses depois.
    origem                  TEXT,
    data_da_mudanca         TEXT NOT NULL,
    responsavel_id          INTEGER REFERENCES usuarios(id),
    atividade_id            INTEGER REFERENCES atividades(id),
    muda_orcamento_ou_prazo INTEGER NOT NULL DEFAULT 0,
    aprovada_por            INTEGER REFERENCES usuarios(id),
    aprovada_em             TEXT,
    reprovada_por           INTEGER REFERENCES usuarios(id),
    reprovada_em            TEXT,
    motivo_reprovacao       TEXT,
    publicada_por           INTEGER NOT NULL REFERENCES usuarios(id),
    publicada_em            TEXT NOT NULL,
    editada_por             INTEGER REFERENCES usuarios(id),
    editada_em              TEXT
  );

  -- R6 — quem foi avisado de uma orientação e se confirmou que viu.
  -- Confirmar continua sendo esperado, mas NÃO bloqueia mais nada.
  CREATE TABLE IF NOT EXISTS avisos (
    id             INTEGER PRIMARY KEY,
    orientacao_id  INTEGER NOT NULL REFERENCES orientacoes(id),
    usuario_id     INTEGER NOT NULL REFERENCES usuarios(id),
    enviado_em     TEXT NOT NULL,
    confirmado_em  TEXT,
    UNIQUE (orientacao_id, usuario_id)
  );

  -- Registro de andamento: o que fiz, dificuldade, dúvida em aberto.
  CREATE TABLE IF NOT EXISTS andamentos (
    id             INTEGER PRIMARY KEY,
    projeto_id     INTEGER NOT NULL REFERENCES projetos(id),
    usuario_id     INTEGER NOT NULL REFERENCES usuarios(id),
    o_que_fiz      TEXT NOT NULL,
    dificuldade    TEXT,
    duvida         TEXT,
    registrado_em  TEXT NOT NULL
  );

  -- Agenda: reunião e visita técnica, por pessoa — um compromisso com
  -- vários participantes vira uma linha por pessoa. Desde 17/08 TODOS
  -- marcam (para si e para colegas); o controle é transparência: quando
  -- ninguém da coordenação participa, ela ganha uma linha AUTOMÁTICA e
  -- fica ciente (ver regras/notificacao.js).
  CREATE TABLE IF NOT EXISTS agenda (
    id                       INTEGER PRIMARY KEY,
    tipo                     TEXT NOT NULL CHECK (tipo IN ('REUNIAO','VISITA_TECNICA')),
    dia                      TEXT NOT NULL,
    hora                     TEXT,
    descricao                TEXT NOT NULL,
    participante_id          INTEGER NOT NULL REFERENCES usuarios(id),
    criada_por               INTEGER NOT NULL REFERENCES usuarios(id),
    criada_em                TEXT NOT NULL,
    incluido_automaticamente INTEGER NOT NULL DEFAULT 0
  );

  -- Quem avisa a coordenação de que o cadastro do projeto está errado.
  CREATE TABLE IF NOT EXISTS flags_cadastro (
    id            INTEGER PRIMARY KEY,
    projeto_id    INTEGER NOT NULL REFERENCES projetos(id),
    usuario_id    INTEGER NOT NULL REFERENCES usuarios(id),
    campo         TEXT,
    observacao    TEXT,
    criado_em     TEXT NOT NULL,
    resolvido_em  TEXT,
    resolvido_por INTEGER REFERENCES usuarios(id)
  );

  -- Enquanto o login (R16) espera a hospedagem, qualquer um troca o
  -- "entrar como". Esta tabela não impede a troca — registra: quem era,
  -- quem virou, de que endereço e quando. É o rastro que responde
  -- "quem estava como a direção na terça?" durante o piloto.
  CREATE TABLE IF NOT EXISTS trocas_de_sessao (
    id               INTEGER PRIMARY KEY,
    de_usuario_id    INTEGER REFERENCES usuarios(id),
    para_usuario_id  INTEGER NOT NULL REFERENCES usuarios(id),
    ip               TEXT,
    quando           TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_orientacoes_projeto ON orientacoes(projeto_id, publicada_em);
  CREATE INDEX IF NOT EXISTS idx_avisos_usuario      ON avisos(usuario_id);
  CREATE INDEX IF NOT EXISTS idx_equipes_usuario     ON equipes(usuario_id);
  CREATE INDEX IF NOT EXISTS idx_andamentos_projeto  ON andamentos(projeto_id);
  CREATE INDEX IF NOT EXISTS idx_atividades_projeto  ON atividades(projeto_id, situacao, ordem);
  CREATE INDEX IF NOT EXISTS idx_agenda_participante ON agenda(participante_id, dia);
`);

/* ─── Limpeza do modelo antigo ──────────────────────────────────────────
 * Bancos criados antes de 13/08/2026 têm tabelas que não existem mais:
 *   revisoes              → virou orientacoes (sem numeração)
 *   incidentes            → retrabalho foi removido do sistema
 *   acessos_versao_antiga → não há mais "versão antiga" para registrar
 * Os dados dessas tabelas não têm para onde migrar: o modelo mudou de
 * forma, não de formato. */
for (const tabela of ['acessos_versao_antiga', 'incidentes', 'revisoes']) {
  banco.exec(`DROP TABLE IF EXISTS ${tabela}`);
}

/* ─── Migrações leves ───────────────────────────────────────────────────
 * O CREATE TABLE IF NOT EXISTS não acrescenta coluna em banco que já
 * existe — colunas novas entram aqui, uma a uma, com o porquê. */

// R15 (17/08/2026): a origem da mudança entrou depois do pivô.
const colunasDeOrientacoes = banco
  .prepare("SELECT name FROM pragma_table_info('orientacoes')")
  .all()
  .map((c) => c.name);
if (!colunasDeOrientacoes.includes('origem')) {
  banco.exec('ALTER TABLE orientacoes ADD COLUMN origem TEXT');
}

// 17/08/2026: a linha automática da coordenação na agenda.
const colunasDeAgenda = banco
  .prepare("SELECT name FROM pragma_table_info('agenda')")
  .all()
  .map((c) => c.name);
if (!colunasDeAgenda.includes('incluido_automaticamente')) {
  banco.exec('ALTER TABLE agenda ADD COLUMN incluido_automaticamente INTEGER NOT NULL DEFAULT 0');
}

/** Verdadeiro quando o banco ainda não tem dados (usado para popular o seed). */
export function estaVazio() {
  return banco.prepare('SELECT COUNT(*) AS n FROM projetos').get().n === 0;
}
