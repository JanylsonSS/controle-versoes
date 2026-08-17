/* ══════════════════════════════════════════════════════════════════════
 * SESSÃO E NOTIFICAÇÕES
 *
 * /api/sessao — quem sou eu, o que posso fazer, e quem existe (para o
 *   seletor "entrar como" e para os campos de responsável/participante).
 * /api/notificacoes — o topo da tela inicial: mudanças que eu ainda não
 *   confirmei, compromissos que marcaram para mim, atividades em que fui
 *   marcado.
 * ══════════════════════════════════════════════════════════════════════ */

import { NOME_EXIBICAO, CHAMADA } from '../config.js';
import { usuarios, avisos, agenda, atividades, trocas } from '../persistencia/repositorio.js';
import { rotuloDoPapel, podePublicar, podeCadastrarProjeto } from '../regras/papeis.js';
import { ehAprovador } from '../regras/aprovacao.js';
import { estaAtrasado } from '../regras/ciencia.js';
import { veTodosOsProjetos } from '../regras/visibilidade.js';
import { ErroApi, definirSessao, enderecoDe, usuarioAutenticado } from './http.js';

const hoje = () => new Date().toISOString().slice(0, 10);

function pessoaParaTela(u) {
  return {
    id: u.id,
    nome: u.nome,
    papel: u.papel,
    papel_rotulo: rotuloDoPapel(u.papel),
    // O seletor "entrar como" pede confirmação ao virar quem aprova —
    // a decisão vem pronta daqui, para a tela não reimplementar regra.
    aprova: ehAprovador(u),
  };
}

export const rotasDeSessao = [
  ['GET', '/api/sessao', ({ usuario }) => ({
    aplicacao: { nome: NOME_EXIBICAO, chamada: CHAMADA },
    usuario: pessoaParaTela(usuario),
    // O frontend usa isto para decidir o que mostrar; o servidor continua
    // conferindo em cada rota — botão escondido não é segurança.
    // marcar_para_outros saiu daqui em 17/08: TODOS marcam para todos
    // (o controle virou o aviso automático à coordenação).
    pode: {
      publicar: podePublicar(usuario),
      aprovar: ehAprovador(usuario),
      cadastrar_projeto: podeCadastrarProjeto(usuario),
    },
    pessoas: usuarios.todos().map(pessoaParaTela),
  })],

  // Troca o "entrando como". Sai junto com o login de verdade.
  // A troca é livre, mas nunca é muda: fica registrada com quem era,
  // quem virou e o endereço de onde veio (tabela trocas_de_sessao).
  ['POST', '/api/sessao', ({ req, res, corpo }) => {
    const escolhido = usuarios.porId(Number(corpo.usuario_id));
    if (!escolhido) throw new ErroApi(400, 'Essa pessoa não existe.');
    trocas.registrar({
      // Só o que a requisição PROVA: sem cookie válido, "de" fica nulo.
      // O fallback (Álvaro) não entra aqui — registraria uma pessoa que
      // talvez nunca tenha estado naquele navegador.
      deUsuarioId: usuarioAutenticado(req)?.id ?? null,
      paraUsuarioId: escolhido.id,
      ip: enderecoDe(req),
    });
    definirSessao(res, escolhido.id);
    return { usuario: pessoaParaTela(escolhido) };
  }],

  // As leituras "por usuário" reconferem o R19 no repositório: quem saiu
  // de uma equipe não recebe mais o conteúdo daquele projeto por aqui.
  ['GET', '/api/notificacoes', ({ usuario }) => {
    const veTudo = veTodosOsProjetos(usuario);
    return {
      avisos_pendentes: avisos
        .doUsuario(usuario.id, { apenasPendentes: true, veTudo })
        .map((a) => ({ ...a, atrasado: estaAtrasado(a) })),
      marcados_para_voce: agenda.marcadasPorOutros(usuario.id, hoje()),
      suas_atividades: atividades.doResponsavel(usuario.id, { veTudo }),
    };
  }],
];
