/* ══════════════════════════════════════════════════════════════════════
 * R18 — MODELO DO E-MAIL DE AVISO
 *
 * ⚠️ O ENVIO AINDA NÃO EXISTE. Este arquivo guarda o texto aprovado pela
 *   coordenação (estrutura de 06/08/2026, adaptada ao modelo de
 *   orientações no pivô de 13/08/2026), para que ele não se perca e para
 *   que, quando o envio for construído, não seja preciso reescrever nada.
 *
 * Conta remetente definida: engenharia.promav@gmail.com
 * ══════════════════════════════════════════════════════════════════════ */

export const REMETENTE = 'engenharia.promav@gmail.com';

/**
 * Monta o e-mail de uma orientação para um destinatário.
 *
 * @param {{
 *   projeto: { nome: string },
 *   orientacao: {
 *     titulo: string, descricao: string, data_da_mudanca: string,
 *     autor_nome: string, responsavel_nome?: string | null,
 *   },
 *   destinatario: { nome: string },
 *   endereco?: string,
 * }} dados
 * @returns {{ assunto: string, corpo: string }}
 */
export function montarEmail({ projeto, orientacao, destinatario, endereco }) {
  const assunto = `Atualização de Escopo / Alteração no Projeto ${projeto.nome}`;

  const [ano, mes, dia] = String(orientacao.data_da_mudanca).slice(0, 10).split('-');
  const linhas = [
    `Prezado(a) ${destinatario.nome},`,
    '',
    'Comunicado do sistema: uma atualização importante foi necessária no',
    `andamento do projeto ${projeto.nome}. Segue a mudança:`,
    '',
    `${orientacao.titulo} — em ${dia}/${mes}/${ano}`,
    '',
    orientacao.descricao,
    '',
    `Publicada por ${orientacao.autor_nome}.`,
  ];

  if (orientacao.responsavel_nome) {
    linhas.push(`Quem executa: ${orientacao.responsavel_nome}.`);
  }

  linhas.push('', 'Confirme no sistema que você viu esta mudança — fica',
    'registrado quem soube e quando.');

  if (endereco) {
    linhas.push('', `Abrir no sistema: ${endereco}`);
  }

  return { assunto, corpo: linhas.join('\n') };
}
