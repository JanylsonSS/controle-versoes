import { esc, dataHora, data, haQuantoTempo } from '../html.js';
import { rotuloDoPapel } from '../../regras/papeis.js';
import { estaAtrasado } from '../../regras/ciencia.js';

/* R2 + R4 — a situação de uma versão precisa ser lida sem esforço e sem
 * interpretação. Três estados, três aparências bem diferentes. */
const SELOS = {
  AGUARDANDO_APROVACAO: { texto: 'Ainda não vale — esperando aprovação', classe: 'selo-aguardando' },
  VIGENTE: { texto: 'Versão vigente', classe: 'selo-vigente' },
  SUPERADA: { texto: 'Versão antiga', classe: 'selo-superada' },
  CANCELADA: { texto: 'Cancelada — não use', classe: 'selo-cancelada' },
};

export function selo(situacao) {
  const s = SELOS[situacao] ?? { texto: situacao, classe: '' };
  return `<span class="selo ${s.classe}">${esc(s.texto)}</span>`;
}

/**
 * R2 — o bloco que responde à única pergunta que importa no canteiro:
 * "qual versão eu executo?". É a primeira coisa da tela do projeto.
 */
export function blocoVigente(projeto, vigente, temAlgumaRevisao = true, avisoPendente = null) {
  if (!vigente && !temAlgumaRevisao) {
    return `
    <section class="bloco bloco-calmo">
      <p class="bloco-rotulo">Projeto novo</p>
      <h2>Ainda sem revisão publicada</h2>
      <p>Assim que a engenharia ou a arquitetura publicar a primeira revisão,
         ela aparece aqui e a equipe é avisada.</p>
    </section>`;
  }
  if (!vigente) {
    return `
    <section class="bloco bloco-sem-vigente">
      <p class="bloco-rotulo">Atenção</p>
      <h2>Este projeto está sem versão vigente</h2>
      <p>A última versão foi cancelada e ainda não há substituta.
         <strong>Não execute nem orce este projeto</strong> até uma nova revisão ser publicada.</p>
    </section>`;
  }
  return `
  <section class="bloco bloco-vigente">
    <p class="bloco-rotulo">Execute por esta</p>
    <h2 class="codigo-grande">${esc(vigente.codigo)}</h2>
    <p class="mudanca">${esc(vigente.o_que_mudou)}</p>
    <p class="assinatura">
      Publicada por ${esc(vigente.autor_nome)} (${esc(rotuloDoPapel(vigente.autor_papel))})
      em ${esc(dataHora(vigente.publicada_em))} · ${esc(haQuantoTempo(vigente.publicada_em))}
    </p>
    ${botaoDoArquivo(vigente, avisoPendente)}
  </section>`;
}

/**
 * R6 — o arquivo fica bloqueado enquanto a pessoa não confirmar que viu.
 * O texto do "o que mudou" continua visível: a ideia é que ninguém baixe a
 * prancha sem ter passado pela tela que diz o que mudou.
 *
 * O botão muda de cara conforme a situação da revisão: abrir a vigente é o
 * caminho normal (verde); abrir uma que não vale é exceção, e o "mesmo
 * assim" existe para a pessoa notar o que está fazendo.
 */
export function botaoDoArquivo(revisao, avisoPendente) {
  if (!revisao.arquivo_nome) {
    return `<p class="sem-arquivo">Sem arquivo anexado nesta revisão.</p>`;
  }
  if (avisoPendente) {
    return `<p class="arquivo-travado">
      Arquivo bloqueado até você confirmar que viu esta mudança.
    </p>`;
  }
  const vale = revisao.situacao === 'VIGENTE';
  return `<a class="botao ${vale ? 'botao-principal' : 'botao-cuidado'}"
             href="/arquivos/${revisao.id}">
            Abrir o arquivo ${vale ? 'desta versão' : 'mesmo assim'}
          </a>`;
}

/**
 * R6 — "é possível verificar quem foi avisado de uma versão e quem
 * confirmou ciência, com data". Esta é a tela que fecha o "eu não fui avisado".
 */
export function listaCiencia(avisosDaRevisao) {
  if (!avisosDaRevisao.length) {
    return `<p class="vazio">Ninguém foi avisado desta versão.</p>`;
  }
  const confirmados = avisosDaRevisao.filter((a) => a.confirmado_em);
  const pendentes = avisosDaRevisao.filter((a) => !a.confirmado_em);

  const linha = (a) => {
    const atrasado = estaAtrasado(a);
    return `
    <li class="${a.confirmado_em ? 'ciente' : atrasado ? 'pendente atrasado' : 'pendente'}">
      <span class="ciencia-nome">${esc(a.usuario_nome)}
        <span class="ciencia-papel">${esc(rotuloDoPapel(a.usuario_papel))}</span>
      </span>
      <span class="ciencia-estado">${
        a.confirmado_em
          ? `Confirmou em ${esc(dataHora(a.confirmado_em))}`
          : `Ainda não confirmou — avisado ${esc(haQuantoTempo(a.enviado_em))}`
      }</span>
    </li>`;
  };

  return `
  <p class="ciencia-resumo">
    <strong>${confirmados.length} de ${avisosDaRevisao.length}</strong> confirmaram que viram esta versão.
  </p>
  <ul class="ciencia">${[...confirmados, ...pendentes].map(linha).join('')}</ul>`;
}

/** R3 — histórico preservado, mas visualmente subordinado à vigente (R8). */
export function linhaHistorico(revisao) {
  return `
  <li class="historico-item ${revisao.situacao === 'CANCELADA' ? 'item-cancelada' : ''}">
    <a href="/revisoes/${revisao.id}">
      <span class="historico-codigo">${esc(revisao.codigo)}</span>
      <span class="historico-mudanca">${esc(revisao.o_que_mudou)}</span>
      <span class="historico-meta">
        ${esc(revisao.autor_nome)} · ${esc(data(revisao.publicada_em))} ${selo(revisao.situacao)}
      </span>
    </a>
  </li>`;
}
