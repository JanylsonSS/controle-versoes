import { esc, dataHora } from '../html.js';
import { selo } from './componentes.js';
import { rotuloDaSituacao, rotuloDoTipo, ehAtiva } from '../../regras/cadastro.js';

/**
 * OBRAS DE UM CONJUNTO — pedido da coordenação: ver num lugar só as obras
 * correlatas (ex.: todas as reformas de escola).
 *
 * O conjunto agrupa, mas não manda: cada obra continua com equipe, versão
 * vigente e histórico próprios. Não existe "revisão do conjunto" — seria
 * um jeito de a obra executar por uma versão que não é a dela.
 *
 * A lista respeita o R19: só aparecem as obras do conjunto que a pessoa
 * já enxergaria de qualquer forma.
 */
export function telaConjunto({ nome, projetos, escondidos }) {
  return `
  <p class="migalha"><a href="/">Projetos</a> › Conjunto</p>
  <h1>${esc(nome)}</h1>
  <p class="ajuda">
    ${projetos.length} ${projetos.length === 1 ? 'obra neste conjunto' : 'obras neste conjunto'}.
    Cada uma tem a sua própria versão vigente.
  </p>

  ${
    projetos.length
      ? `<ul class="conjunto-lista">${projetos.map(linha).join('')}</ul>`
      : `<p class="vazio">Nenhuma obra deste conjunto está entre as suas.</p>`
  }

  ${
    escondidos
      ? `<p class="ajuda">Há ${escondidos} ${
          escondidos === 1 ? 'obra' : 'obras'
        } neste conjunto em que você não trabalha, por isso não ${
          escondidos === 1 ? 'aparece' : 'aparecem'
        } aqui.</p>`
      : ''
  }`;
}

function linha(projeto) {
  const v = projeto.vigente;
  return `
  <li class="conjunto-item ${ehAtiva(projeto.situacao) ? '' : 'cartao-inativo'}">
    <a href="/projetos/${projeto.id}">
      <span class="cartao-codigo">${esc(projeto.codigo)} · ${esc(rotuloDoTipo(projeto.tipo))}</span>
      <strong>${esc(projeto.nome)}</strong>
      <span class="selo ${ehAtiva(projeto.situacao) ? 'selo-ativa' : 'selo-superada'}">${esc(
        rotuloDaSituacao(projeto.situacao)
      )}</span>
    </a>
    ${
      v
        ? `<p class="conjunto-vigente">
             <span class="codigo-medio">${esc(v.codigo)}</span> ${selo('VIGENTE')}
             <span class="mudanca">${esc(v.o_que_mudou)}</span>
             <span class="assinatura">${esc(v.autor_nome)} · ${esc(dataHora(v.publicada_em))}</span>
           </p>`
        : `<p class="conjunto-vigente"><span class="mudanca">${
            projeto.totalRevisoes === 0
              ? 'Ainda sem revisão publicada.'
              : '<strong>Sem versão vigente.</strong> Não execute nem orce.'
          }</span></p>`
    }
  </li>`;
}
