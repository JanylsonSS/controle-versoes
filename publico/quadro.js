/* ══════════════════════════════════════════════════════════════════════
 * Arrastar cartão entre as colunas do quadro de atividades.
 *
 * Usa eventos de ponteiro (pointerdown/move/up) e não a API de
 * drag-and-drop do HTML. Motivo: a API nativa não funciona no toque, e a
 * obra usa celular. Com ponteiro é uma implementação só para mouse e dedo.
 *
 * A página funciona sem este arquivo: clicar no cartão abre a janela por
 * link normal, e a janela tem um seletor de coluna que faz a mesma coisa
 * pelo formulário. Isto aqui é conveniência, não é o único caminho.
 *
 * O que acontece ao soltar:
 *   1. o cartão é movido na tela na hora (não espera o servidor);
 *   2. um POST avisa o servidor;
 *   3. se o servidor recusar, a página recarrega — é a forma honesta de
 *      não deixar a tela mostrando algo que não foi salvo.
 * ══════════════════════════════════════════════════════════════════════ */

(function () {
  const quadro = document.querySelector('.quadro');
  if (!quadro || quadro.dataset.podeMexer !== '1') return;

  const DISTANCIA_PARA_ARRASTAR = 6; // pixels; abaixo disso é clique, não arraste

  let alvo = null; // o cartão sendo arrastado
  let fantasma = null; // a cópia que segue o dedo
  let marcador = null; // a linha que mostra onde vai cair
  let inicio = null; // posição do toque, para separar clique de arraste
  let arrastando = false;
  let deslocamento = { x: 0, y: 0 };

  quadro.addEventListener('pointerdown', (evento) => {
    // Deixa links e botões dentro do cartão funcionarem normalmente.
    if (evento.target.closest('a, button, input, select, textarea')) return;
    const cartao = evento.target.closest('.cartao-atividade');
    if (!cartao || evento.button > 0) return;

    alvo = cartao;
    inicio = { x: evento.clientX, y: evento.clientY };
    const caixa = cartao.getBoundingClientRect();
    deslocamento = { x: evento.clientX - caixa.left, y: evento.clientY - caixa.top };
  });

  document.addEventListener('pointermove', (evento) => {
    if (!alvo) return;

    if (!arrastando) {
      const andou = Math.hypot(evento.clientX - inicio.x, evento.clientY - inicio.y);
      if (andou < DISTANCIA_PARA_ARRASTAR) return;
      comecarArraste(evento);
    }

    evento.preventDefault();
    posicionarFantasma(evento);
    mostrarOndeVaiCair(evento);
  });

  document.addEventListener('pointerup', (evento) => {
    if (!alvo) return;
    if (!arrastando) {
      alvo = null;
      return;
    }
    soltar(evento);
  });

  document.addEventListener('pointercancel', desistir);

  /* ─── Arraste ──────────────────────────────────────────────────────── */

  function comecarArraste(evento) {
    arrastando = true;
    document.body.classList.add('arrastando');

    const caixa = alvo.getBoundingClientRect();
    fantasma = alvo.cloneNode(true);
    fantasma.classList.add('cartao-fantasma');
    fantasma.style.width = `${caixa.width}px`;
    document.body.appendChild(fantasma);

    alvo.classList.add('cartao-saindo');

    marcador = document.createElement('div');
    marcador.className = 'marcador-de-queda';

    posicionarFantasma(evento);
  }

  function posicionarFantasma(evento) {
    fantasma.style.left = `${evento.clientX - deslocamento.x}px`;
    fantasma.style.top = `${evento.clientY - deslocamento.y}px`;
  }

  /** Acha a coluna sob o dedo e põe o marcador entre os cartões certos. */
  function mostrarOndeVaiCair(evento) {
    const embaixo = document.elementFromPoint(evento.clientX, evento.clientY);
    const lista = embaixo && embaixo.closest('.coluna-cartoes');

    quadro.querySelectorAll('.coluna-cartoes').forEach((c) => c.classList.remove('coluna-alvo'));
    if (!lista) {
      marcador.remove();
      return;
    }
    lista.classList.add('coluna-alvo');

    const vizinhos = [...lista.querySelectorAll('.cartao-atividade:not(.cartao-saindo)')];
    const antesDeste = vizinhos.find((cartao) => {
      const caixa = cartao.getBoundingClientRect();
      return evento.clientY < caixa.top + caixa.height / 2;
    });

    if (antesDeste) lista.insertBefore(marcador, antesDeste);
    else lista.appendChild(marcador);
  }

  async function soltar(evento) {
    const lista = marcador.parentElement;
    limpar();

    if (!lista) return; // soltou fora de qualquer coluna: não faz nada

    const coluna = lista.dataset.alvo;
    const posicaoAntiga = { lista: alvo.parentElement, proximo: alvo.nextElementSibling };

    // Move na tela primeiro — a espera do servidor não pode travar a mão.
    lista.insertBefore(alvo, marcador);
    marcador.remove();

    const posicao = [...lista.querySelectorAll('.cartao-atividade')].indexOf(alvo);
    atualizarContagens();

    const id = alvo.dataset.atividade;
    const cartaoMovido = alvo;
    alvo = null;

    try {
      const resposta = await fetch(`/atividades/${id}/mover`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ situacao: coluna, posicao: String(posicao) }),
      });
      if (!resposta.ok) throw new Error(String(resposta.status));
      // O servidor decide as datas (início, fim); recarrega para mostrá-las.
      window.location.reload();
    } catch {
      // Não salvou: devolve o cartão para onde estava e avisa.
      posicaoAntiga.lista.insertBefore(cartaoMovido, posicaoAntiga.proximo);
      atualizarContagens();
      avisarQueNaoSalvou();
    }
  }

  function desistir() {
    if (!arrastando) {
      alvo = null;
      return;
    }
    limpar();
    marcador.remove();
    alvo = null;
  }

  function limpar() {
    arrastando = false;
    document.body.classList.remove('arrastando');
    if (fantasma) fantasma.remove();
    fantasma = null;
    if (alvo) alvo.classList.remove('cartao-saindo');
    quadro.querySelectorAll('.coluna-cartoes').forEach((c) => c.classList.remove('coluna-alvo'));
  }

  function atualizarContagens() {
    quadro.querySelectorAll('.coluna').forEach((coluna) => {
      const quantos = coluna.querySelectorAll('.cartao-atividade').length;
      coluna.querySelector('.coluna-contagem').textContent = String(quantos);
      coluna.classList.toggle('coluna-sem-nada', quantos === 0);
    });
  }

  function avisarQueNaoSalvou() {
    const recado = document.createElement('p');
    recado.className = 'recado recado-erro';
    recado.textContent = 'Não deu para salvar a mudança. O cartão voltou para o lugar.';
    quadro.parentElement.insertBefore(recado, quadro);
    setTimeout(() => recado.remove(), 6000);
  }

  atualizarContagens();
})();

