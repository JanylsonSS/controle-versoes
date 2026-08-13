import { esc, dataHora, haQuantoTempo } from '../html.js';
import { selo } from './componentes.js';
import { rotuloDaSituacao, rotuloDoTipo, ehAtiva } from '../../regras/cadastro.js';

/**
 * TELA INICIAL — R1 (um único lugar), R2 (a vigente à vista),
 * R8 (o caminho natural leva à versão certa) e R19 (só os seus projetos).
 *
 * Ordem deliberada: primeiro o que mudou e você ainda não viu; depois a
 * lista de projetos, cada um já mostrando qual versão vale. Ninguém
 * precisa procurar nem clicar para descobrir a versão vigente.
 *
 * Obra concluída ou parada não aparece por padrão: a lista precisa caber
 * na tela do celular e mostrar o que está em andamento.
 */
export function telaInicial({ projetos, pendentes, podeCadastrar, veTudo, mostrandoTodas, quantasInativas }) {
  return `
  ${blocoPendentes(pendentes)}

  <h1>Projetos</h1>
  <p class="ajuda">
    O que aparece aqui é sempre a versão que vale hoje.
    ${veTudo ? 'Você enxerga todos os projetos da empresa.' : 'São os projetos em que você trabalha.'}
  </p>

  ${podeCadastrar ? `<p><a class="botao" href="/projetos/novo">Cadastrar projeto</a></p>` : ''}

  ${
    projetos.length
      ? `<div class="cartoes">${projetos.map(cartaoProjeto).join('')}</div>`
      : `<p class="vazio">${
          mostrandoTodas
            ? 'Você ainda não foi ligado a nenhum projeto. Fale com a coordenação para entrar na equipe de uma obra.'
            : 'Nenhuma obra em andamento no momento.'
        }</p>`
  }

  ${filtroDeSituacao(mostrandoTodas, quantasInativas)}`;
}

function filtroDeSituacao(mostrandoTodas, quantasInativas) {
  if (mostrandoTodas) {
    return `<p class="ajuda"><a href="/">Mostrar só as obras em andamento</a></p>`;
  }
  if (!quantasInativas) return '';
  return `<p class="ajuda"><a href="/?todas=1">Mostrar também ${quantasInativas} ${
    quantasInativas === 1 ? 'obra concluída ou parada' : 'obras concluídas ou paradas'
  }</a></p>`;
}

function blocoPendentes(pendentes) {
  if (!pendentes.length) {
    return `<section class="bloco bloco-calmo">
      <p>Nenhuma versão nova esperando por você.</p>
    </section>`;
  }
  const itens = pendentes
    .slice(0, 5)
    .map(
      (a) => `<li>
        <a href="/revisoes/${a.revisao_id}">
          <strong>${esc(a.projeto_nome)}</strong> — passou a valer a ${esc(a.revisao_codigo)}
          <span class="quando">${esc(haQuantoTempo(a.enviado_em))}</span>
        </a>
      </li>`
    )
    .join('');

  return `
  <section class="bloco bloco-atencao">
    <p class="bloco-rotulo">Para você ver</p>
    <h2>${pendentes.length === 1 ? 'Uma versão nova' : `${pendentes.length} versões novas`} desde a última vez</h2>
    <p class="ajuda">Enquanto não confirmar, o arquivo dessas revisões fica bloqueado para você.</p>
    <ul class="lista-avisos">${itens}</ul>
    ${pendentes.length > 5 ? `<p><a href="/avisos">Ver todos os ${pendentes.length}</a></p>` : ''}
  </section>`;
}

function cartaoProjeto(projeto) {
  const v = projeto.vigente;
  const inativa = !ehAtiva(projeto.situacao);
  return `
  <article class="cartao ${v || projeto.totalRevisoes === 0 ? '' : 'cartao-alerta'} ${
    inativa ? 'cartao-inativo' : ''
  }">
    <a class="cartao-titulo" href="/projetos/${projeto.id}">
      <span class="cartao-codigo">${esc(projeto.codigo)} · ${esc(rotuloDoTipo(projeto.tipo))}</span>
      <h2>${esc(projeto.nome)}</h2>
      ${projeto.local ? `<span class="cartao-local">${esc(projeto.local)}</span>` : ''}
    </a>

    <p class="cartao-situacao">
      <span class="selo ${inativa ? 'selo-superada' : 'selo-ativa'}">${esc(
        rotuloDaSituacao(projeto.situacao)
      )}</span>
      ${projeto.conjunto ? `<span class="cartao-conjunto">${esc(projeto.conjunto)}</span>` : ''}
    </p>

    ${
      v
        ? `<div class="cartao-vigente">
             <span class="codigo-medio">${esc(v.codigo)}</span>
             ${selo('VIGENTE')}
             <p class="mudanca">${esc(v.o_que_mudou)}</p>
             <p class="assinatura">${esc(v.autor_nome)} · ${esc(dataHora(v.publicada_em))}</p>
           </div>
           ${
             v.arquivo_nome
               ? `<a class="botao botao-principal" href="/arquivos/${v.id}">Abrir a versão vigente</a>`
               : ''
           }`
        : projeto.totalRevisoes === 0
          ? `<div class="cartao-vigente cartao-vigente-novo">
               <p class="mudanca">Ainda sem revisão publicada.</p>
             </div>`
          : `<div class="cartao-vigente">
               <p class="mudanca"><strong>Sem versão vigente.</strong> Não execute nem orce este projeto.</p>
             </div>`
    }

    <p class="cartao-rodape">
      <a href="/projetos/${projeto.id}">Ver histórico (${projeto.totalRevisoes} ${
        projeto.totalRevisoes === 1 ? 'revisão' : 'revisões'
      })</a>
    </p>
  </article>`;
}
