/* ══════════════════════════════════════════════════════════════════════
 * REPOSITÓRIO — a única porta de entrada para os dados.
 *
 * Nenhuma tela e nenhuma rota escreve SQL. Se o banco mudar, mudam este
 * arquivo e o `banco.js`; o resto não percebe.
 * ══════════════════════════════════════════════════════════════════════ */

import { banco } from './banco.js';
import { quemDeveSerAvisado } from '../regras/notificacao.js';

const agora = () => new Date().toISOString();

/* ─── Pessoas ───────────────────────────────────────────────────────── */

export const usuarios = {
  todos: () => banco.prepare('SELECT * FROM usuarios ORDER BY id').all(),
  porId: (id) => banco.prepare('SELECT * FROM usuarios WHERE id = ?').get(Number(id)),
  criar({ nome, papel, email }) {
    const r = banco
      .prepare('INSERT INTO usuarios (nome, papel, email) VALUES (?, ?, ?)')
      .run(nome, papel, email ?? null);
    return Number(r.lastInsertRowid);
  },
};

/* ─── Projetos ──────────────────────────────────────────────────────── */

export const projetos = {
  todos: () => banco.prepare('SELECT * FROM projetos ORDER BY nome').all(),
  porId: (id) => banco.prepare('SELECT * FROM projetos WHERE id = ?').get(Number(id)),

  /** R19 — só os projetos em que a pessoa está na equipe. */
  doUsuario: (usuarioId) =>
    banco
      .prepare(
        `SELECT p.* FROM projetos p
           JOIN equipes e ON e.projeto_id = p.id
          WHERE e.usuario_id = ?
          ORDER BY p.nome`
      )
      .all(Number(usuarioId)),

  criar({ codigo, nome, local, equipe = [], ...campos }) {
    let novoId;
    banco.exec('BEGIN');
    try {
      const r = banco
        .prepare(
          `INSERT INTO projetos
             (codigo, nome, local, criado_em, cliente, numero_contrato,
              data_inicio, prazo, situacao, tipo, conjunto, link_drive, caminho_rede)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
        )
        .run(
          codigo, nome, local ?? null, agora(),
          campos.cliente ?? null, campos.numeroContrato ?? null,
          campos.dataInicio ?? null, campos.prazo ?? null,
          campos.situacao ?? 'EM_PROJETO', campos.tipo ?? 'OUTRO',
          campos.conjunto ?? null, campos.linkDrive ?? null, campos.caminhoRede ?? null
        );
      novoId = Number(r.lastInsertRowid);
      equipes.definir(novoId, equipe);
      banco.exec('COMMIT');
    } catch (erro) {
      banco.exec('ROLLBACK');
      throw erro;
    }
    return novoId;
  },

  /** A coordenação corrige o cadastro. Não mexe na equipe — isso tem rota própria. */
  atualizar(id, { codigo, nome, local, ...campos }) {
    banco
      .prepare(
        `UPDATE projetos SET
           codigo = ?, nome = ?, local = ?, cliente = ?, numero_contrato = ?,
           data_inicio = ?, prazo = ?, situacao = ?, tipo = ?, conjunto = ?,
           link_drive = ?, caminho_rede = ?
         WHERE id = ?`
      )
      .run(
        codigo, nome, local ?? null,
        campos.cliente ?? null, campos.numeroContrato ?? null,
        campos.dataInicio ?? null, campos.prazo ?? null,
        campos.situacao ?? 'EM_PROJETO', campos.tipo ?? 'OUTRO',
        campos.conjunto ?? null, campos.linkDrive ?? null, campos.caminhoRede ?? null,
        Number(id)
      );
  },

  conjuntos: () =>
    banco
      .prepare(
        `SELECT conjunto AS nome, COUNT(*) AS quantos FROM projetos
          WHERE conjunto IS NOT NULL AND conjunto <> ''
          GROUP BY conjunto ORDER BY conjunto`
      )
      .all(),

  doConjunto: (nome) =>
    banco.prepare('SELECT * FROM projetos WHERE conjunto = ? ORDER BY nome').all(nome),
};

/* ─── Equipe do projeto (R19 + R5) ──────────────────────────────────── */

export const equipes = {
  doProjeto: (projetoId) =>
    banco
      .prepare(
        `SELECT u.* FROM usuarios u
           JOIN equipes e ON e.usuario_id = u.id
          WHERE e.projeto_id = ? ORDER BY u.id`
      )
      .all(Number(projetoId)),

  contem: (projetoId, usuarioId) =>
    Boolean(
      banco
        .prepare('SELECT 1 FROM equipes WHERE projeto_id = ? AND usuario_id = ? LIMIT 1')
        .get(Number(projetoId), Number(usuarioId))
    ),

  definir(projetoId, usuarioIds) {
    banco.prepare('DELETE FROM equipes WHERE projeto_id = ?').run(Number(projetoId));
    const inserir = banco.prepare('INSERT INTO equipes (projeto_id, usuario_id) VALUES (?, ?)');
    for (const id of new Set(usuarioIds.map(Number))) inserir.run(Number(projetoId), id);
  },
};

/* ─── Orientações ───────────────────────────────────────────────────────
 * "Mudou o orçamento", "mudou a estrutura". A mais recente é a que vale;
 * as anteriores ficam no histórico para comparar. Publicar uma orientação
 * cria a atividade e avisa a equipe, num ato só. */

const SELECT_ORIENTACAO = `
  SELECT o.*,
         o.publicada_por AS autor_id,
         a.nome        AS autor_nome,
         a.papel       AS autor_papel,
         r.nome        AS responsavel_nome,
         r.papel       AS responsavel_papel,
         p.nome        AS projeto_nome,
         p.codigo      AS projeto_codigo,
         ap.nome       AS aprovador_nome
    FROM orientacoes o
    JOIN projetos p ON p.id = o.projeto_id
    JOIN usuarios a ON a.id = o.publicada_por
    LEFT JOIN usuarios r  ON r.id  = o.responsavel_id
    LEFT JOIN usuarios ap ON ap.id = o.aprovada_por
`;

export const orientacoes = {
  porId: (id) => banco.prepare(`${SELECT_ORIENTACAO} WHERE o.id = ?`).get(Number(id)),

  /** Histórico completo, da mais recente para a mais antiga. */
  doProjeto: (projetoId) =>
    banco
      .prepare(`${SELECT_ORIENTACAO} WHERE o.projeto_id = ? ORDER BY o.publicada_em DESC, o.id DESC`)
      .all(Number(projetoId)),

  /** "Informações atuais do projeto": a última publicada. */
  atualDoProjeto: (projetoId) =>
    banco
      .prepare(
        `${SELECT_ORIENTACAO} WHERE o.projeto_id = ?
          ORDER BY o.publicada_em DESC, o.id DESC LIMIT 1`
      )
      .get(Number(projetoId)),

  contar: (projetoId) =>
    banco.prepare('SELECT COUNT(*) AS n FROM orientacoes WHERE projeto_id = ?').get(Number(projetoId)).n,

  /**
   * Publica em um único ato:
   *   1. grava a orientação;
   *   2. cria a atividade para quem vai fazer (R25);
   *   3. avisa a equipe do projeto (R5).
   * A aprovação (R17) não segura nada: se muda orçamento ou prazo, fica
   * marcada para o aval aparecer na fila — mas o trabalho já pode começar.
   */
  publicar({
    projetoId, titulo, descricao, dataDaMudanca, responsavelId, autorId,
    mudaOrcamentoOuPrazo = false, quando,
  }) {
    const instante = quando ?? agora();
    let novaId;

    banco.exec('BEGIN');
    try {
      const r = banco
        .prepare(
          `INSERT INTO orientacoes
             (projeto_id, titulo, descricao, data_da_mudanca, responsavel_id,
              muda_orcamento_ou_prazo, publicada_por, publicada_em)
           VALUES (?,?,?,?,?,?,?,?)`
        )
        .run(
          Number(projetoId), titulo, descricao, dataDaMudanca,
          responsavelId ? Number(responsavelId) : null,
          mudaOrcamentoOuPrazo ? 1 : 0, Number(autorId), instante
        );
      novaId = Number(r.lastInsertRowid);

      const atividadeId = atividades.criar({
        projetoId,
        orientacaoId: novaId,
        nome: titulo,
        descricao,
        responsavelId,
        situacao: 'NAO_INICIADO',
        criadaPor: autorId,
        quando: instante,
      });
      banco.prepare('UPDATE orientacoes SET atividade_id = ? WHERE id = ?').run(atividadeId, novaId);

      avisarEquipe(novaId, projetoId, autorId, instante);
      banco.exec('COMMIT');
    } catch (erro) {
      banco.exec('ROLLBACK');
      throw erro;
    }
    return novaId;
  },

  /**
   * Editar reabre a ciência de todo mundo.
   *
   * Se o texto mudou, "eu vi" não significa mais a mesma coisa — manter as
   * confirmações antigas seria guardar uma prova falsa. A atividade ligada
   * acompanha o novo título e a nova descrição.
   */
  editar({ id, titulo, descricao, dataDaMudanca, responsavelId, editorId, quando }) {
    const instante = quando ?? agora();
    const antiga = orientacoes.porId(id);
    if (!antiga) return false;

    banco.exec('BEGIN');
    try {
      banco
        .prepare(
          `UPDATE orientacoes SET titulo = ?, descricao = ?, data_da_mudanca = ?,
                  responsavel_id = ?, editada_por = ?, editada_em = ?
            WHERE id = ?`
        )
        .run(
          titulo, descricao, dataDaMudanca,
          responsavelId ? Number(responsavelId) : null,
          Number(editorId), instante, Number(id)
        );

      if (antiga.atividade_id) {
        banco
          .prepare('UPDATE atividades SET nome = ?, descricao = ?, responsavel_id = ? WHERE id = ?')
          .run(titulo, descricao, responsavelId ? Number(responsavelId) : null, antiga.atividade_id);
      }

      // A reabertura da ciência acontece dentro de avisarEquipe (upsert):
      // para a equipe ATUAL, o prazo renova e a confirmação zera; quem já
      // saiu da equipe não é tocado — não teria como confirmar — e o
      // próprio editor não deve ciência do que ele mesmo escreveu.
      avisarEquipe(id, antiga.projeto_id, editorId, instante);

      banco.exec('COMMIT');
    } catch (erro) {
      banco.exec('ROLLBACK');
      throw erro;
    }
    return true;
  },

  /** R17 — registro do aval. Não muda o andamento do trabalho. */
  aprovar: ({ id, aprovadorId, quando }) =>
    banco
      .prepare(
        `UPDATE orientacoes SET aprovada_por = ?, aprovada_em = ?,
                reprovada_por = NULL, reprovada_em = NULL, motivo_reprovacao = NULL
          WHERE id = ?`
      )
      .run(Number(aprovadorId), quando ?? agora(), Number(id)),

  reprovar: ({ id, aprovadorId, motivo, quando }) =>
    banco
      .prepare(
        `UPDATE orientacoes SET reprovada_por = ?, reprovada_em = ?, motivo_reprovacao = ?,
                aprovada_por = NULL, aprovada_em = NULL
          WHERE id = ?`
      )
      .run(Number(aprovadorId), quando ?? agora(), motivo, Number(id)),

  /** Fila de aprovação: muda orçamento ou prazo e ninguém decidiu ainda. */
  esperandoAval: () =>
    banco
      .prepare(
        `${SELECT_ORIENTACAO}
          WHERE o.muda_orcamento_ou_prazo = 1
            AND o.aprovada_em IS NULL AND o.reprovada_em IS NULL
          ORDER BY o.publicada_em`
      )
      .all(),
};

/**
 * R5 — o aviso é consequência de publicar, não uma segunda ação que
 * alguém pode esquecer. Vai para a equipe do projeto (R19), menos quem
 * publicou. Chamada de dentro de uma transação.
 */
function avisarEquipe(orientacaoId, projetoId, autorId, instante) {
  const destinatarios = quemDeveSerAvisado(equipes.doProjeto(projetoId), { id: Number(autorId) });
  // Upsert: na publicação age como INSERT comum; na EDIÇÃO, renova o prazo
  // (enviado_em) e reabre a confirmação — senão a ciência reaberta já
  // nasceria "atrasada", contada a partir do aviso original.
  const avisar = banco.prepare(
    `INSERT INTO avisos (orientacao_id, usuario_id, enviado_em) VALUES (?, ?, ?)
     ON CONFLICT(orientacao_id, usuario_id)
     DO UPDATE SET enviado_em = excluded.enviado_em, confirmado_em = NULL`
  );
  for (const pessoa of destinatarios) avisar.run(Number(orientacaoId), pessoa.id, instante);
}

/* ─── Avisos e ciência (R5, R6) ─────────────────────────────────────── */

const SELECT_AVISO = `
  SELECT v.*,
         o.publicada_por AS autor_id,
         o.titulo     AS orientacao_titulo,
         o.descricao  AS orientacao_descricao,
         o.projeto_id AS projeto_id,
         p.nome       AS projeto_nome,
         u.nome       AS autor_nome
    FROM avisos v
    JOIN orientacoes o ON o.id = v.orientacao_id
    JOIN projetos p    ON p.id = o.projeto_id
    JOIN usuarios u    ON u.id = o.publicada_por
`;

/* R19 na leitura: quem SAIU da equipe carrega avisos antigos na tabela
 * (são histórico de ciência e não podem ser apagados), mas não pode mais
 * ler o conteúdo do projeto por eles. O EXISTS reconfere a equipe ATUAL;
 * `veTudo` é a exceção da coordenação e da direção. */
const SO_DA_EQUIPE_ATUAL = `AND EXISTS (
  SELECT 1 FROM equipes e
   WHERE e.projeto_id = o.projeto_id AND e.usuario_id = v.usuario_id
)`;

export const avisos = {
  doUsuario: (usuarioId, { apenasPendentes = false, veTudo = false } = {}) =>
    banco
      .prepare(
        `${SELECT_AVISO} WHERE v.usuario_id = ?
          ${apenasPendentes ? 'AND v.confirmado_em IS NULL' : ''}
          ${veTudo ? '' : SO_DA_EQUIPE_ATUAL}
          ORDER BY v.enviado_em DESC`
      )
      .all(Number(usuarioId)),

  contarPendentes: (usuarioId, { veTudo = false } = {}) =>
    banco
      .prepare(
        `SELECT COUNT(*) AS n FROM avisos v
           JOIN orientacoes o ON o.id = v.orientacao_id
          WHERE v.usuario_id = ? AND v.confirmado_em IS NULL
          ${veTudo ? '' : SO_DA_EQUIPE_ATUAL}`
      )
      .get(Number(usuarioId)).n,

  /** R6 — quem foi avisado desta orientação e quem já confirmou. */
  daOrientacao: (orientacaoId) =>
    banco
      .prepare(
        `SELECT v.*, u.nome AS usuario_nome, u.papel AS usuario_papel
           FROM avisos v JOIN usuarios u ON u.id = v.usuario_id
          WHERE v.orientacao_id = ?
          ORDER BY (v.confirmado_em IS NULL), v.confirmado_em, u.nome`
      )
      .all(Number(orientacaoId)),

  doUsuarioNaOrientacao: (usuarioId, orientacaoId) =>
    banco
      .prepare('SELECT * FROM avisos WHERE usuario_id = ? AND orientacao_id = ?')
      .get(Number(usuarioId), Number(orientacaoId)),

  confirmar: ({ orientacaoId, usuarioId, quando }) =>
    banco
      .prepare(
        `UPDATE avisos SET confirmado_em = ?
          WHERE orientacao_id = ? AND usuario_id = ? AND confirmado_em IS NULL`
      )
      .run(quando ?? agora(), Number(orientacaoId), Number(usuarioId)),
};

/* ─── Quadro de atividades ──────────────────────────────────────────── */

const SELECT_ATIVIDADE = `
  SELECT a.*, r.nome AS responsavel_nome, r.papel AS responsavel_papel,
         c.nome AS criador_nome, p.nome AS projeto_nome,
         a.criada_por AS autor_id, c.nome AS autor_nome
    FROM atividades a
    JOIN projetos p ON p.id = a.projeto_id
    LEFT JOIN usuarios r ON r.id = a.responsavel_id
    JOIN usuarios c ON c.id = a.criada_por
`;

export const atividades = {
  porId: (id) => banco.prepare(`${SELECT_ATIVIDADE} WHERE a.id = ?`).get(Number(id)),

  doProjeto: (projetoId) =>
    banco
      .prepare(`${SELECT_ATIVIDADE} WHERE a.projeto_id = ? ORDER BY a.ordem, a.id`)
      .all(Number(projetoId)),

  /** Para a tela inicial: "atividades em que você foi marcado".
   * Mesmo R19 da leitura de avisos: quem saiu da equipe deixa de ver. */
  doResponsavel: (usuarioId, { veTudo = false } = {}) =>
    banco
      .prepare(
        `${SELECT_ATIVIDADE} WHERE a.responsavel_id = ? AND a.situacao <> 'FINALIZADO'
          ${veTudo ? '' : `AND EXISTS (
            SELECT 1 FROM equipes e
             WHERE e.projeto_id = a.projeto_id AND e.usuario_id = a.responsavel_id
          )`}
          ORDER BY a.criada_em DESC`
      )
      .all(Number(usuarioId)),

  criar({ projetoId, orientacaoId, nome, descricao, responsavelId, situacao, criadaPor, quando }) {
    const instante = quando ?? agora();
    const ultima = banco
      .prepare('SELECT COALESCE(MAX(ordem), -1) AS n FROM atividades WHERE projeto_id = ? AND situacao = ?')
      .get(Number(projetoId), situacao).n;

    const r = banco
      .prepare(
        `INSERT INTO atividades
           (projeto_id, orientacao_id, nome, descricao, responsavel_id, situacao,
            ordem, iniciada_em, criada_por, criada_em)
         VALUES (?,?,?,?,?,?,?,?,?,?)`
      )
      .run(
        Number(projetoId), orientacaoId ? Number(orientacaoId) : null,
        nome, descricao || null, responsavelId ? Number(responsavelId) : null,
        situacao, ultima + 1,
        situacao === 'NAO_INICIADO' ? null : instante,
        Number(criadaPor), instante
      );
    return Number(r.lastInsertRowid);
  },

  atualizar: (id, { nome, descricao, responsavelId }) =>
    banco
      .prepare('UPDATE atividades SET nome = ?, descricao = ?, responsavel_id = ? WHERE id = ?')
      .run(nome, descricao || null, responsavelId ? Number(responsavelId) : null, Number(id)),

  /**
   * Move o cartão para uma coluna e uma posição. Renumera a coluna de
   * destino inteira: são poucos cartões, e assim não sobra estado torto se
   * dois movimentos acontecerem perto um do outro.
   */
  mover({ id, situacao, posicao, datas }) {
    const atividade = atividades.porId(id);
    if (!atividade) return false;

    banco.exec('BEGIN');
    try {
      for (const [campo, valor] of Object.entries(datas ?? {})) {
        banco.prepare(`UPDATE atividades SET ${campo} = ? WHERE id = ?`).run(valor, Number(id));
      }
      banco.prepare('UPDATE atividades SET situacao = ? WHERE id = ?').run(situacao, Number(id));

      const naColuna = banco
        .prepare(
          `SELECT id FROM atividades WHERE projeto_id = ? AND situacao = ? AND id <> ?
            ORDER BY ordem, id`
        )
        .all(atividade.projeto_id, situacao, Number(id))
        .map((l) => l.id);

      const destino = Math.max(0, Math.min(Number(posicao ?? naColuna.length), naColuna.length));
      naColuna.splice(destino, 0, Number(id));

      const renumerar = banco.prepare('UPDATE atividades SET ordem = ? WHERE id = ?');
      naColuna.forEach((idNaColuna, indice) => renumerar.run(indice, idNaColuna));

      banco.exec('COMMIT');
    } catch (erro) {
      banco.exec('ROLLBACK');
      throw erro;
    }
    return true;
  },

  /**
   * A orientação aponta para a atividade que criou (FK). Sem desfazer o
   * vínculo antes, o DELETE viola a FK e a atividade vinda de orientação
   * fica inapagável — a orientação sobrevive, só perde o atalho.
   */
  excluir(id) {
    banco.exec('BEGIN');
    try {
      banco.prepare('UPDATE orientacoes SET atividade_id = NULL WHERE atividade_id = ?').run(Number(id));
      banco.prepare('DELETE FROM atividades WHERE id = ?').run(Number(id));
      banco.exec('COMMIT');
    } catch (erro) {
      banco.exec('ROLLBACK');
      throw erro;
    }
  },
};

/* ─── Registro de andamento ─────────────────────────────────────────── */

export const andamentos = {
  doProjeto: (projetoId, limite = 20) =>
    banco
      .prepare(
        `SELECT a.*, a.usuario_id AS autor_id, u.nome AS autor_nome, u.papel AS autor_papel
           FROM andamentos a JOIN usuarios u ON u.id = a.usuario_id
          WHERE a.projeto_id = ?
          ORDER BY a.registrado_em DESC, a.id DESC LIMIT ?`
      )
      .all(Number(projetoId), Number(limite)),

  registrar({ projetoId, usuarioId, oQueFiz, dificuldade, duvida, quando }) {
    const r = banco
      .prepare(
        `INSERT INTO andamentos (projeto_id, usuario_id, o_que_fiz, dificuldade, duvida, registrado_em)
         VALUES (?,?,?,?,?,?)`
      )
      .run(Number(projetoId), Number(usuarioId), oQueFiz, dificuldade || null, duvida || null, quando ?? agora());
    return Number(r.lastInsertRowid);
  },
};

/* ─── Agenda: reunião e visita técnica ──────────────────────────────── */

const SELECT_AGENDA = `
  SELECT g.*, p.nome AS participante_nome, c.nome AS criador_nome,
         g.criada_por AS autor_id, c.nome AS autor_nome
    FROM agenda g
    JOIN usuarios p ON p.id = g.participante_id
    JOIN usuarios c ON c.id = g.criada_por
`;

export const agenda = {
  porId: (id) => banco.prepare(`${SELECT_AGENDA} WHERE g.id = ?`).get(Number(id)),

  /** O que está marcado para uma pessoa, entre dois dias (YYYY-MM-DD). */
  daSemana: (usuarioId, deDia, ateDia) =>
    banco
      .prepare(
        `${SELECT_AGENDA} WHERE g.participante_id = ? AND g.dia BETWEEN ? AND ?
          ORDER BY g.dia, COALESCE(g.hora, '99:99')`
      )
      .all(Number(usuarioId), deDia, ateDia),

  /** Para a tela inicial: o que a coordenação marcou para você. */
  marcadasPorOutros: (usuarioId, deDia) =>
    banco
      .prepare(
        `${SELECT_AGENDA} WHERE g.participante_id = ? AND g.criada_por <> ? AND g.dia >= ?
          ORDER BY g.dia, COALESCE(g.hora, '99:99')`
      )
      .all(Number(usuarioId), Number(usuarioId), deDia),

  criar({ tipo, dia, hora, descricao, participanteId, criadaPor, quando }) {
    const r = banco
      .prepare(
        `INSERT INTO agenda (tipo, dia, hora, descricao, participante_id, criada_por, criada_em)
         VALUES (?,?,?,?,?,?,?)`
      )
      .run(tipo, dia, hora || null, descricao, Number(participanteId), Number(criadaPor), quando ?? agora());
    return Number(r.lastInsertRowid);
  },

  excluir: (id) => banco.prepare('DELETE FROM agenda WHERE id = ?').run(Number(id)),
};

/* ─── Flags de cadastro errado ──────────────────────────────────────── */

export const flags = {
  abertasDoProjeto: (projetoId) =>
    banco
      .prepare(
        `SELECT f.*, f.usuario_id AS autor_id, u.nome AS autor_nome
           FROM flags_cadastro f JOIN usuarios u ON u.id = f.usuario_id
          WHERE f.projeto_id = ? AND f.resolvido_em IS NULL
          ORDER BY f.criado_em`
      )
      .all(Number(projetoId)),

  criar({ projetoId, usuarioId, campo, observacao, quando }) {
    const r = banco
      .prepare(
        'INSERT INTO flags_cadastro (projeto_id, usuario_id, campo, observacao, criado_em) VALUES (?,?,?,?,?)'
      )
      .run(Number(projetoId), Number(usuarioId), campo ?? null, observacao || null, quando ?? agora());
    return Number(r.lastInsertRowid);
  },

  resolver: ({ flagId, usuarioId, quando }) =>
    banco
      .prepare('UPDATE flags_cadastro SET resolvido_em = ?, resolvido_por = ? WHERE id = ?')
      .run(quando ?? agora(), Number(usuarioId), Number(flagId)),
};

/* ─── Trocas de sessão ──────────────────────────────────────────────────
 * O rastro do "entrar como" enquanto não há login (ver banco.js).
 * Nunca se apaga: é registro de auditoria, como os avisos. */

export const trocas = {
  registrar: ({ deUsuarioId, paraUsuarioId, ip, quando }) =>
    banco
      .prepare(
        'INSERT INTO trocas_de_sessao (de_usuario_id, para_usuario_id, ip, quando) VALUES (?,?,?,?)'
      )
      .run(deUsuarioId ?? null, Number(paraUsuarioId), ip ?? null, quando ?? agora()),

  ultimas: (limite = 100) =>
    banco
      .prepare(
        `SELECT t.*, de.nome AS de_nome, para.nome AS para_nome
           FROM trocas_de_sessao t
           LEFT JOIN usuarios de   ON de.id   = t.de_usuario_id
                JOIN usuarios para ON para.id = t.para_usuario_id
          ORDER BY t.id DESC LIMIT ?`
      )
      .all(Number(limite)),
};
