import { esc, data, dataHora, dinheiro, haQuantoTempo } from '../html.js';
import { blocoVigente, listaCiencia, linhaHistorico } from './componentes.js';
import { formularioEquipe } from './novo-projeto.js';
import { abas } from './atividades.js';
import { rotuloDoPapel } from '../../regras/papeis.js';
import { rotuloDaSituacao, rotuloDoTipo, ehAtiva } from '../../regras/cadastro.js';

/**
 * TELA DO PROJETO — R1, R2, R3, R6, R8, R11, R19.
 *
 * A ordem da tela é a regra de negócio: a versão vigente ocupa o topo e
 * o espaço; o histórico vem depois, menor e mais discreto. Abrir uma
 * versão antiga exige rolar e clicar — ação deliberada, como pede o R8.
 *
 * A ficha do projeto (cliente, contrato, prazo) fica DEPOIS da versão
 * vigente, de propósito: quem abre esta tela no canteiro quer saber o que
 * executar, não o número do contrato.
 */
export function telaProjeto({
  projeto,
  vigente,
  anteriores,
  cienciaDaVigente,
  meuAvisoPendente,
  podePublicar,
  incidentes,
  equipe,
  todasAsPessoas,
  podeMexerNaEquipe,
  andamentos,
  usuario,
  projetosDoConjunto = 0,
  aguardando = null,
  flagsAbertas = [],
  corrigindoCampo = null,
}) {
  return `
  <p class="migalha"><a href="/">Projetos</a> › ${esc(projeto.codigo)}</p>
  <h1>${esc(projeto.nome)}</h1>
  <p class="ajuda">
    ${esc(rotuloDoTipo(projeto.tipo))}
    <span class="selo ${ehAtiva(projeto.situacao) ? 'selo-ativa' : 'selo-superada'}">${esc(
      rotuloDaSituacao(projeto.situacao)
    )}</span>
    ${projeto.local ? ` · ${esc(projeto.local)}` : ''}
  </p>

  ${abas(projeto, 'projeto')}

  ${
    projeto.conjunto
      ? `<p class="ajuda">Faz parte de
           <a href="/conjuntos/${encodeURIComponent(projeto.conjunto)}">${esc(projeto.conjunto)}</a>${
             projetosDoConjunto > 1 ? ` — ${projetosDoConjunto} obras no conjunto` : ''
           }.</p>`
      : ''
  }

  ${blocoVigente(projeto, vigente, Boolean(vigente) || anteriores.length > 0, meuAvisoPendente)}

  ${
    aguardando
      ? `<section class="bloco bloco-aguardando">
           <p class="bloco-rotulo">Vem mudança por aí</p>
           <h2>${esc(aguardando.codigo)} esperando aprovação</h2>
           <p class="mudanca">${esc(aguardando.o_que_mudou)}</p>
           <p class="assinatura">
             Publicada por ${esc(aguardando.autor_nome)} em ${esc(dataHora(aguardando.publicada_em))}.
             Muda orçamento ou prazo, então só passa a valer depois do aval da direção
             ou da coordenação de contratos.
           </p>
           <p><a href="/revisoes/${aguardando.id}">Ver o que ela muda</a></p>
         </section>`
      : ''
  }

  ${
    meuAvisoPendente
      ? `<form method="post" action="/revisoes/${vigente.id}/confirmar" class="confirmar-ciencia">
           <input type="hidden" name="voltar_para" value="/projetos/${projeto.id}">
           <p>Você ainda não confirmou que viu esta versão — e por isso o arquivo
              está bloqueado para você.</p>
           <button class="botao botao-confirmar" type="submit">Confirmo que vi a ${esc(vigente.codigo)}</button>
         </form>`
      : ''
  }

  <p>
    ${podePublicar ? `<a class="botao" href="/projetos/${projeto.id}/publicar">Publicar nova revisão</a>` : ''}
    ${
      projeto.link_drive
        ? `<a class="botao" href="${esc(projeto.link_drive)}" target="_blank" rel="noopener">Abrir a pasta no Drive</a>`
        : ''
    }
  </p>

  ${blocoCaminhoDaPasta(projeto)}

  ${
    vigente
      ? `<section class="secao">
           <h3>Quem já viu esta versão</h3>
           ${listaCiencia(cienciaDaVigente)}
         </section>`
      : ''
  }

  <section class="secao">
    <h3>Histórico de versões</h3>
    ${
      anteriores.length
        ? `<p class="ajuda">Versões que já não valem. Abrir uma delas fica registrado.</p>
           <ul class="historico">${anteriores.map(linhaHistorico).join('')}</ul>`
        : `<p class="vazio">Esta é a primeira revisão do projeto.</p>`
    }
  </section>

  ${blocoAndamentos(projeto, andamentos, usuario)}

  ${blocoFicha(projeto, podeMexerNaEquipe, flagsAbertas, corrigindoCampo)}

  ${blocoIncidentes(projeto, incidentes)}

  <section class="secao">
    <h3>Quem trabalha neste projeto</h3>
    ${
      equipe.length
        ? `<ul class="equipe-lista">${equipe
            .map(
              (p) =>
                `<li>${esc(p.nome)} <span class="ciencia-papel">${esc(rotuloDoPapel(p.papel))}</span></li>`
            )
            .join('')}</ul>
           <p class="ajuda">São estas as pessoas que veem o projeto e recebem aviso quando ele muda.</p>`
        : `<p class="vazio">Ninguém foi ligado a este projeto ainda — logo, ninguém além da
             coordenação o enxerga, e ninguém será avisado quando ele mudar.</p>`
    }
  </section>

  ${podeMexerNaEquipe ? formularioEquipe(projeto, todasAsPessoas, equipe) : ''}`;
}

