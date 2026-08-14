/* ══════════════════════════════════════════════════════════════════════
 * ORIENTAÇÕES: a mudança do projeto e tudo o que ela dispara.
 *
 * Publicar = gravar + criar a atividade + avisar a equipe, num ato só
 * (o repositório garante, em transação). Editar reabre a ciência de
 * todos. A aprovação registra o aval sem segurar o trabalho.
 * ══════════════════════════════════════════════════════════════════════ */

import { orientacoes, avisos, usuarios, equipes } from '../persistencia/repositorio.js';
import { podePublicar } from '../regras/papeis.js';
import { ehAprovador, porQueNaoPodeAprovar } from '../regras/aprovacao.js';
import { estaAtrasado } from '../regras/ciencia.js';
import { veTodosOsProjetos } from '../regras/visibilidade.js';
import { ErroApi, exigir, texto, textoOpcional, dia } from './http.js';
import { projetoVisivel, orientacaoVisivel } from './guardas.js';

/** O responsável precisa existir e estar na equipe — senão a atividade
 * nasce para alguém que nem enxerga o projeto. */
function validarResponsavel(corpo, projetoId) {
  const id = corpo.responsavel_id == null || corpo.responsavel_id === ''
    ? null
    : Number(corpo.responsavel_id);
  if (id === null) return null;
  exigir(usuarios.porId(id), 400, 'O responsável indicado não existe.');
  exigir(equipes.contem(projetoId, id), 400,
    'O responsável precisa estar na equipe do projeto — inclua a pessoa primeiro.');
  return id;
}

function comCiencia(orientacao, usuario) {
  const ciencia = avisos
    .daOrientacao(orientacao.id)
    .map((a) => ({ ...a, atrasado: estaAtrasado(a) }));
  const meu = avisos.doUsuarioNaOrientacao(usuario.id, orientacao.id);
  return {
    orientacao,
    ciencia,
    minha_confirmacao_pendente: Boolean(meu && !meu.confirmado_em),
  };
}

export const rotasDeOrientacoes = [
  /* O histórico do dropdown: todas, da mais recente para a mais antiga.
   * A primeira é a que vale hoje. */
  ['GET', '/api/projetos/:id/orientacoes', ({ usuario, params }) => {
    const projeto = projetoVisivel(usuario, params.id);
    return { orientacoes: orientacoes.doProjeto(projeto.id) };
  }],

  ['GET', '/api/orientacoes/:id', ({ usuario, params }) =>
    comCiencia(orientacaoVisivel(usuario, params.id), usuario)],

  ['POST', '/api/projetos/:id/orientacoes', ({ usuario, params, corpo }) => {
    exigir(podePublicar(usuario), 403,
      'Publicar orientação é de quem projeta, da coordenação e da direção.');
    const projeto = projetoVisivel(usuario, params.id);

    const id = orientacoes.publicar({
      projetoId: projeto.id,
      titulo: texto(corpo, 'titulo', 'Dê um título à mudança — é o que aparece para todo mundo.'),
      descricao: texto(corpo, 'descricao', 'Descreva a mudança: é isso que a pessoa vai ler.'),
      dataDaMudanca: dia(corpo, 'data_da_mudanca', 'Informe a data da mudança (AAAA-MM-DD).'),
      responsavelId: validarResponsavel(corpo, projeto.id),
      autorId: usuario.id,
      mudaOrcamentoOuPrazo: Boolean(corpo.muda_orcamento_ou_prazo),
    });
    return { id, atividade_id: orientacoes.porId(id).atividade_id };
  }],

  /* Editar a orientação atual. Reabre a ciência de todos — se o texto
   * mudou, "eu vi" não vale mais. */
  ['PUT', '/api/orientacoes/:id', ({ usuario, params, corpo }) => {
    exigir(podePublicar(usuario), 403,
      'Editar orientação é de quem projeta, da coordenação e da direção.');
    const antiga = orientacaoVisivel(usuario, params.id);

    orientacoes.editar({
      id: antiga.id,
      titulo: texto(corpo, 'titulo', 'Dê um título à mudança.'),
      descricao: texto(corpo, 'descricao', 'Descreva a mudança.'),
      dataDaMudanca: dia(corpo, 'data_da_mudanca', 'Informe a data da mudança (AAAA-MM-DD).'),
      responsavelId: validarResponsavel(corpo, antiga.projeto_id),
      editorId: usuario.id,
    });
    return { ok: true };
  }],

  /* R6 — confirmo que vi. Registra; não trava nada. */
  ['POST', '/api/orientacoes/:id/confirmar', ({ usuario, params }) => {
    const orientacao = orientacaoVisivel(usuario, params.id);
    const meu = avisos.doUsuarioNaOrientacao(usuario.id, orientacao.id);
    exigir(meu, 400, 'Você não foi avisado desta orientação — não há o que confirmar.');
    avisos.confirmar({ orientacaoId: orientacao.id, usuarioId: usuario.id });
    return { ok: true };
  }],

  /* R17 — a fila de aval e as duas decisões. O trabalho não espera por
   * isto: é registro. */
  ['GET', '/api/aprovacoes', ({ usuario }) => {
    exigir(ehAprovador(usuario), 403,
      'A fila de aprovação é da direção e da coordenação de contratos.');
    return { esperando: orientacoes.esperandoAval() };
  }],

  ['POST', '/api/orientacoes/:id/aprovar', ({ usuario, params }) => {
    const orientacao = orientacaoVisivel(usuario, params.id);
    const impedimento = porQueNaoPodeAprovar(usuario, orientacao);
    exigir(!impedimento, 403, impedimento);
    exigir(orientacao.muda_orcamento_ou_prazo, 400, 'Esta orientação não pede aval.');
    orientacoes.aprovar({ id: orientacao.id, aprovadorId: usuario.id });
    return { ok: true };
  }],

  ['POST', '/api/orientacoes/:id/reprovar', ({ usuario, params, corpo }) => {
    const orientacao = orientacaoVisivel(usuario, params.id);
    const impedimento = porQueNaoPodeAprovar(usuario, orientacao);
    exigir(!impedimento, 403, impedimento);
    exigir(orientacao.muda_orcamento_ou_prazo, 400, 'Esta orientação não pede aval.');
    orientacoes.reprovar({
      id: orientacao.id,
      aprovadorId: usuario.id,
      motivo: texto(corpo, 'motivo', 'Escreva o motivo para negar o aval.'),
    });
    return { ok: true };
  }],

  /* A lista de avisos completa (a tela inicial usa /api/notificacoes; esta
   * é a página "todos os avisos", com os já confirmados). */
  ['GET', '/api/avisos', ({ usuario, url }) => {
    const apenasPendentes = url.searchParams.get('pendentes') === '1';
    return {
      avisos: avisos
        .doUsuario(usuario.id, { apenasPendentes, veTudo: veTodosOsProjetos(usuario) })
        .map((a) => ({ ...a, atrasado: estaAtrasado(a) })),
    };
  }],
];
