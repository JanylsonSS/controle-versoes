/* ══════════════════════════════════════════════════════════════════════
 * R18 — MODELO DO E-MAIL DE AVISO
 *
 * ⚠️ O ENVIO AINDA NÃO EXISTE. Este arquivo guarda apenas o texto
 *   aprovado pela coordenação em 06/08/2026, para que ele não se perca
 *   num documento e para que, quando o envio for construído, não seja
 *   preciso reescrever nada.
 *
 *   A tela "Ver o e-mail que sairia" na página da revisão mostra o
 *   resultado deste modelo — assim dá para conferir o texto com a equipe
 *   antes de ligar o envio de verdade.
 *
 * Conta remetente definida: engenharia.promav@gmail.com
 * ══════════════════════════════════════════════════════════════════════ */

export const REMETENTE = 'engenharia.promav@gmail.com';

/**
 * @param {{projeto:object, revisao:object, destinatario:object, anterior?:object, endereco?:string}} dados
 * @returns {{assunto:string, corpo:string}}
 */
export function montarEmail({ projeto, revisao, destinatario, anterior, endereco }) {
  const assunto = `Atualização de Escopo / Alteração no Projeto ${projeto.nome}`;

  const linhas = [
    `Prezado(a) ${destinatario.nome},`,
    '',
    'Comunicado do sistema: uma atualização importante foi necessária no',
    `andamento do projeto ${projeto.nome}. Seguem as mudanças:`,
    '',
    `Revisão que passa a valer: ${revisao.codigo}` + (anterior ? ` (substitui a ${anterior.codigo})` : ''),
    '',
    'O que mudou:',
    revisao.o_que_mudou,
    '',
    `Publicada por ${revisao.autor_nome}.`,
    '',
    'Confirme no sistema que você viu esta mudança. Enquanto não confirmar,',
    'o arquivo desta revisão fica bloqueado para você.',
  ];

  if (endereco) {
    linhas.push('', `Abrir no sistema: ${endereco}`);
  }

  return { assunto, corpo: linhas.join('\n') };
}
