/* ══════════════════════════════════════════════════════════════════════
 * R12 — INDICADORES PARA A DIREÇÃO
 *
 * Uma rota, restrita a quem aprova. É o candidato a instrumento das
 * metas do CEO desde que a medição de retrabalho (R11) saiu no pivô:
 * em vez de "quanto custou executar errado", mede o que evita o erro —
 * quanto tempo a informação leva para chegar (ciência) e o que está
 * parado (pendências, aval, quadro).
 *
 * Tudo calculado na hora sobre dados que o sistema grava desde o
 * início — o painel nasce com o histórico inteiro.
 * ══════════════════════════════════════════════════════════════════════ */

import { indicadores } from '../persistencia/repositorio.js';
import { ehAprovador } from '../regras/aprovacao.js';
import { DIAS_PARA_COBRAR_CIENCIA } from '../regras/ciencia.js';
import { rotuloDaSituacao } from '../regras/cadastro.js';
import { ORDEM_DAS_COLUNAS, rotuloDaColuna } from '../regras/atividades.js';
import { exigir } from './http.js';

export const rotasDeIndicadores = [
  ['GET', '/api/indicadores', ({ usuario }) => {
    exigir(ehAprovador(usuario), 403,
      'Os indicadores são da direção e da coordenação de contratos.');

    const dias = DIAS_PARA_COBRAR_CIENCIA;
    const porColuna = indicadores.atividadesPorColuna();

    return {
      dias_para_atraso: dias,
      gerais: indicadores.gerais(dias),
      por_obra: indicadores.porObra(dias).map((p) => ({
        ...p,
        situacao_rotulo: rotuloDaSituacao(p.situacao),
      })),
      atividades_por_coluna: ORDEM_DAS_COLUNAS.map((codigo) => ({
        codigo,
        rotulo: rotuloDaColuna(codigo),
        quantidade: porColuna.find((c) => c.situacao === codigo)?.quantidade ?? 0,
      })),
      por_pessoa: indicadores.porPessoa(dias),
    };
  }],
];
