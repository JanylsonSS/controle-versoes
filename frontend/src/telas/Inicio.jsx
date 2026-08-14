import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, dataBr, haQuantoTempo, hojeIso } from '../api.js';
import { useSessao } from '../App.jsx';
import { Janela, Campo } from '../componentes/Janela.jsx';

/**
 * TELA INICIAL — o dia da pessoa num olhar:
 *   1. notificações (mudanças não confirmadas, compromissos que marcaram
 *      para você, atividades em que você foi marcado);
 *   2. os projetos ativos, com busca pelo nome;
 *   3. o calendário da semana — clicar num dia marca reunião ou visita.
 */
export function Inicio() {
  const { sessao } = useSessao();

  return (
    <>
      <header className="pagina-topo">
        <div className="saudacao">Bem-vindo de volta</div>
        <h1>Sua semana no {sessao.aplicacao.nome}</h1>
      </header>

      <Notificacoes />
      <ProjetosAtivos />
      <Calendario />
    </>
  );
}

/* ─── 1. As notificações do topo ────────────────────────────────────── */

function Notificacoes() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(() => {
    api.pegar('/api/notificacoes').then(setDados).catch((e) => setErro(e.message));
  }, []);
  useEffect(carregar, [carregar]);

  if (erro) return <p className="recado recado-erro">{erro}</p>;
  if (!dados) return null;

  async function confirmar(orientacaoId) {
    try {
      await api.criar(`/api/orientacoes/${orientacaoId}/confirmar`);
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <section className="notificacoes">
      <div className="cartao">
        <h3>Mudanças para você ver</h3>
        {dados.avisos_pendentes.length === 0 && <p className="vazio">Nenhuma pendente. Você está em dia.</p>}
        <ul className="notificacao-lista">
          {dados.avisos_pendentes.map((a) => (
            <li key={a.id}>
              <Link className="notificacao-titulo" to={`/projetos/${a.projeto_id}`}>
                {a.orientacao_titulo}
              </Link>
              <span className="meta">
                {a.projeto_nome} · avisado {haQuantoTempo(a.enviado_em)}
                {a.atrasado && <> · <span className="chip chip-perigo">sem confirmação</span></>}
              </span>
              <div style={{ marginTop: 6 }}>
                <button className="botao botao-neutro" onClick={() => confirmar(a.orientacao_id)}>
                  Confirmo que vi
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="cartao">
        <h3>Marcaram para você</h3>
        {dados.marcados_para_voce.length === 0 && <p className="vazio">Nada marcado por outra pessoa.</p>}
        <ul className="notificacao-lista">
          {dados.marcados_para_voce.map((c) => (
            <li key={c.id}>
              <span className="notificacao-titulo">
                {c.tipo === 'REUNIAO' ? 'Reunião' : 'Visita técnica'} — {dataBr(c.dia)}
                {c.hora ? ` às ${c.hora}` : ''}
              </span>
              <span className="meta">{c.descricao}</span>
              <span className="meta">Marcada por {c.criador_nome}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="cartao">
        <h3>Suas atividades</h3>
        {dados.suas_atividades.length === 0 && <p className="vazio">Nenhuma atividade aberta com você.</p>}
        <ul className="notificacao-lista">
          {dados.suas_atividades.map((a) => (
            <li key={a.id}>
              <Link className="notificacao-titulo" to={`/projetos/${a.projeto_id}/atividades`}>
                {a.nome}
              </Link>
              <span className="meta">{a.projeto_nome}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ─── 2. Projetos ativos, com busca ─────────────────────────────────── */

function ProjetosAtivos() {
  const [busca, setBusca] = useState('');
  const [dados, setDados] = useState(null);

  useEffect(() => {
    const rota = busca ? `/api/projetos?busca=${encodeURIComponent(busca)}` : '/api/projetos';
    let cancelado = false;
    api.pegar(rota).then((d) => { if (!cancelado) setDados(d); }).catch(() => {});
    return () => { cancelado = true; };
  }, [busca]);

  if (!dados) return null;

  return (
    <section>
      <h2>Projetos</h2>
      <div className="busca">
        <input
          type="search"
          placeholder="Buscar projeto pelo nome ou código…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {dados.projetos.length === 0 && (
        <p className="vazio">
          {busca ? 'Nenhum projeto com esse nome.' : 'Nenhuma obra em andamento com você.'}
        </p>
      )}

      <div className="grade-projetos">
        {dados.projetos.map((p) => (
          <Link key={p.id} to={`/projetos/${p.id}`} className="cartao cartao-projeto">
            <span className="codigo">{p.codigo} · {p.tipo_rotulo}</span>
            <span className="nome">{p.nome}</span>
            <span>
              <span className="chip chip-info">{p.situacao_rotulo}</span>
              {p.local && <span className="meta"> · {p.local}</span>}
            </span>
            {p.orientacao_atual ? (
              <span className="orientacao">
                <span className="titulo">{p.orientacao_atual.titulo}</span>
                <br />
                <span className="meta">
                  {dataBr(p.orientacao_atual.data_da_mudanca)}
                  {p.orientacao_atual.responsavel_nome && <> · {p.orientacao_atual.responsavel_nome}</>}
                </span>
              </span>
            ) : (
              <span className="vazio">Ainda sem orientação publicada.</span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ─── 3. O calendário da semana ─────────────────────────────────────── */

const DIAS_DA_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function Calendario() {
  const { sessao } = useSessao();
  const [referencia, setReferencia] = useState(hojeIso());
  const [semana, setSemana] = useState(null);
  const [diaAberto, setDiaAberto] = useState(null); // YYYY-MM-DD da janela
  const [erro, setErro] = useState(null);

  const carregar = useCallback(() => {
    api.pegar(`/api/agenda?semana=${referencia}`).then(setSemana).catch((e) => setErro(e.message));
  }, [referencia]);
  useEffect(carregar, [carregar]);

  const porDia = useMemo(() => {
    const mapa = {};
    for (const c of semana?.compromissos ?? []) (mapa[c.dia] ??= []).push(c);
    return mapa;
  }, [semana]);

  function navegar(dias) {
    const d = new Date(`${referencia}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + dias);
    setReferencia(d.toISOString().slice(0, 10));
  }

  if (erro) return <p className="recado recado-erro">{erro}</p>;
  if (!semana) return null;

  return (
    <section className="calendario">
      <div className="calendario-topo">
        <h2 style={{ margin: 0 }}>Sua agenda da semana</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="botao botao-quieto" onClick={() => navegar(-7)}>‹ anterior</button>
          <button className="botao botao-neutro" onClick={() => setReferencia(hojeIso())}>hoje</button>
          <button className="botao botao-quieto" onClick={() => navegar(7)}>próxima ›</button>
        </div>
      </div>
      <p className="ajuda">
        Clique num dia para marcar uma reunião ou visita técnica.
        {sessao.pode.marcar_para_outros && ' Como coordenação, você também marca para as outras pessoas.'}
      </p>

      <div className="calendario-grade">
        {semana.dias.map((dia, i) => (
          <button
            key={dia}
            type="button"
            className={`calendario-dia${dia === hojeIso() ? ' hoje' : ''}`}
            onClick={() => setDiaAberto(dia)}
          >
            <span className="dia-rotulo">{DIAS_DA_SEMANA[i]}</span>
            <span className="dia-numero">{dia.slice(8)}</span>
            {(porDia[dia] ?? []).map((c) => (
              <span key={c.id} className={`compromisso ${c.tipo === 'REUNIAO' ? 'reuniao' : 'visita'}`}>
                {c.hora && <span className="hora">{c.hora} </span>}
                {c.tipo === 'REUNIAO' ? 'Reunião' : 'Visita'}
              </span>
            ))}
          </button>
        ))}
      </div>

      <JanelaMarcar
        dia={diaAberto}
        compromissos={porDia[diaAberto] ?? []}
        aoFechar={() => setDiaAberto(null)}
        aoMudar={carregar}
      />
    </section>
  );
}

/**
 * A janela flutuante do dia: o que já está marcado, e o formulário para
 * marcar — com uma instrução em cada campo, como foi pedido.
 */
function JanelaMarcar({ dia, compromissos, aoFechar, aoMudar }) {
  const { sessao } = useSessao();
  const [erro, setErro] = useState(null);
  const [salvando, setSalvando] = useState(false);

  if (!dia) return null;

  async function marcar(evento) {
    evento.preventDefault();
    const form = new FormData(evento.target);
    setSalvando(true);
    setErro(null);
    try {
      const corpo = {
        tipo: form.get('tipo'),
        dia,
        hora: form.get('hora') || null,
        descricao: form.get('descricao'),
      };
      if (sessao.pode.marcar_para_outros) corpo.participante_id = Number(form.get('participante_id'));
      await api.criar('/api/agenda', corpo);
      aoMudar();
      aoFechar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function desmarcar(id) {
    try {
      await api.apagar(`/api/agenda/${id}`);
      aoMudar();
      aoFechar();
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <Janela titulo={`Agenda de ${dataBr(dia)}`} aberta={Boolean(dia)} aoFechar={aoFechar}>
      {erro && <p className="recado recado-erro">{erro}</p>}

      {compromissos.length > 0 && (
        <ul className="notificacao-lista" style={{ marginBottom: 20 }}>
          {compromissos.map((c) => (
            <li key={c.id}>
              <span className="notificacao-titulo">
                {c.hora ? `${c.hora} — ` : ''}{c.tipo === 'REUNIAO' ? 'Reunião' : 'Visita técnica'}
              </span>
              <span className="meta">{c.descricao}</span>
              <span className="meta">Marcada por {c.criador_nome}</span>
              <div style={{ marginTop: 4 }}>
                <button className="botao botao-quieto" onClick={() => desmarcar(c.id)}>Desmarcar</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={marcar}>
        <Campo rotulo="O que é" instrucao="Reunião é conversa marcada; visita técnica é ida a campo ou ao canteiro.">
          <select name="tipo" defaultValue="REUNIAO">
            <option value="REUNIAO">Reunião</option>
            <option value="VISITA_TECNICA">Visita técnica</option>
          </select>
        </Campo>

        <Campo rotulo="Horário" instrucao="A hora de começar. Pode ficar em branco se ainda não estiver definida.">
          <input type="time" name="hora" />
        </Campo>

        <Campo
          rotulo="Descrição"
          instrucao="Diga com quem é e de qual projeto — ex.: 'Reunião com a prefeitura sobre o piso. Com Thayna. Projeto PAV-001.'"
        >
          <textarea name="descricao" required />
        </Campo>

        {sessao.pode.marcar_para_outros && (
          <Campo
            rotulo="Para quem"
            instrucao="O compromisso entra direto no calendário da pessoa escolhida, dizendo que foi você que marcou."
          >
            <select name="participante_id" defaultValue={sessao.usuario.id}>
              {sessao.pessoas.map((p) => (
                <option key={p.id} value={p.id}>{p.nome} — {p.papel_rotulo}</option>
              ))}
            </select>
          </Campo>
        )}

        <div className="janela-acoes">
          <button type="button" className="botao botao-neutro" onClick={aoFechar}>Cancelar</button>
          <button type="submit" className="botao botao-primario" disabled={salvando}>
            {salvando ? 'Marcando…' : 'Marcar'}
          </button>
        </div>
      </form>
    </Janela>
  );
}
