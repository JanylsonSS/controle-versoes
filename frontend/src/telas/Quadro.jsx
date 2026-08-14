import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, dataBr, dataHoraBr } from '../api.js';
import { useSessao } from '../App.jsx';
import { Janela, Campo } from '../componentes/Janela.jsx';

/** As abas do projeto — usadas aqui e na página do projeto. */
export function Abas({ projetoId, atual }) {
  return (
    <nav className="abas">
      <Link to={`/projetos/${projetoId}`} className={atual === 'projeto' ? 'atual' : ''}>
        Projeto
      </Link>
      <Link to={`/projetos/${projetoId}/atividades`} className={atual === 'atividades' ? 'atual' : ''}>
        Atividades
      </Link>
    </nav>
  );
}

/**
 * O QUADRO — como era antes, agora em React.
 *
 * Arrastar usa eventos de ponteiro (mouse e dedo com um código só; a API
 * de drag-and-drop do HTML não funciona no toque). Quem preferir não
 * arrastar muda a coluna pela janela de detalhes. Mover cartão NÃO mexe
 * em orientação nem em aviso — são mundos separados de propósito.
 */
export function Quadro() {
  const { id } = useParams();
  const [dados, setDados] = useState(null);
  const [projeto, setProjeto] = useState(null);
  const [erro, setErro] = useState(null);
  const [aberta, setAberta] = useState(null); // atividade da janela
  const [criando, setCriando] = useState(false);

  const carregar = useCallback(() => {
    api.pegar(`/api/projetos/${id}/atividades`).then(setDados).catch((e) => setErro(e.message));
    api.pegar(`/api/projetos/${id}`).then(setProjeto).catch(() => {});
  }, [id]);
  useEffect(carregar, [carregar]);

  if (erro) return <p className="recado recado-erro">{erro}</p>;
  if (!dados) return null;

  return (
    <>
      <header className="projeto-cabecalho">
        <div>
          <h1>{projeto?.projeto?.nome ?? 'Atividades'}</h1>
          <p className="ajuda" style={{ margin: 0 }}>
            Arraste o cartão para mudar de coluna, ou clique nele para os detalhes.
            Mover cartão não muda a orientação do projeto.
          </p>
        </div>
        <button className="botao botao-primario" onClick={() => setCriando(true)}>
          Acrescentar atividade
        </button>
      </header>

      <Abas projetoId={id} atual="atividades" />

      <Colunas dados={dados} aoMudar={carregar} aoAbrir={setAberta} />

      <JanelaAtividade
        atividade={aberta}
        colunas={dados.colunas}
        equipe={projeto?.equipe ?? []}
        aoFechar={() => setAberta(null)}
        aoMudar={carregar}
      />
      <JanelaNovaAtividade
        aberta={criando}
        projetoId={id}
        colunas={dados.colunas}
        equipe={projeto?.equipe ?? []}
        aoFechar={() => setCriando(false)}
        aoMudar={carregar}
      />
    </>
  );
}

/* ─── As colunas e o arrastar ───────────────────────────────────────── */

const LIMIAR_ARRASTE = 6; // px; abaixo disso é clique