/**
 * Caminho da pasta no explorador de arquivos.
 *
 * Por que não é um link clicável: navegador nenhum abre `file:///G:/...`
 * a partir de uma página web — é trava de segurança do Chrome, do Edge e
 * do Firefox, e não tem como contornar do lado do sistema. Então o que dá
 * para fazer bem é entregar o caminho pronto para colar: um clique copia,
 * outro cola na barra do Explorer.
 *
 * O campo é `readonly` e seleciona tudo ao clicar, para funcionar mesmo
 * quando o botão de copiar não funciona — o navegador só libera a área de
 * transferência em página segura, e no endereço de rede (http://192.168…)
 * ele bloqueia. A lógica do botão está em `publico/copiar.js`.
 */
function blocoCaminhoDaPasta(projeto) {
  if (!projeto.caminho_rede) return '';
  return `
  <div class="caminho-pasta">
    <label for="caminho-${projeto.id}">Pasta no computador do escritório</label>
    <div class="caminho-linha">
      <input type="text" id="caminho-${projeto.id}" class="caminho-valor" readonly
             value="${esc(projeto.caminho_rede)}" onclick="this.select()">
      <button type="button" class="botao botao-copiar"
              onclick="copiarCaminho('caminho-${projeto.id}', this)">Copiar</button>
    </div>
    <p class="ajuda">Cole na barra de endereço do explorador de arquivos.
       No celular, use o botão "Abrir a pasta no Drive" acima.</p>
  </div>`;
}

/**
 * O "commit" pedido pela coordenação: o que foi feito, onde travou, que
 * dúvida ficou. Não é revisão — não muda o que a obra executa, e por isso
 * fica depois do histórico de versões, não antes.
 */
