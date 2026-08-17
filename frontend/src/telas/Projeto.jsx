import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, dataBr, dataHoraBr, haQuantoTempo } from '../api.js';
import { useSessao } from '../App.jsx';
import { Janela, Campo } from '../componentes/Janela.jsx';
import { Abas } from './Quadro.jsx';

/**
 * PÁGINA DO PROJETO, na ordem pedida:
 *   1. Informações atuais — a última orientação publicada;
 *   2. Histórico — dropdown com as anteriores, para comparar;
 *   3. Andamento do projeto;
 *   4. Ficha do projeto (com a placa ⚑ e a edição da coordenação).
 */
export function Projeto() {
  const { id } = useParams();
  const { sessao } = useSessao();
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [janela, setJanela] = useState(null); // 'publicar' | 'editar' | 'cadastro' | 'equipe'

  const carregar = useCallback(() => {
    setErro(null);
    api.pegar(`/api/projetos/${id}`).then(setDados).catch((e) => setErro(e.message));
  }, [id]);
  useEffect(carregar, [carregar]);

  if (erro) return <p className="recado recado-erro">{erro}</p>;
  if (!dados) return null;

  const { projeto } = dados;

  return (
    <>
      <header className="projeto-cabecalho">
        <div>
          <span className="codigo meta" style={{ fontFamily: 'var(--font-mono)' }}>
            {projeto.codigo}
          </span>
          <h1 style={{ marginTop: 4 }}>{projeto.nome}</h1>
          <span className="chip chip-info">{dados.situacao_rotulo}</span>{' '}
          <span className="chip chip-neutra">{dados.tipo_rotulo}</span>
          {projeto.local && <span className="meta"> · {projeto.local}</span>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {projeto.link_drive && (
            <a className="botao botao-neutro" href={projeto.link_drive} target="_blank" rel="noopener noreferrer">
              Pasta no Drive
            </a>
          )}
          {sessao.pode.publicar && (
            <button className="botao botao-primario" onClick={() => setJanela('publicar')}>
              Publicar mudança
            </button>
          )}
        </div>
      </header>

      <Abas projetoId={projeto.id} atual="projeto" />

      <InformacoesAtuais dados={dados} aoMudar={carregar} aoEditar={() => setJanela('editar')} />
      <Historico projetoId={projeto.id} atualId={dados.orientacao_atual?.id} />

      <div className="duas-colunas" style={{ marginTop: 'var(--sp-6)' }}>
        <Andamento projetoId={projeto.id} andamentos={dados.andamentos} aoMudar={carregar} />
        <Ficha dados={dados} aoMudar={carregar} aoEditarCadastro={() => setJanela('cadastro')} aoEditarEquipe={() => setJanela('equipe')} />
      </div>

      <JanelaOrientacao
        aberta={janela === 'publicar' || janela === 'editar'}
        projetoId={projeto.id}
        equipe={dados.equipe}
        existente={janela === 'editar' ? dados.orientacao_atual : null}
        aoFechar={() => setJanela(null)}
        aoMudar={carregar}
      />
      <JanelaCadastro
        aberta={janela === 'cadastro'}
        projeto={projeto}
        aoFechar={() => setJanela(null)}
        aoMudar={carregar}
      />
      <JanelaEquipe
        aberta={janela === 'equipe'}
        projeto={projeto}
        equipe={dados.equipe}
        aoFechar={() => setJanela(null)}
        aoMudar={carregar}
      />
    </>
  );
}

/* ─── 1. Informações atuais ─────────────────────────────────────────── */

function InformacoesAtuais({ dados, aoMudar, aoEditar }) {
  const { sessao } = useSessao();
  const [erro, setErro] = useState(null);
  const atual = dados.orientacao_atual;

  if (!atual) {
    return (
      <section className="cartao">
        <h3>Informações atuais do projeto</h3>
        <p className="vazio">Nenhuma orientação publicada ainda.</p>
      </section>
    );
  }

  async function confirmar() {
    try {
      await api.criar(`/api/orientacoes/${atual.id}/confirmar`);
      aoMudar();
    } catch (e) {
      setErro(e.message);
    }
  }

  const confirmaram = dados.ciencia_da_atual.filter((c) => c.confirmado_em);
  const faltam = dados.ciencia_da_atual.filter((c) => !c.confirmado_em);

  return (
    <section className="cartao orientacao-atual">
      <h3>Informações atuais do projeto</h3>
      {erro && <p className="recado recado-erro">{erro}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'start' }}>
        <div>
          <div className="titulo">{atual.titulo}</div>
          <p className="meta" style={{ margin: '4px 0 12px' }}>
            Mudança de {dataBr(atual.data_da_mudanca)}
            {atual.responsavel_nome && <> · quem faz: <strong>{atual.responsavel_nome}</strong></>}
            {' · '}publicada por {atual.autor_nome} {haQuantoTempo(atual.publicada_em)}
            {atual.editada_em && <> · editada {haQuantoTempo(atual.editada_em)}</>}
          </p>
        </div>
        <SeloDeAval orientacao={atual} />
      </div>

      <p className="descricao">{atual.descricao}</p>
      {atual.origem && (
        <p className="meta" style={{ marginTop: 4 }}>De onde veio: {atual.origem}</p>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        {dados.minha_confirmacao_pendente && (
          <button className="botao botao-primario" onClick={confirmar}>
            Confirmo que vi esta mudança
          </button>
        )}
        {sessao.pode.publicar && (
          <button className="botao botao-neutro" onClick={aoEditar}>Editar</button>
        )}
        {atual.atividade_id && (
          <Link className="botao botao-quieto" to={`/projetos/${atual.projeto_id}/atividades`}>
            Ver a atividade desta mudança →
          </Link>
        )}
      </div>

      <div className="ciencia">
        {confirmaram.map((c) => (
          <span key={c.id} className="chip chip-sucesso" title={`Confirmou em ${dataHoraBr(c.confirmado_em)}`}>
            ✓ {c.usuario_nome}
          </span>
        ))}
        {faltam.map((c) => (
          <span key={c.id} className={`chip ${c.atrasado ? 'chip-perigo' : 'chip-neutra'}`}>
            {c.usuario_nome} ainda não viu
          </span>
        ))}
      </div>
    </section>
  );
}

/** O aval do R17 é registro, não portão — o selo diz em que pé está. */
function SeloDeAval({ orientacao }) {
  if (!orientacao.muda_orcamento_ou_prazo) return null;
  if (orientacao.aprovada_em) {
    return <span className="chip chip-sucesso" title={`Aval de ${orientacao.aprovador_nome}`}>Aval registrado</span>;
  }
  if (orientacao.reprovada_em) {
    return <span className="chip chip-perigo" title={orientacao.motivo_reprovacao}>Aval negado</span>;
  }
  return <span className="chip chip-alerta">Muda orçamento/prazo · esperando aval</span>;
}

/* ─── 2. Histórico: o dropdown de comparação ────────────────────────── */

function Historico({ projetoId, atualId }) {
  const [lista, setLista] = useState(null);
  const [escolhidaId, setEscolhidaId] = useState('');

  useEffect(() => {
    api.pegar(`/api/projetos/${projetoId}/orientacoes`)
      .then((d) => setLista(d.orientacoes))
      .catch(() => {});
    setEscolhidaId('');
  }, [projetoId, atualId]);

  if (!lista) return null;
  const anteriores = lista.filter((o) => o.id !== atualId);
  if (anteriores.length === 0) return null;

  const escolhida = anteriores.find((o) => o.id === Number(escolhidaId));

  return (
    <section style={{ marginTop: 'var(--sp-4)' }}>
      <div className="campo" style={{ maxWidth: 520, marginBottom: 0 }}>
        <label htmlFor="historico">Histórico do projeto</label>
        <span className="instrucao">
          As orientações anteriores, para comparar com a atual — útil quando o
          cliente pede em reunião uma mudança que altera o projeto.
        </span>
        <select id="historico" value={escolhidaId} onChange={(e) => setEscolhidaId(e.target.value)}>
          <option value="">Escolha uma orientação antiga…</option>
          {anteriores.map((o) => (
            <option key={o.id} value={o.id}>
              {dataBr(o.data_da_mudanca)} — {o.titulo}
            </option>
          ))}
        </select>
      </div>

      {escolhida && (
        <div className="historico-painel">
          <span className="chip chip-neutra">Orientação antiga — não é a que vale</span>
          <h2 style={{ margin: '10px 0 4px' }}>{escolhida.titulo}</h2>
          <p className="meta">
            Mudança de {dataBr(escolhida.data_da_mudanca)} · publicada por {escolhida.autor_nome}
            {escolhida.responsavel_nome && <> · quem fez: {escolhida.responsavel_nome}</>}
          </p>
          <p style={{ whiteSpace: 'pre-wrap' }}>{escolhida.descricao}</p>
          {escolhida.origem && <p className="meta">De onde veio: {escolhida.origem}</p>}
        </div>
      )}
    </section>
  );
}

/* ─── 3. Andamento ──────────────────────────────────────────────────── */

function Andamento({ projetoId, andamentos, aoMudar }) {
  const [erro, setErro] = useState(null);

  async function registrar(evento) {
    evento.preventDefault();
    const form = new FormData(evento.target);
    try {
      await api.criar(`/api/projetos/${projetoId}/andamentos`, {
        o_que_fiz: form.get('o_que_fiz'),
        dificuldade: form.get('dificuldade') || null,
        duvida: form.get('duvida') || null,
      });
      evento.target.reset();
      aoMudar();
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <section className="cartao">
      <h3>Andamento do projeto</h3>
      {erro && <p className="recado recado-erro">{erro}</p>}

      <form onSubmit={registrar} style={{ marginBottom: 'var(--sp-4)' }}>
        <Campo rotulo="O que você fez" instrucao="Um registro curto do que avançou — ex.: 'fechei o detalhamento das estacas 12 a 20'.">
          <textarea name="o_que_fiz" required rows={2} />
        </Campo>
        <Campo rotulo="Dificuldade (opcional)" instrucao="Onde emperrou, se emperrou.">
          <input name="dificuldade" />
        </Campo>
        <Campo rotulo="Dúvida em aberto (opcional)" instrucao="O que você precisa que alguém responda para seguir.">
          <input name="duvida" />
        </Campo>
        <button className="botao botao-neutro" type="submit">Registrar</button>
      </form>

      {andamentos.length === 0 && <p className="vazio">Nada registrado ainda.</p>}
      {andamentos.map((a) => (
        <div key={a.id} className={`andamento-item${a.duvida ? ' com-duvida' : ''}`}>
          <p style={{ marginBottom: 2 }}>{a.o_que_fiz}</p>
          {a.dificuldade && <p style={{ marginBottom: 2 }}><span className="rotulo">Dificuldade</span>{a.dificuldade}</p>}
          {a.duvida && <p className="duvida" style={{ marginBottom: 2 }}><span className="rotulo">Dúvida</span>{a.duvida}</p>}
          <span className="meta">{a.autor_nome} · {dataHoraBr(a.registrado_em)}</span>
        </div>
      ))}
    </section>
  );
}

/* ─── 4. Ficha ──────────────────────────────────────────────────────── */

function Ficha({ dados, aoMudar, aoEditarCadastro, aoEditarEquipe }) {
  const { projeto } = dados;
  const [erro, setErro] = useState(null);
  const [copiado, setCopiado] = useState(false);

  async function avisarErro(campo) {
    const observacao = window.prompt(
      `O que está errado em "${campo}"? A coordenação recebe o aviso e corrige.\n(Pode enviar em branco.)`
    );
    if (observacao === null) return; // cancelou
    try {
      await api.criar(`/api/projetos/${projeto.id}/flags`, { campo, observacao });
      aoMudar();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function resolverFlag(flagId) {
    try {
      await api.criar(`/api/projetos/${projeto.id}/flags/${flagId}/resolver`);
      aoMudar();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function copiarCaminho() {
    try {
      await navigator.clipboard.writeText(projeto.caminho_rede);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // sem permissão de área de transferência: seleciona para Ctrl+C
      document.getElementById('caminho-rede')?.select();
    }
  }

  const linhas = [
    ['cliente', 'Cliente / contratante', projeto.cliente],
    ['numero_contrato', 'Contrato', projeto.numero_contrato],
    ['data_inicio', 'Início', dataBr(projeto.data_inicio)],
    ['prazo', 'Prazo', dataBr(projeto.prazo)],
    ['local', 'Onde é', projeto.local],
    // O conjunto vira link para a página das obras correlatas (R22).
    ['conjunto', 'Conjunto', projeto.conjunto && (
      <Link to={`/conjuntos/${encodeURIComponent(projeto.conjunto)}`}>{projeto.conjunto}</Link>
    )],
  ];

  return (
    <section className="cartao">
      <h3>Ficha do projeto</h3>
      {erro && <p className="recado recado-erro">{erro}</p>}

      <dl className="ficha">
        {linhas.map(([campo, rotulo, valor]) => (
          <div key={campo}>
            <dt>{rotulo}</dt>
            <dd>{valor || <span className="vazio">não preenchido</span>}</dd>
            <button
              type="button"
              className="placa"
              title="Avisar a coordenação de que este campo está errado"
              onClick={() => avisarErro(campo)}
            >
              ⚑
            </button>
          </div>
        ))}
      </dl>

      {projeto.caminho_rede && (
        <div style={{ marginTop: 'var(--sp-3)' }}>
          <span className="meta">Pasta no computador do escritório</span>
          <div className="caminho-rede">
            <input id="caminho-rede" readOnly value={projeto.caminho_rede} onClick={(e) => e.target.select()} />
            <button className="botao botao-neutro" type="button" onClick={copiarCaminho}>
              {copiado ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>
      )}

      {dados.flags_abertas.length > 0 && (
        <div style={{ marginTop: 'var(--sp-4)' }}>
          <h3>Avisos de cadastro errado</h3>
          {dados.flags_abertas.map((f) => (
            <p key={f.id} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
              <span className="chip chip-alerta">⚑ {f.campo ?? 'cadastro'}</span>
              <span>{f.observacao || <span className="vazio">sem detalhe</span>}</span>
              <span className="meta">{f.autor_nome}</span>
              {dados.pode_corrigir && (
                <button className="botao botao-quieto" onClick={() => resolverFlag(f.id)}>Já corrigi</button>
              )}
            </p>
          ))}
        </div>
      )}

      <div style={{ marginTop: 'var(--sp-4)' }}>
        <h3>Equipe</h3>
        <div className="ciencia" style={{ marginTop: 0 }}>
          {dados.equipe.map((u) => (
            <span key={u.id} className="chip chip-neutra" title={u.papel_rotulo}>{u.nome}</span>
          ))}
        </div>
        <p className="ajuda" style={{ marginTop: 8 }}>
          Só quem está na equipe vê este projeto e é avisado quando ele muda.
        </p>
      </div>

      {dados.pode_corrigir && (
        <div style={{ display: 'flex', gap: 8, marginTop: 'var(--sp-4)' }}>
          <button className="botao botao-neutro" onClick={aoEditarCadastro}>Corrigir cadastro</button>
          <button className="botao botao-neutro" onClick={aoEditarEquipe}>Mudar equipe</button>
        </div>
      )}
    </section>
  );
}

/* ─── Janelas ───────────────────────────────────────────────────────── */

/**
 * Publicar ou editar a orientação. Publicar dispara o ato triplo do
 * servidor (grava + cria a atividade + avisa a equipe); editar reabre a
 * ciência de todos — a janela avisa isso para ninguém editar à toa.
 */
function JanelaOrientacao({ aberta, projetoId, equipe, existente, aoFechar, aoMudar }) {
  const [erro, setErro] = useState(null);

  async function salvar(evento) {
    evento.preventDefault();
    const form = new FormData(evento.target);
    const corpo = {
      titulo: form.get('titulo'),
      descricao: form.get('descricao'),
      origem: form.get('origem') || null,
      data_da_mudanca: form.get('data_da_mudanca'),
      responsavel_id: form.get('responsavel_id') || null,
    };
    try {
      if (existente) {
        await api.trocar(`/api/orientacoes/${existente.id}`, corpo);
      } else {
        corpo.muda_orcamento_ou_prazo = form.get('muda_orcamento_ou_prazo') === 'on';
        await api.criar(`/api/projetos/${projetoId}/orientacoes`, corpo);
      }
      aoMudar();
      aoFechar();
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <Janela
      titulo={existente ? 'Editar a mudança atual' : 'Publicar uma mudança'}
      aberta={aberta}
      aoFechar={aoFechar}
    >
      {erro && <p className="recado recado-erro">{erro}</p>}
      {existente && (
        <p className="recado recado-ok" style={{ background: 'var(--warning-soft)', color: 'var(--warning)' }}>
          Editar reabre a confirmação de todo mundo: se o texto mudou, "eu vi"
          precisa ser dito de novo.
        </p>
      )}

      <form onSubmit={salvar}>
        <Campo rotulo="Título da mudança" instrucao="O que mudou, em uma linha — ex.: 'mudou o orçamento da bancada'.">
          <input name="titulo" required defaultValue={existente?.titulo ?? ''} />
        </Campo>
        <Campo rotulo="Data da mudança" instrucao="Quando a mudança foi decidida ou passou a valer.">
          <input type="date" name="data_da_mudanca" required defaultValue={existente?.data_da_mudanca ?? ''} />
        </Campo>
        <Campo rotulo="Descrição" instrucao="O que a pessoa precisa saber para executar. Escreva para quem vai fazer, não para o sistema.">
          <textarea name="descricao" required rows={4} defaultValue={existente?.descricao ?? ''} />
        </Campo>
        <Campo rotulo="De onde veio" instrucao="Quem pediu e por onde — ex.: 'pedido do cliente na reunião de 12/08', 'ofício da prefeitura'. É o que responde 'eu não pedi isso' meses depois. Pode ficar em branco.">
          <input name="origem" defaultValue={existente?.origem ?? ''} />
        </Campo>
        <Campo rotulo="Quem vai fazer" instrucao="A mudança vira automaticamente uma atividade no quadro, no nome dessa pessoa.">
          <select name="responsavel_id" defaultValue={existente?.responsavel_id ?? ''}>
            <option value="">Ninguém ainda</option>
            {equipe.map((u) => (
              <option key={u.id} value={u.id}>{u.nome} — {u.papel_rotulo}</option>
            ))}
          </select>
        </Campo>
        {!existente && (
          <Campo rotulo="Orçamento e prazo" instrucao="Se marcar, a mudança entra na fila de aval do CEO e da coordenação — mas o trabalho não espera por isso.">
            <span style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 400 }}>
              <input type="checkbox" name="muda_orcamento_ou_prazo" style={{ width: 18, height: 18 }} />
              Esta mudança altera orçamento ou prazo
            </span>
          </Campo>
        )}

        <div className="janela-acoes">
          <button type="button" className="botao botao-neutro" onClick={aoFechar}>Cancelar</button>
          <button type="submit" className="botao botao-primario">
            {existente ? 'Salvar edição' : 'Publicar e avisar a equipe'}
          </button>
        </div>
      </form>
    </Janela>
  );
}

/** Corrigir o cadastro — só a coordenação chega aqui. */
function JanelaCadastro({ aberta, projeto, aoFechar, aoMudar }) {
  const [opcoes, setOpcoes] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (aberta) api.pegar('/api/cadastro/opcoes').then(setOpcoes).catch((e) => setErro(e.message));
  }, [aberta]);

  async function salvar(evento) {
    evento.preventDefault();
    const form = new FormData(evento.target);
    const corpo = Object.fromEntries(
      ['codigo', 'nome', 'local', 'cliente', 'numero_contrato', 'data_inicio', 'prazo',
        'situacao', 'tipo', 'conjunto', 'link_drive', 'caminho_rede']
        .map((c) => [c, form.get(c) || null])
    );
    try {
      await api.trocar(`/api/projetos/${projeto.id}`, corpo);
      aoMudar();
      aoFechar();
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <Janela titulo="Corrigir o cadastro" aberta={aberta} aoFechar={aoFechar}>
      {erro && <p className="recado recado-erro">{erro}</p>}
      {opcoes && (
        <form onSubmit={salvar}>
          <Campo rotulo="Código"><input name="codigo" required defaultValue={projeto.codigo} /></Campo>
          <Campo rotulo="Nome"><input name="nome" required defaultValue={projeto.nome} /></Campo>
          <Campo rotulo="Situação da obra" instrucao="Concluída ou parada sai da lista principal, mas continua guardada.">
            <select name="situacao" defaultValue={projeto.situacao}>
              {opcoes.situacoes.map((s) => <option key={s.codigo} value={s.codigo}>{s.rotulo}</option>)}
            </select>
          </Campo>
          <Campo rotulo="Tipo de obra">
            <select name="tipo" defaultValue={projeto.tipo}>
              {opcoes.tipos.map((t) => <option key={t.codigo} value={t.codigo}>{t.rotulo}</option>)}
            </select>
          </Campo>
          <Campo rotulo="Onde é"><input name="local" defaultValue={projeto.local ?? ''} /></Campo>
          <Campo rotulo="Cliente / contratante"><input name="cliente" defaultValue={projeto.cliente ?? ''} /></Campo>
          <Campo rotulo="Número do contrato"><input name="numero_contrato" defaultValue={projeto.numero_contrato ?? ''} /></Campo>
          <Campo rotulo="Início"><input type="date" name="data_inicio" defaultValue={projeto.data_inicio ?? ''} /></Campo>
          <Campo rotulo="Prazo"><input type="date" name="prazo" defaultValue={projeto.prazo ?? ''} /></Campo>
          <Campo rotulo="Conjunto de obras" instrucao="Use um nome que já existe, para não criar dois para a mesma coisa.">
            <input name="conjunto" list="conjuntos" defaultValue={projeto.conjunto ?? ''} />
            <datalist id="conjuntos">
              {opcoes.conjuntos.map((c) => <option key={c.nome} value={c.nome} />)}
            </datalist>
          </Campo>
          <Campo rotulo="Link da pasta no Drive"><input name="link_drive" defaultValue={projeto.link_drive ?? ''} /></Campo>
          <Campo rotulo="Caminho da pasta no computador" instrucao="O G:\ do explorador de arquivos do escritório.">
            <input name="caminho_rede" defaultValue={projeto.caminho_rede ?? ''} />
          </Campo>

          <div className="janela-acoes">
            <button type="button" className="botao botao-neutro" onClick={aoFechar}>Cancelar</button>
            <button type="submit" className="botao botao-primario">Salvar correção</button>
          </div>
        </form>
      )}
    </Janela>
  );
}

/** Mudar quem trabalha no projeto — a lista que decide quem vê e quem é avisado. */
function JanelaEquipe({ aberta, projeto, equipe, aoFechar, aoMudar }) {
  const { sessao } = useSessao();
  const [erro, setErro] = useState(null);

  async function salvar(evento) {
    evento.preventDefault();
    const form = new FormData(evento.target);
    try {
      await api.trocar(`/api/projetos/${projeto.id}/equipe`, {
        usuario_ids: form.getAll('equipe').map(Number),
      });
      aoMudar();
      aoFechar();
    } catch (e) {
      setErro(e.message);
    }
  }

  const naEquipe = new Set(equipe.map((u) => u.id));

  return (
    <Janela titulo="Quem trabalha neste projeto" aberta={aberta} aoFechar={aoFechar}>
      {erro && <p className="recado recado-erro">{erro}</p>}
      <p className="ajuda">
        Esta lista decide duas coisas ao mesmo tempo: quem vê o projeto e quem
        é avisado quando ele muda.
      </p>
      <form onSubmit={salvar}>
        {sessao.pessoas.map((p) => (
          <label key={p.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <input type="checkbox" name="equipe" value={p.id} defaultChecked={naEquipe.has(p.id)} style={{ width: 18, height: 18 }} />
            <span>{p.nome} <span className="meta">{p.papel_rotulo}</span></span>
          </label>
        ))}
        <div className="janela-acoes">
          <button type="button" className="botao botao-neutro" onClick={aoFechar}>Cancelar</button>
          <button type="submit" className="botao botao-primario">Salvar equipe</button>
        </div>
      </form>
    </Janela>
  );
}
