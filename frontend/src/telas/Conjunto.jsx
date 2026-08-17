import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api.js';
import { CartaoProjeto } from './Inicio.jsx';

/**
 * R22 — o conjunto de obras correlatas ("Reformas de Escolas 2026") num
 * lugar só. Chega-se aqui pelo link do campo Conjunto na ficha.
 *
 * O R19 vale como em toda parte: os cartões são só dos projetos que a
 * pessoa enxerga; o resto vira uma contagem, sem nome nem conteúdo.
 */
export function Conjunto() {
  const { nome } = useParams();
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    setDados(null);
    setErro(null);
    api.pegar(`/api/conjuntos/${encodeURIComponent(nome)}`)
      .then(setDados)
      .catch((e) => setErro(e.message));
  }, [nome]);

  if (erro) return <p className="recado recado-erro">{erro}</p>;
  if (!dados) return null;

  return (
    <>
      <header className="pagina-topo">
        <p className="ajuda" style={{ margin: 0 }}>Conjunto de obras</p>
        <h1>{dados.nome}</h1>
      </header>

      {dados.projetos.length === 0 && (
        <p className="vazio">Nenhuma obra deste conjunto está com você.</p>
      )}

      <div className="grade-projetos">
        {dados.projetos.map((p) => <CartaoProjeto key={p.id} p={p} />)}
      </div>

      {dados.escondidas > 0 && (
        <p className="vazio" style={{ marginTop: 'var(--sp-4)' }}>
          {dados.escondidas === 1
            ? 'Mais 1 obra deste conjunto não aparece'
            : `Mais ${dados.escondidas} obras deste conjunto não aparecem`}
          {' '}porque você não está na equipe — peça à coordenação se precisar.
        </p>
      )}
    </>
  );
}
