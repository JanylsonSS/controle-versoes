/* Copiar o caminho da pasta para colar no explorador de arquivos.
 *
 * Por que existe: navegador nenhum abre "G:\..." a partir de uma página
 * web — é trava de segurança do Chrome, do Edge e do Firefox. Então o
 * melhor que dá para fazer é entregar o caminho pronto para colar.
 *
 * São dois caminhos porque nenhum funciona sempre:
 *   - a API moderna só funciona em página segura (https ou localhost).
 *     No endereço de rede (http://192.168...) o navegador bloqueia;
 *   - o jeito antigo funciona nesse caso, mas só depois de um clique de
 *     verdade da pessoa, e alguns navegadores já o recusam.
 * Se os dois falharem, o texto fica selecionado e o botão diz para usar
 * Ctrl+C — que sempre funciona.
 */
function copiarCaminho(id, botao) {
  var campo = document.getElementById(id);
  if (!campo) return;

  campo.focus();
  campo.select();
  campo.setSelectionRange(0, 99999); // celular

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(campo.value).then(
      function () { avisar(botao, 'Copiado'); },
      function () { tentarJeitoAntigo(campo, botao); }
    );
    return;
  }
  tentarJeitoAntigo(campo, botao);
}

function tentarJeitoAntigo(campo, botao) {
  var deuCerto = false;
  try {
    deuCerto = document.execCommand('copy');
  } catch (erro) {
    deuCerto = false;
  }
  avisar(botao, deuCerto ? 'Copiado' : 'Aperte Ctrl+C');
}

function avisar(botao, texto) {
  if (!botao) return;
  if (!botao.dataset.textoOriginal) botao.dataset.textoOriginal = botao.textContent;
  botao.textContent = texto;
  setTimeout(function () {
    botao.textContent = botao.dataset.textoOriginal;
  }, 2500);
}
