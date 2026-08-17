/* ══════════════════════════════════════════════════════════════════════
 * R9 — PAPÉIS E PERMISSÕES POR ÁREA
 *
 * Regra do documento: quem projeta publica; quem executa, orça e contrata
 * consulta e recebe. Publicar uma orientação é ação restrita.
 *
 * O `resumo` de cada papel é documentação viva — nenhuma tela o exibe hoje.
 * ══════════════════════════════════════════════════════════════════════ */

export const PAPEIS = {
  ENGENHARIA: {
    rotulo: 'Engenharia',
    resumo: 'Projeta e acompanha a execução na obra',
    publica: true,
    aprova: false,
  },
  ARQUITETURA: {
    rotulo: 'Arquitetura',
    resumo: 'Projeta e detalha',
    publica: true,
    aprova: false,
  },
  ORCAMENTO: {
    rotulo: 'Orçamento',
    resumo: 'Orça com base nas informações atuais',
    publica: false,
    aprova: false,
  },
  COORDENACAO: {
    rotulo: 'Coordenação de contratos',
    resumo: 'Cadastra obras, publica e aprova alterações grandes',
    publica: true,
    aprova: true,
  },
  DIRECAO: {
    rotulo: 'Direção',
    resumo: 'Acompanha tudo, publica e aprova alterações grandes',
    publica: true,
    aprova: true,
  },
  ESTAGIO_ARQUITETURA: {
    rotulo: 'Estágio — Arquitetura',
    resumo: 'Apoia os projetos; consulta e recebe avisos',
    publica: false,
    aprova: false,
  },
};

/* Não existe papel de TI aqui de propósito. Quem mantém o sistema faz isso
 * por fora (servidor, banco, código) e não participa dos projetos — logo,
 * não deve receber aviso de orientação nem ocupar uma linha na lista de quem
 * precisa confirmar ciência. */

export function rotuloDoPapel(papel) {
  return PAPEIS[papel]?.rotulo ?? papel;
}

/**
 * R9 — quem publica orientação: engenharia, arquitetura, coordenação e direção.
 *
 * A coordenação entrou em 06/08/2026, a pedido dela: publica andamento e
 * também orientações em mudanças grandes. Como ela também aprova, existe uma
 * trava separada em `aprovacao.js` — ninguém aprova a própria orientação,
 * senão o aval vira formalidade.
 *
 * Fica de fora quem só consulta: orçamento e estágio.
 */
export function podePublicar(usuario) {
  return Boolean(usuario && PAPEIS[usuario.papel]?.publica);
}

/**
 * R17 (pedido pela direção) — mudança que altera orçamento ou prazo pede o
 * aval do CEO ou da Coordenadora de contratos.
 *
 * Desde 13/08/2026 o aval é registro, não portão: a orientação já vale e a
 * atividade já corre. "Grande" é a resposta de quem publica à pergunta
 * única "muda orçamento ou prazo?" — a flag `muda_orcamento_ou_prazo`
 * gravada na publicação. A fila e as rotas (`src/api/orientacoes.js`)
 * aplicam esta regra via `ehAprovador` de `aprovacao.js`, onde também
 * mora a trava "ninguém aprova a própria".
 */
export function podeAprovar(usuario) {
  return Boolean(usuario && PAPEIS[usuario.papel]?.aprova);
}

/**
 * R19 — cadastrar projeto e definir quem trabalha nele é da coordenação.
 *
 * A direção entra junto porque é quem responde pela empresa; se ficar só com a
 * coordenação, o sistema para quando a Thayna estiver de férias.
 * Decisão minha — ver PENDENCIAS.md.
 */
export function podeCadastrarProjeto(usuario) {
  return podeAprovar(usuario);
}

/* Registrar andamento não tem função aqui de propósito: qualquer pessoa da
 * equipe pode fazer, e a restrição de equipe é do R19, aplicada nas guardas
 * da API. Uma função que sempre devolve verdadeiro dá a impressão de que
 * existe uma regra onde não existe. */
