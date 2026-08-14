import { useEffect, useRef } from 'react';

/**
 * A janela flutuante do sistema — um <dialog> nativo com o visual do
 * modelo. Fecha no ✕, no Esc e clicando no fundo escuro.
 */
export function Janela({ titulo, aberta, aoFechar, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (aberta && !dialogo.open) dialogo.showModal();
    if (!aberta && dialogo.open) dialogo.close();
  }, [aberta]);

  if (!aberta) return null;

  return (
    <dialog
      ref={ref}
      className="janela"
      onClose={aoFechar}
      onClick={(e) => {
        // clique no backdrop: o alvo é o próprio dialog, não um filho
        if (e.target === ref.current) aoFechar();
      }}
    >
      <div className="janela-topo">
        <h2>{titulo}</h2>
        <button type="button" className="janela-fechar" onClick={aoFechar} aria-label="Fechar">
          ✕
        </button>
      </div>
      {children}
    </dialog>
  );
}

/** Rótulo + instrução + o campo em si. Toda entrada do sistema usa isto —
 * é o que garante que cada campo explica o que espera. */
export function Campo({ rotulo, instrucao, children }) {
  return (
    <label className="campo">
      <span>{rotulo}</span>
      {instrucao && <span className="instrucao">{instrucao}</span>}
      {children}
    </label>
  );
}
