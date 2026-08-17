import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  BrowserRouter, Routes, Route, NavLink, Link, useLocation,
} from 'react-router-dom';
import { api } from './api.js';
import { Inicio } from './telas/Inicio.jsx';
import { Projeto } from './telas/Projeto.jsx';
import { Quadro } from './telas/Quadro.jsx';
import { Aprovacoes } from './telas/Aprovacoes.jsx';

/* A sessão (quem sou, o que posso, quem existe) vive num contexto: toda
 * tela precisa dela e ela raramente muda — só no "entrar como". */
const SessaoContexto = createContext(null);
export const useSessao = () => useContext(SessaoContexto);

export default function App() {
  const [sessao, setSessao] = useState(null);
  const [erro, setErro] = useState(null);

  const carregarSessao = useCallback(() => {
    api.pegar('/api/sessao').then(setSessao).catch((e) => setErro(e.message));
  }, []);

  useEffect(carregarSessao, [carregarSessao]);

  if (erro) return <main className="conteudo"><p className="recado recado-erro">{erro}</p></main>;
  if (!sessao) return null; // um instante; não vale um spinner

  return (
    <SessaoContexto.Provider value={{ sessao, carregarSessao }}>
      <BrowserRouter>
        <div className="aplicacao">
          <Lateral />
          <main className="conteudo">
            <Routes>
              <Route path="/" element={<Inicio />} />
              <Route path="/projetos/:id" element={<Projeto />} />
              <Route path="/projetos/:id/atividades" element={<Quadro />} />
              <Route path="/aprovacoes" element={<Aprovacoes />} />
              <Route path="*" element={<p className="vazio">Essa página não existe. <Link to="/">Voltar ao início</Link>.</p>} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </SessaoContexto.Provider>
  );
}

function Lateral() {
  const { sessao, carregarSessao } = useSessao();
  const [projetos, setProjetos] = useState([]);
  const [pendencias, setPendencias] = useState(0);
  const local = useLocation();

  // A lista da lateral acompanha a navegação: publicou, cadastrou ou
  // confirmou algo, ela se atualiza na próxima troca de tela.
  useEffect(() => {
    api.pegar('/api/projetos').then((d) => setProjetos(d.projetos)).catch(() => {});
    if (sessao.pode.aprovar) {
      api.pegar('/api/aprovacoes').then((d) => setPendencias(d.esperando.length)).catch(() => {});
    }
  }, [local, sessao]);

  async function entrarComo(evento) {
    const escolhido = sessao.pessoas.find((p) => p.id === Number(evento.target.value));
    // Virar quem aprova pede um "tem certeza": a troca é livre enquanto
    // não há login, mas fica registrada no servidor — e aprovar no nome
    // errado suja exatamente o registro que o sistema existe para manter.
    if (escolhido?.aprova && !window.confirm(
      `Você vai passar a agir como ${escolhido.nome} (${escolhido.papel_rotulo}), `
      + 'que aprova mudanças de orçamento e prazo.\n\n'
      + 'A troca fica registrada. Continuar?'
    )) {
      evento.target.value = String(sessao.usuario.id); // o select volta
      return;
    }
    await api.criar('/api/sessao', { usuario_id: escolhido.id });
    carregarSessao();
  }

  // A marca no espírito do logotipo: PRO | MAV, com o divisor dourado.
  // O nome vem da config; dividimos ao meio ("Promav" → PRO|MAV).
  const nome = sessao.aplicacao.nome.toUpperCase();
  const metade = Math.ceil(nome.length / 2);

  return (
    <aside className="lateral">
      <div className="lateral-marca">
        {nome.slice(0, metade)}
        <span className="divisor">|</span>
        <span className="forte">{nome.slice(metade)}</span>
      </div>

      <NavLink to="/" end className={({ isActive }) => `lateral-item${isActive ? ' atual' : ''}`}>
        Início
      </NavLink>
      {sessao.pode.aprovar && (
        <NavLink to="/aprovacoes" className={({ isActive }) => `lateral-item${isActive ? ' atual' : ''}`}>
          Aprovações {pendencias > 0 && <span className="chip chip-marca">{pendencias}</span>}
        </NavLink>
      )}

      <div className="lateral-titulo">Projetos</div>
      {projetos.map((p) => (
        <NavLink
          key={p.id}
          to={`/projetos/${p.id}`}
          className={({ isActive }) => `lateral-item${isActive ? ' atual' : ''}`}
        >
          {p.nome}
        </NavLink>
      ))}

      <div className={`lateral-rodape${sessao.pode.aprovar ? ' rodape-aprovador' : ''}`}>
        <p className="ajuda">Você está como</p>
        {/* O "entrar como" do protótipo. Morre quando o login com a conta
            Google entrar (ver PENDENCIAS.md). */}
        <select value={sessao.usuario.id} onChange={entrarComo}>
          {sessao.pessoas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome} — {p.papel_rotulo}
            </option>
          ))}
        </select>
        {sessao.pode.aprovar && (
          <p className="rodape-alerta">Papel que aprova — as ações valem em nome de {sessao.usuario.nome}.</p>
        )}
      </div>
    </aside>
  );
}
