/* ══════════════════════════════════════════════════════════════════════
 * R9 — PAPÉIS E PERMISSÕES POR ÁREA
 *
 * Regra do documento: quem projeta publica; quem executa, orça e contrata
 * consulta e recebe. Publicar uma versão vigente é ação restrita.
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
    resumo: 'Projeta e revisa',
    publica: true,
    aprova: false,
  },
  ORCAMENTO: {
    rotulo: 'Orçamento',
    resumo: 'Orça sobre a versão vigente',
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
 * não deve receber aviso de revisão nem ocupar uma linha na lista de quem
 * precisa confirmar ciência. */

export function rotuloDoPapel(papel) {
  return PAPEIS[papel]?.rotulo ?? papel;
}

/**
 * R9 — quem publica revisão: engenharia, arquitetura, coordenação e direção.
 *
 * A coordenação entrou em 06/08/2026, a pedido dela: publica registro de
 * andamento e também revisão técnica em mudança grande. Como ela também
 * aprova, existe uma trava separada em `aprovacao.js` — ninguém aprova a
 * própria revisão, senão a aprovação vira formalidade.
 *
 * Fica de fora quem só consulta: orçamento e estágio.
 */
export function podePublicar(usuario) {
  return Boolean(usuario && PAPEIS[usuario.papel]?.publica);
}

/**
 * R4 — cancelar uma revisão é tão sério quanto publicar: mesma restrição.
 */
export function podeCancelar(usuario) {
  return podePublicar(usuario);
}

/**
 * R17 (novo, pedido pela direção) — alteração grande só vale depois do aval
 * do CEO ou da Coordenadora de contratos.
 *
 * ATENÇÃO: hoje isto só declara QUEM aprova. O fluxo de aprovação ainda não
 * foi construído — falta definir o que conta como "alteração grande".
 * Ver PENDENCIAS.md, seção "Requisitos novos".
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

/* Registrar andamento e registrar incidente não têm função aqui de
 * propósito: qualquer pessoa da equipe pode fazer os dois, e a restrição
 * de equipe é do R19, aplicada no roteador. Uma função que sempre devolve
 * verdadeiro dá a impressão de que existe uma regra onde não existe. */