/* ─── A janela de detalhes ─────────────────────────────────────────────
 * Sem JavaScript, o link do cartão leva a ?atividade=N e o servidor manda
 * a janela já aberta. Com JavaScript, abre na hora. */
(function () {
  const janelas = document.querySelectorAll('dialog.janela');
  if (!janelas.length) return;

  document.addEventListener('click', (evento) => {
    const fechar = evento.target.closest('[data-fechar]');
    if (fechar) {
      const janela = document.getElementById(`atividade-${fechar.dataset.fechar}`);
      if (janela && janela.open) {
        evento.preventDefault();
        janela.close();
        limparEndereco();
      }
      return;
    }

    const link = evento.target.closest('.cartao-atividade-nome');
    if (!link) return;
    const id = link.closest('.cartao-atividade')?.dataset.atividade;
    const janela = document.getElementById(`atividade-${id}`);
    if (!janela) return;
    evento.preventDefault();
    if (!janela.open) janela.showModal();
  });

  // Se veio por ?atividade=N, o servidor mandou <dialog open> — que não
  // escurece o fundo. Reabre como janela de verdade.
  for (const janela of janelas) {
    if (janela.hasAttribute('open')) {
      janela.close();
      janela.showModal();
    }
    janela.addEventListener('close', limparEndereco);
  }

  function limparEndereco() {
    if (window.location.search.includes('atividade=')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }
})();
