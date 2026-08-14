/* Todas as rotas da API, numa lista só. A ordem importa apenas entre
 * padrões que colidem — os fixos vêm antes dos que têm :param. */

import { rotasDeSessao } from './sessao.js';
import { rotasDeProjetos } from './projetos.js';
import { rotasDeOrientacoes } from './orientacoes.js';
import { rotasDeAtividades } from './atividades.js';
import { rotasDeAgenda } from './agenda.js';

export const rotas = [
  ...rotasDeSessao,
  ...rotasDeProjetos,
  ...rotasDeOrientacoes,
  ...rotasDeAtividades,
  ...rotasDeAgenda,
];
