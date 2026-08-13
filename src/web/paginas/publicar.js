import { esc } from '../html.js';
import { rotuloDoPapel } from '../../regras/papeis.js';

/**
 * PUBLICAR NOVA REVISÃO — R3, R5, R9, R13.
 *
 * Três campos e um botão. O aviso (R5) não é uma opção do formulário:
 * ele é consequência automática de publicar. A tela apenas mostra, antes,
 * quem vai ser avisado — para que ninguém publique achando que avisou
 * alguém que não seria avisado.
 */
export function telaPublicar({ projeto, vigenteAtual, codigoSugerido, seraoAvisados, erro }) {
  return `
  <p class="migalha">
    <a href="/">Projetos</a> ›
    <a href="/projetos/${projeto.id}">${esc(projeto.codigo)}</a> › Publicar
  </p>
  <h1>Publicar nova revisão</h1>
  <p class="ajuda">${esc(projeto.nome)}</p>

  ${erro ? `<p class="recado recado-erro">${esc(erro)}</p>` : ''}

  ${
    vigenteAtual
      ? `<p class="ajuda">Hoje vale a <strong>${esc(vigenteAtual.codigo)}</strong>.
           Ao publicar, ela passa a antiga e continua no histórico.</p>`
      : `<p class="ajuda">Este projeto ainda não tem versão vigente.</p>`
  }

  <form method="post" action="/projetos/${projeto.id}/publicar" enctype="multipart/form-data" class="formulario">
    <label for="codigo">Número da revisão</label>
    <input type="text" id="codigo" name="codigo" value="${esc(codigoSugerido)}" required>

    <label for="o_que_mudou">O que mudou desta vez</label>
    <textarea id="o_que_mudou" name="o_que_mudou" rows="3" required
      placeholder="Escreva para quem vai executar. Ex.: removida a calçada no trecho leste."></textarea>
    <p class="ajuda">Este texto é o que a obra vai ler no aviso. Seja concreto.</p>

    <label for="arquivo">Arquivo da revisão</label>
    <input type="file" id="arquivo" name="arquivo">

    <fieldset class="equipe pergunta-grande">
      <legend>Esta revisão muda orçamento ou prazo?</legend>
      <label class="equipe-item">
        <input type="checkbox" name="muda_orcamento_ou_prazo" value="1">
        <span>Sim — muda orçamento ou prazo</span>
      </label>
      <p class="ajuda">Se marcar, a revisão <strong>não passa a valer na hora</strong>:
         ela vai para aprovação da direção ou da coordenação de contratos, e só
         depois do aval é que a obra é avisada.</p>
    </fieldset>

    <section class="bloco bloco-calmo">
      <p class="bloco-rotulo">Quem será avisado quando esta revisão passar a valer</p>
      <p>${seraoAvisados.map((u) => `${esc(u.nome)} (${esc(rotuloDoPapel(u.papel))})`).join(', ')}.</p>
    </section>

    <button class="botao botao-principal" type="submit">Publicar</button>
    <a class="botao botao-neutro" href="/projetos/${projeto.id}">Cancelar</a>
  </form>`;
}
