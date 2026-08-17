import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, dataBr } from '../api.js';

/**
 * R12 — O PAINEL DA DIREÇÃO (e da coordenação).
 *
 * Desde que a medição de retrabalho (R11) saiu no pivô, é o candidato a
 * instrumento das metas: em vez de "quanto custou executar errado",
 * mede o que evita o erro — o tempo até a ciência e o que está parado.
 * Números e tabelas simples; a API manda tudo pronto.
 */
export function Indicadores() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    api.pegar('/api/indicadores').then(setDados).catch((e) => setErro(e.message));
  }, []);

  if (erro) return <p className="recado recado-erro">{erro}</p>;
  if (!dados) return null;

  const g = dados.gerais;

  return (
    <>
      <header className="pagina-topo">
        <h1>Indicadores</h1>
        <p className="ajuda">
          O caminho da informação em números: quanto tempo uma mudança leva
          para ser vista, o que espera aval e o que está parado. Calculados
          na hora, sobre tudo o que o sistema já registrou.
        </p>
      </header>

      <div className="indicadores-gerais">
        <Numero valor={g.tempo_medio_ciencia_horas != null ? `${g.tempo_medio_ciencia_horas} h` : '—'}
          rotulo="tempo médio até a ciência" />
        <Numero valor={g.ciencias_pendentes} rotulo="ciências pendentes"
          alerta={g.ciencias_atrasadas > 0 ? `${g.ciencias_atrasadas} atrasada(s)` : null} />
        <Numero valor={g.aval_esperando} rotulo="esperando aval" />
        <Numero valor={g.tempo_medio_aval_horas != null ? `${g.tempo_medio_aval_horas} h` : '—'}
          rotulo="tempo médio do aval" />
        <Numero valor={g.orientacoes_30_dias} rotulo="mudanças nos últimos 30 dias" />
      </div>

      <section className="cartao" style={{ marginTop: 'var(--sp-4)' }}>
        <h3>Por obra</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="tabela">
            <thead>
              <tr>
                <th>Obra</th><th>Situação</th><th>Mudanças</th><th>Última</th>
                <th>Ciências pendentes</th><th>Atividades abertas</th>
              </tr>
            </thead>
            <tbody>
              {dados.por_obra.map((p) => (
                <tr key={p.id}>
                  <td><Link to={`/projetos/${p.id}`}>{p.codigo} — {p.nome}</Link></td>
                  <td>{p.situacao_rotulo}</td>
                  <td>{p.orientacoes}</td>
                  <td>{p.ultima_publicada_em ? dataBr(p.ultima_publicada_em.slice(0, 10)) : '—'}</td>
                  <td>
                    {p.ciencias_pendentes}
                    {p.ciencias_atrasadas > 0 && (
                      <span className="chip chip-perigo" style={{ marginLeft: 6 }}>
                        {p.ciencias_atrasadas} atrasada(s)
                      </span>
                    )}
                  </td>
                  <td>{p.atividades_abertas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="duas-colunas" style={{ marginTop: 'var(--sp-4)' }}>
        <section className="cartao">
          <h3>O quadro agora</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {dados.atividades_por_coluna.map((c) => (
              <span key={c.codigo} className="chip chip-neutra">
                {c.rotulo}: <strong>{c.quantidade}</strong>
              </span>
            ))}
          </div>
        </section>

        <section className="cartao">
          <h3>Por pessoa</h3>
          <table className="tabela">
            <thead>
              <tr><th>Quem</th><th>Ciências pendentes</th><th>Andamentos (30 dias)</th></tr>
            </thead>
            <tbody>
              {dados.por_pessoa.map((u) => (
                <tr key={u.id}>
                  <td>{u.nome}</td>
                  <td>
                    {u.ciencias_pendentes}
                    {u.ciencias_atrasadas > 0 && (
                      <span className="chip chip-perigo" style={{ marginLeft: 6 }}>
                        {u.ciencias_atrasadas} atrasada(s)
                      </span>
                    )}
                  </td>
                  <td>{u.andamentos_30_dias}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}

function Numero({ valor, rotulo, alerta = null }) {
  return (
    <div className="cartao indicador">
      <span className="indicador-valor">{valor}</span>
      <span className="meta">{rotulo}</span>
      {alerta && <span className="chip chip-perigo">{alerta}</span>}
    </div>
  );
}
