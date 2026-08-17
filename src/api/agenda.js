/* ══════════════════════════════════════════════════════════════════════
 * AGENDA: o calendário semanal da tela inicial.
 *
 * Cada um marca reunião ou visita técnica para si. A coordenação e a
 * direção marcam para qualquer pessoa — e o compromisso aparece direto
 * no calendário de quem foi marcado.
 * ══════════════════════════════════════════════════════════════════════ */

import { agenda, usuarios } from '../persistencia/repositorio.js';
import { podeCadastrarProjeto } from '../regras/papeis.js';
import { ErroApi, exigir, texto, textoOpcional, dia } from './http.js';
import { compromissoAcessivel } from './guardas.js';

const TIPOS = new Set(['REUNIAO', 'VISITA_TECNICA']);

/** Segunda-feira da semana que contém `referencia` (YYYY-MM-DD). */
function segundaDaSemana(referencia) {
  const d = new Date(`${referencia}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d;
}

const somaDias = (data, n) => {
  const d = new Date(data);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

export const rotasDeAgenda = [
  /* A semana de alguém. Sem parâmetros: a minha, na semana de hoje.
   * `?semana=YYYY-MM-DD` navega; `?pessoa=id` é só para a coordenação. */
  ['GET', '/api/agenda', ({ usuario, url }) => {
    const referencia = url.searchParams.get('semana') || new Date().toISOString().slice(0, 10);
    // Validar o calendário, não só a forma: "2026-02-30" passa no regex,
    // vira Invalid Date, e toISOString() explodiria em 500 mais adiante.
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(referencia);
    const valida = m && new Date(`${referencia}T00:00:00Z`).getUTCDate() === Number(m[3]);
    if (!valida) throw new ErroApi(400, 'A semana precisa ser uma data AAAA-MM-DD que exista.');

    let pessoaId = usuario.id;
    const pedida = url.searchParams.get('pessoa');
    if (pedida && Number(pedida) !== usuario.id) {
      exigir(podeCadastrarProjeto(usuario), 403,
        'Ver a agenda dos outros é da coordenação e da direção.');
      exigir(usuarios.porId(Number(pedida)), 404, 'Essa pessoa não existe.');
      pessoaId = Number(pedida);
    }

    const segunda = segundaDaSemana(referencia);
    const de = segunda.toISOString().slice(0, 10);
    const ate = somaDias(segunda, 6);
    return {
      de,
      ate,
      dias: Array.from({ length: 7 }, (_, i) => somaDias(segunda, i)),
      compromissos: agenda.daSemana(pessoaId, de, ate),
    };
  }],

  ['POST', '/api/agenda', ({ usuario, corpo }) => {
    const tipo = texto(corpo, 'tipo', 'Diga se é reunião ou visita técnica.');
    exigir(TIPOS.has(tipo), 400, 'O tipo precisa ser REUNIAO ou VISITA_TECNICA.');

    const hora = textoOpcional(corpo, 'hora');
    if (hora) exigir(/^([01]\d|2[0-3]):[0-5]\d$/.test(hora), 400, 'A hora precisa ser HH:MM.');

    // Marcar para outra pessoa é privilégio da coordenação e da direção.
    let participanteId = usuario.id;
    if (corpo.participante_id != null && Number(corpo.participante_id) !== usuario.id) {
      exigir(podeCadastrarProjeto(usuario), 403,
        'Marcar compromisso para outra pessoa é da coordenação e da direção.');
      exigir(usuarios.porId(Number(corpo.participante_id)), 400, 'Essa pessoa não existe.');
      participanteId = Number(corpo.participante_id);
    }

    const id = agenda.criar({
      tipo,
      dia: dia(corpo, 'dia', 'Informe o dia do compromisso (AAAA-MM-DD).'),
      hora,
      descricao: texto(corpo, 'descricao',
        'Descreva o compromisso: com quem é e de qual projeto.'),
      participanteId,
      criadaPor: usuario.id,
    });
    return { id };
  }],

  ['DELETE', '/api/agenda/:id', ({ usuario, params }) => {
    const compromisso = compromissoAcessivel(usuario, params.id);
    agenda.excluir(compromisso.id);
    return { ok: true };
  }],
];