function blocoAndamentos(projeto, andamentos, usuario) {
  const item = (a) => `
    <li class="andamento ${a.duvida ? 'andamento-duvida' : ''}">
      <p class="andamento-topo">
        <strong>${esc(a.autor_nome)}</strong>
        <span class="ciencia-papel">${esc(rotuloDoPapel(a.autor_papel))}</span>
        <span class="quando">${esc(dataHora(a.registrado_em))} · ${esc(haQuantoTempo(a.registrado_em))}</span>
      </p>
      <p class="andamento-fiz">${esc(a.o_que_fiz)}</p>
      ${a.dificuldade ? `<p class="andamento-linha"><span class="andamento-rotulo">Dificuldade</span> ${esc(a.dificuldade)}</p>` : ''}
      ${a.duvida ? `<p class="andamento-linha andamento-pergunta"><span class="andamento-rotulo">Dúvida em aberto</span> ${esc(a.duvida)}</p>` : ''}
    </li>`;

  return `
  <section class="secao">
    <h3>Andamento do trabalho</h3>
    <p class="ajuda">Registro do que está sendo feito. Não muda qual versão vale —
       para isso, publique uma revisão.</p>

    <details class="registrar-andamento">
      <summary>Registrar o que eu fiz</summary>
      <form method="post" action="/projetos/${projeto.id}/andamento" class="formulario">
        <label for="o_que_fiz">O que você fez</label>
        <textarea id="o_que_fiz" name="o_que_fiz" rows="2" required
          placeholder="Ex.: fechei o detalhamento das estacas 12 a 20."></textarea>

        <label for="dificuldade">Onde teve dificuldade (opcional)</label>
        <input type="text" id="dificuldade" name="dificuldade"
          placeholder="Ex.: o levantamento do trecho leste está impreciso.">

        <label for="duvida">Dúvida que ficou em aberto (opcional)</label>
        <input type="text" id="duvida" name="duvida"
          placeholder="Ex.: o cliente já definiu o piso da praça?">
        <p class="ajuda">Dúvida em aberto fica destacada, para alguém conseguir responder.</p>

        <button class="botao botao-principal" type="submit">Registrar</button>
      </form>
    </details>

    ${
      andamentos.length
        ? `<ul class="andamentos">${andamentos.map(item).join('')}</ul>`
        : `<p class="vazio">Nada registrado ainda neste projeto.</p>`
    }
  </section>`;
}

/**
 * Ficha do cadastro. Informação de contrato, não de execução.
 *
 * Ao lado de cada campo há uma placa ⚑: quem vir algo errado avisa a
 * coordenação sem precisar sair da tela nem saber a quem falar. Quem
 * corrige continua sendo só a coordenação — a placa avisa, não edita.
 */