function Colunas({ dados, aoMudar, aoAbrir }) {
  const [fantasma, setFantasma] = useState(null); // {atividade, x, y}
  const [colunaAlvo, setColunaAlvo] = useState(null);
  const arrasteRef = useRef(null);
  const quadroRef = useRef(null);

  function aoPressionar(evento, atividade) {
    if (evento.button > 0) return;
    arrasteRef.current = {
      atividade,
      x0: evento.clientX,
      y0: evento.clientY,
      dx: 0,
      dy: 0,
      arrastando: false,
    };
  }

  useEffect(() => {
    function aoMover(evento) {
      const a = arrasteRef.current;
      if (!a) return;
      if (!a.arrastando) {
        if (Math.hypot(evento.clientX - a.x0, evento.clientY - a.y0) < LIMIAR_ARRASTE) return;
        a.arrastando = true;
      }
      evento.preventDefault();
      setFantasma({ atividade: a.atividade, x: evento.clientX + 8, y: evento.clientY + 8 });

      const alvo = document
        .elementFromPoint(evento.clientX, evento.clientY)
        ?.closest('[data-coluna]');
      setColunaAlvo(alvo?.dataset.coluna ?? null);
    }

    async function aoSoltar(evento) {
      const a = arrasteRef.current;
      arrasteRef.current = null;
      setFantasma(null);
      const alvo = document.elementFromPoint(evento.clientX, evento.clientY)?.closest('[data-coluna]');
      setColunaAlvo(null);

      if (!a) return;
      if (!a.arrastando) {
        aoAbrir(a.atividade); // foi um clique
        return;
      }
      const coluna = alvo?.dataset.coluna;
      if (!coluna || coluna === a.atividade.situacao) return;
      try {
        await api.criar(`/api/atividades/${a.atividade.id}/mover`, { situacao: coluna, posicao: 0 });
      } finally {
        aoMudar(); // certo ou errado, a tela volta a espelhar o servidor
      }
    }

    document.addEventListener('pointermove', aoMover);
    document.addEventListener('pointerup', aoSoltar);
    return () => {
      document.removeEventListener('pointermove', aoMover);
      document.removeEventListener('pointerup', aoSoltar);
    };
  }, [aoMudar, aoAbrir]);

  return (
    <div className="quadro" ref={quadroRef}>
      {dados.colunas.map((coluna) => {
        const cartoes = dados.atividades.filter((a) => a.situacao === coluna.codigo);
        return (
          <section
            key={coluna.codigo}
            className={`coluna${colunaAlvo === coluna.codigo ? ' alvo' : ''}`}
            data-coluna={coluna.codigo}
          >
            <div className="coluna-titulo">
              {coluna.rotulo} <span className="coluna-contagem">{cartoes.length}</span>
            </div>
            <div className="coluna-cartoes">
              {cartoes.map((a) => (
                <article
                  key={a.id}
                  className={`cartao-atividade${fantasma?.atividade.id === a.id ? ' arrastando' : ''}`}
                  onPointerDown={(e) => aoPressionar(e, a)}
                >
                  <span className="nome">{a.nome}</span>
                  {a.orientacao_id && <span className="vinculo">vem de uma mudança do projeto</span>}
                  <div className="meta">
                    {a.responsavel_nome ?? <span className="vazio">sem responsável</span>}
                    {a.iniciada_em && <> · iniciada {dataBr(a.iniciada_em.slice(0, 10))}</>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      {fantasma && (
        <article className="cartao-atividade fantasma" style={{ left: fantasma.x, top: fantasma.y }}>
          <span className="nome">{fantasma.atividade.nome}</span>
        </article>
      )}
    </div>
  );
}

/* ─── Janela de detalhes e edição ───────────────────────────────────── */

function JanelaAtividade({ atividade, colunas, equipe, aoFechar, aoMudar }) {
  const [erro, setErro] = useState(null);

  if (!atividade) return null;

  async function salvar(evento) {
    evento.preventDefault();
    const form = new FormData(evento.target);
    try {
      await api.ajustar(`/api/atividades/${atividade.id}`, {
        nome: form.get('nome'),
        descricao: form.get('descricao') || null,
        responsavel_id: form.get('responsavel_id') || null,
        situacao: form.get('situacao'),
      });
      aoMudar();
      aoFechar();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function apagar() {
    if (!window.confirm('Apagar esta atividade? Isso não desfaz.')) return;
    try {
      await api.apagar(`/api/atividades/${atividade.id}`);
      aoMudar();
      aoFechar();
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <Janela titulo={atividade.nome} aberta={Boolean(atividade)} aoFechar={aoFechar}>
      {erro && <p className="recado recado-erro">{erro}</p>}

      <p className="meta">
        Criada por {atividade.criador_nome} em {dataHoraBr(atividade.criada_em)}
        {atividade.iniciada_em && <> · iniciada em {dataHoraBr(atividade.iniciada_em)}</>}
        {atividade.finalizada_em && <> · finalizada em {dataHoraBr(atividade.finalizada_em)}</>}
      </p>
      <p className="ajuda">
        As datas de início e fim são do sistema: entram e saem sozinhas quando
        o cartão muda de coluna.
      </p>

      <form onSubmit={salvar}>
        <Campo rotulo="O que precisa ser feito">
          <input name="nome" required defaultValue={atividade.nome} />
        </Campo>
        <Campo rotulo="Descrição" instrucao="O que envolve, o que precisa estar pronto antes, onde estão as referências.">
          <textarea name="descricao" rows={3} defaultValue={atividade.descricao ?? ''} />
        </Campo>
        <Campo rotulo="Quem está fazendo">
          <select name="responsavel_id" defaultValue={atividade.responsavel_id ?? ''}>
            <option value="">Ninguém ainda</option>
            {equipe.map((u) => (
              <option key={u.id} value={u.id}>{u.nome} — {u.papel_rotulo}</option>
            ))}
          </select>
        </Campo>
        <Campo rotulo="Coluna" instrucao="O mesmo que arrastar o cartão, para quem preferir escolher aqui.">
          <select name="situacao" defaultValue={atividade.situacao}>
            {colunas.map((c) => <option key={c.codigo} value={c.codigo}>{c.rotulo}</option>)}
          </select>
        </Campo>

        <div className="janela-acoes">
          {atividade.pode_excluir && (
            <button type="button" className="botao botao-perigo" onClick={apagar} style={{ marginRight: 'auto' }}>
              Apagar
            </button>
          )}
          <button type="button" className="botao botao-neutro" onClick={aoFechar}>Cancelar</button>
          <button type="submit" className="botao botao-primario">Salvar</button>
        </div>
      </form>
    </Janela>
  );
}

function JanelaNovaAtividade({ aberta, projetoId, colunas, equipe, aoFechar, aoMudar }) {
  const [erro, setErro] = useState(null);

  async function criar(evento) {
    evento.preventDefault();
    const form = new FormData(evento.target);
    try {
      await api.criar(`/api/projetos/${projetoId}/atividades`, {
        nome: form.get('nome'),
        descricao: form.get('descricao') || null,
        responsavel_id: form.get('responsavel_id') || null,
        situacao: form.get('situacao'),
      });
      aoMudar();
      aoFechar();
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <Janela titulo="Acrescentar atividade" aberta={aberta} aoFechar={aoFechar}>
      {erro && <p className="recado recado-erro">{erro}</p>}
      <form onSubmit={criar}>
        <Campo rotulo="O que precisa ser feito" instrucao="Ex.: 'detalhamento do meio-fio do trecho leste'.">
          <input name="nome" required />
        </Campo>
        <Campo rotulo="Descrição (opcional)">
          <textarea name="descricao" rows={3} />
        </Campo>
        <Campo rotulo="Quem vai fazer">
          <select name="responsavel_id" defaultValue="">
            <option value="">Ninguém ainda</option>
            {equipe.map((u) => (
              <option key={u.id} value={u.id}>{u.nome} — {u.papel_rotulo}</option>
            ))}
          </select>
        </Campo>
        <Campo rotulo="Começa em qual coluna">
          <select name="situacao" defaultValue="NAO_INICIADO">
            {colunas.map((c) => <option key={c.codigo} value={c.codigo}>{c.rotulo}</option>)}
          </select>
        </Campo>
        <div className="janela-acoes">
          <button type="button" className="botao botao-neutro" onClick={aoFechar}>Cancelar</button>
          <button type="submit" className="botao botao-primario">Acrescentar</button>
        </div>
      </form>
    </Janela>
  );
}
