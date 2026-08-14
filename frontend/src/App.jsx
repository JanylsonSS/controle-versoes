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

  async function entrarComo(usuarioId) {
    await api.criar('/api/sessao', { usuario_id: Number(usuarioId) });
    carregarSessao();
  }

  return (
    <aside className="lateral">
      <div className="lateral-marca">{sessao.aplicacao.nome.toLowerCase()}</div>

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

      <div className="lateral-rodape">
        <p className="ajuda">Você está como</p>
        {/* O "entrar como" do protótipo. Morre quando o login com a conta
            Google entrar (ver PENDENCIAS.md). */}
        <select value={sessao.usuario.id} onChange={(e) => entrarComo(e.target.value)}>
          {sessao.pessoas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome} — {p.papel_rotulo}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}
