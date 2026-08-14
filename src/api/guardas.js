/* ══════════════════════════════════════════════════════════════════════
 * GUARDAS COMUNS ÀS ROTAS
 *
 * Toda rota que toca um projeto passa por `projetoVisivel`. Esquecer a
 * guarda numa rota nova = vazamento do R19. Por isso ela devolve o
 * projeto já carregado: quem quiser o projeto é obrigado a passar pela
 * checagem para tê-lo.
 * ══════════════════════════════════════════════════════════════════════ */

import { ErroApi } from './http.js';
import { projetos, equipes, orientacoes, atividades, agenda } from '../persistencia/repositorio.js';
import { veTodosOsProjetos } from '../regras/visibilidade.js';
import { podeCadastrarProjeto } from '../regras/papeis.js';

export function enxerga(usuario, projetoId) {
  return veTodosOsProjetos(usuario) || equipes.contem(projetoId, usuario.id);
}

/** R19 — devolve o projeto se a pessoa pode vê-lo; senão, 404/403. */
export function projetoVisivel(usuario, projetoId) {
  const projeto = projetos.porId(projetoId);
  if (!projeto) throw new ErroApi(404, 'Projeto não existe.');
  if (!enxerga(usuario, projeto.id)) {
    throw new ErroApi(403, 'Você não está na equipe deste projeto. Peça à coordenação para incluir seu nome.');
  }
  return projeto;
}

/** Idem, chegando pela orientação. */
export function orientacaoVisivel(usuario, orientacaoId) {
  const orientacao = orientacoes.porId(orientacaoId);
  if (!orientacao) throw new ErroApi(404, 'Orientação não existe.');
  projetoVisivel(usuario, orientacao.projeto_id);
  return orientacao;
}

/** Idem, chegando pela atividade. */
export function atividadeVisivel(usuario, atividadeId) {
  const atividade = atividades.porId(atividadeId);
  if (!atividade) throw new ErroApi(404, 'Atividade não existe.');
  projetoVisivel(usuario, atividade.projeto_id);
  return atividade;
}

/** Compromisso de agenda: só o participante, quem criou, ou a coordenação. */
export function compromissoAcessivel(usuario, compromissoId) {
  const compromisso = agenda.porId(compromissoId);
  if (!compromisso) throw new ErroApi(404, 'Compromisso não existe.');
  const meu = compromisso.participante_id === usuario.id || compromisso.criada_por === usuario.id;
  if (!meu && !podeCadastrarProjeto(usuario)) {
    throw new ErroApi(403, 'Esse compromisso é da agenda de outra pessoa.');
  }
  return compromisso;
}