function blocoFicha(projeto, podeCorrigir, flagsAbertas, corrigindoCampo) {
  const jaSinalizado = new Set(flagsAbertas.map((f) => f.campo));

  const linha = (campo, rotulo, valor) => `
    <div class="${jaSinalizado.has(campo) ? 'campo-sinalizado' : ''}">
      <dt>${esc(rotulo)}</dt>
      <dd>
        ${valor ? esc(valor) : '<span class="vazio">não preenchido</span>'}
        <a class="placa-aviso" href="/projetos/${projeto.id}?corrigir=${encodeURIComponent(campo)}#ficha"
           title="Avisar a coordenação de que este campo está errado">⚑</a>
        ${jaSinalizado.has(campo) ? '<span class="ja-sinalizado">a coordenação já foi avisada</span>' : ''}
      </dd>
    </div>`;

  const campos = [
    ['cliente', 'Cliente / contratante', projeto.cliente],
    ['numero_contrato', 'Contrato', projeto.numero_contrato],
    ['data_inicio', 'Início', data(projeto.data_inicio)],
    ['prazo', 'Prazo', data(projeto.prazo)],
    ['tipo', 'Tipo de obra', rotuloDoTipo(projeto.tipo)],
    ['situacao', 'Situação da obra', rotuloDaSituacao(projeto.situacao)],
    ['local', 'Onde é', projeto.local],
    ['conjunto', 'Conjunto', projeto.conjunto],
    ['link_drive', 'Pasta no Drive', projeto.link_drive ? 'link cadastrado' : ''],
    ['caminho_rede', 'Pasta no computador', projeto.caminho_rede],
  ];

  const rotuloDoCampo = Object.fromEntries(campos.map(([chave, rotulo]) => [chave, rotulo]));

  return `
  <section class="secao" id="ficha">
    <h3>Ficha do projeto</h3>
    <dl class="ficha">${campos.map((c) => linha(...c)).join('')}</dl>

    ${
      corrigindoCampo
        ? `<form method="post" action="/projetos/${projeto.id}/flag" class="formulario formulario-flag">
             <input type="hidden" name="campo" value="${esc(corrigindoCampo)}">
             <label for="observacao">O que está errado em "${esc(
               rotuloDoCampo[corrigindoCampo] ?? corrigindoCampo
             )}"?</label>
             <input type="text" id="observacao" name="observacao" autofocus
                    placeholder="Ex.: o contrato certo é o 019/2026.">
             <p class="ajuda">A coordenação recebe o aviso e corrige. Você pode enviar sem escrever nada.</p>
             <button class="botao botao-principal" type="submit">Avisar a coordenação</button>
             <a class="botao botao-neutro" href="/projetos/${projeto.id}#ficha">Cancelar</a>
           </form>`
        : ''
    }

    ${blocoFlags(projeto, flagsAbertas, podeCorrigir, rotuloDoCampo)}

    ${
      podeCorrigir
        ? `<p><a class="botao" href="/projetos/${projeto.id}/editar">Corrigir o cadastro</a></p>`
        : `<p class="ajuda">Achou algo errado? Clique no ⚑ ao lado do campo — a coordenação é quem corrige.</p>`
    }
  </section>`;
}

function blocoFlags(projeto, flagsAbertas, podeResolver, rotuloDoCampo) {
  if (!flagsAbertas.length) return '';
  return `
  <div class="flags-abertas">
    <p class="bloco-rotulo">Avisos de cadastro errado</p>
    <ul>
      ${flagsAbertas
        .map(
          (f) => `<li>
            <strong>${esc(rotuloDoCampo[f.campo] ?? f.campo ?? 'cadastro')}</strong>
            ${f.observacao ? `— ${esc(f.observacao)}` : ''}
            <span class="quando">${esc(f.autor_nome)}, ${esc(dataHora(f.criado_em))}</span>
            ${
              podeResolver
                ? `<form method="post" action="/projetos/${projeto.id}/flag/${f.id}/resolver">
                     <button class="botao botao-neutro" type="submit">Já corrigi</button>
                   </form>`
                : ''
            }
          </li>`
        )
        .join('')}
    </ul>
  </div>`;
}

/** R11 — o custo do retrabalho fica ao lado do projeto que o gerou. */
function blocoIncidentes(projeto, incidentes) {
  if (!incidentes.length) {
    return `<section class="secao">
      <h3>Retrabalho por versão errada</h3>
      <p class="vazio">Nenhum caso registrado neste projeto.
        <a href="/retrabalho/novo?projeto_id=${projeto.id}">Registrar um caso</a></p>
    </section>`;
  }
  return `
  <section class="secao">
    <h3>Retrabalho por versão errada</h3>
    <ul class="incidentes">
      ${incidentes
        .map(
          (i) => `<li>
            <span class="incidente-data">${esc(data(i.ocorrido_em))}</span>
            <span class="incidente-texto">${esc(i.o_que_aconteceu)}</span>
            <span class="incidente-custo">${esc(dinheiro(i.custo_estimado))}${
              i.horas_refazendo ? ` · ${esc(i.horas_refazendo)} h refazendo` : ''
            }</span>
          </li>`
        )
        .join('')}
    </ul>
    <p><a href="/retrabalho/novo?projeto_id=${projeto.id}">Registrar outro caso</a></p>
  </section>`;
}
