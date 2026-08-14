import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, dataBr, haQuantoTempo } from '../api.js';

/**
 * A FILA DE AVAL — só CEO e coordenação chegam aqui (a lateral nem mostra
 * o link para os demais, e o servidor recusa de qualquer jeito).
 *
 * O aval é registro, não portão: a mudança já vale e o trabalho já corre.
 * O que se decide aqui é o "de acordo" de quem responde por orçamento e
 * prazo — ou a negativa, com motivo registrado.
 */
export function Aprovacoes() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(() => {
    api.pegar('/api/aprovacoes').then(setDados).catch((e) => setErro(e.message));
  }, []);
  useEffect(carregar, [carregar]);

  async function aprovar(id) {
    try {
      await api.criar(`/api/orientacoes/${id}/aprovar`);
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function negar(id) {
    const motivo = window.prompt('Por que o aval está sendo negado? O motivo fica registrado na mudança.');
    if (!motivo) return;
    try {
      await api.criar(`/api/orientacoes/${id}/reprovar`, { motivo });
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  if (erro) return <p className="recado recado-erro">{erro}</p>;
  if (!dados) return null;

  return (
    <>
      <header className="pagina-topo">
        <h1>Esperando o seu aval</h1>
        <p className="ajuda">
          Mudanças que mexem em orçamento ou prazo. Elas já valem e o trabalho
          já corre — o aval é o registro do seu "de acordo".
        </p>
      </header>

      {dados.esperando.length === 0 && <p className="vazio">Nada esperando aval.</p>}

      {dados.esperando.map((o) => (
        <section key={o.id} className="cartao aprovacao-item">
          <span className="codigo meta" style={{ fontFamily: 'var(--font-mono)' }}>{o.projeto_codigo}</span>
          <h2 style={{ margin: '4px 0' }}>
            <Link to={`/projetos/${o.projeto_id}`}>{o.projeto_nome}</Link> — {o.titulo}
          </h2>
          <p className="meta">
            Mudança de {dataBr(o.data_da_mudanca)} · publicada por {o.autor_nome} {haQuantoTempo(o.publicada_em)}
            {o.responsavel_nome && <> · quem faz: {o.responsavel_nome}</>}
          </p>
          <p style={{ whiteSpace: 'pre-wrap' }}>{o.descricao}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="botao botao-primario" onClick={() => aprovar(o.id)}>
              Registrar o aval
            </button>
            <button className="botao botao-neutro" onClick={() => negar(o.id)}>
              Negar, com motivo
            </button>
          </div>
        </section>
      ))}
    </>
  );
}
