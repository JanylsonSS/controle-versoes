/* A agenda do calendário semanal. Desde 17/08 todos marcam, para uma ou
 * várias pessoas — e quando ninguém da coordenação participa, ela é
 * incluída automaticamente, para ficar ciente. */

import { COMO, ok, secao, encerrar, api } from './ajuda.mjs';

const hoje = () => new Date().toISOString().slice(0, 10);

secao('1. A minha semana');
let r = await api('GET', '/api/agenda', COMO.alvaro);
ok('a semana vem com 7 dias', r.dados.dias.length === 7);
ok('começa numa segunda',
   new Date(`${r.dados.de}T00:00:00Z`).getUTCDay() === 1, r.dados.de);
ok('os compromissos do Álvaro estão nela', r.dados.compromissos.length === 2,
   r.dados.compromissos.map((c) => `${c.tipo} ${c.dia}`).join(' | '));
ok('cada um diz quem marcou', r.dados.compromissos.every((c) => c.criador_nome));

r = await api('GET', '/api/agenda?semana=2030-01-02', COMO.alvaro);
ok('navegar para outra semana devolve vazio', r.dados.compromissos.length === 0);
r = await api('GET', '/api/agenda?semana=meia-noite', COMO.alvaro);
ok('semana torta é recusada', r.status === 400);
r = await api('GET', '/api/agenda?semana=2026-02-30', COMO.alvaro);
ok('30 de fevereiro é 400, não 500', r.status === 400);

secao('2. Marcar para mim');
r = await api('POST', '/api/agenda', COMO.alvaro, {
  tipo: 'VISITA_TECNICA', dia: hoje(), hora: '16:00',
  descricao: 'Conferência do meio-fio com o mestre de obras. Projeto PAV-001.',
});
ok('marcado', r.status === 200);
r = await api('GET', '/api/agenda', COMO.alvaro);
ok('aparece na semana', r.dados.compromissos.some((c) => c.descricao.includes('mestre de obras')));

r = await api('POST', '/api/agenda', COMO.alvaro,
  { tipo: 'CHURRASCO', dia: hoje(), descricao: 'x' });
ok('tipo inventado é recusado', r.status === 400);
r = await api('POST', '/api/agenda', COMO.alvaro,
  { tipo: 'REUNIAO', dia: hoje(), hora: '25:99', descricao: 'x' });
ok('hora impossível é recusada', r.status === 400);
r = await api('POST', '/api/agenda', COMO.alvaro,
  { tipo: 'REUNIAO', dia: '2026-02-30', descricao: 'x' });
ok('30 de fevereiro é recusado', r.status === 400);

secao('3. Todos marcam, para várias pessoas — e a coordenação fica sabendo');
r = await api('POST', '/api/agenda', COMO.alvaro, {
  tipo: 'REUNIAO', dia: hoje(), hora: '11:00',
  descricao: 'Alinhamento da rampa com a arquitetura. Projeto PAV-001.',
  participante_ids: [COMO.alvaro, COMO.luiza],
});
ok('engenharia marca para si E para a colega',
   r.status === 200 && Array.isArray(r.dados.ids));
ok('a coordenação ganhou a linha automática (2 participantes + 1 de ciência)',
   r.dados.ids.length === 3, `ids: ${r.dados.ids?.join(', ')}`);
r = await api('GET', '/api/agenda', COMO.luiza);
ok('cai direto no calendário da Luiza',
   r.dados.compromissos.some((c) => c.descricao.includes('Alinhamento da rampa')));
r = await api('GET', '/api/notificacoes', COMO.luiza);
ok('e nas notificações dela, dizendo quem marcou',
   r.dados.marcados_para_voce.some(
     (c) => c.descricao.includes('Alinhamento da rampa') && c.criador_nome === 'Álvaro Abrantes'));

r = await api('GET', '/api/agenda', COMO.thayna);
const automatica = r.dados.compromissos.find((c) => c.descricao.includes('Alinhamento da rampa'));
ok('a coordenação vê o compromisso no PRÓPRIO calendário, marcado como automático',
   Boolean(automatica) && automatica.incluido_automaticamente === 1);
r = await api('GET', '/api/notificacoes', COMO.thayna);
ok('e é alertada nas notificações, sabendo quem marcou',
   r.dados.marcados_para_voce.some(
     (c) => c.descricao.includes('Alinhamento da rampa') && c.criador_nome === 'Álvaro Abrantes'));

r = await api('POST', '/api/agenda', COMO.alvaro, {
  tipo: 'REUNIAO', dia: hoje(), hora: '14:00',
  descricao: 'Reunião de orçamento com a própria coordenação. Projeto PAV-001.',
  participante_ids: [COMO.alvaro, COMO.thayna],
});
ok('com a coordenação entre os participantes, nada de linha extra',
   r.dados.ids.length === 2);
r = await api('POST', '/api/agenda', COMO.thayna, {
  tipo: 'REUNIAO', dia: hoje(), hora: '15:00',
  descricao: 'Marcada pela coordenação para a Luiza. Projeto PAV-001.',
  participante_ids: [COMO.luiza],
});
ok('a coordenação marcando também não duplica', r.dados.ids.length === 1);
const marcadoId = r.dados.ids[0];
r = await api('POST', '/api/agenda', COMO.alvaro, {
  tipo: 'REUNIAO', dia: hoje(), descricao: 'x', participante_ids: [999],
});
ok('participante inexistente é recusado', r.status === 400);

secao('4. Ver a agenda dos outros');
r = await api('GET', `/api/agenda?pessoa=${COMO.luiza}`, COMO.alvaro);
ok('colega não espia agenda de colega', r.status === 403);
r = await api('GET', `/api/agenda?pessoa=${COMO.luiza}`, COMO.thayna);
ok('a coordenação vê (é ela que marca)', r.status === 200 &&
   r.dados.compromissos.some((c) => c.id === marcadoId));

secao('5. Desmarcar');
r = await api('DELETE', `/api/agenda/${marcadoId}`, COMO.alvaro);
ok('quem não tem relação não desmarca', r.status === 403);
r = await api('DELETE', `/api/agenda/${marcadoId}`, COMO.luiza);
ok('a pessoa marcada desmarca', r.status === 200);
r = await api('DELETE', `/api/agenda/${marcadoId}`, COMO.luiza);
ok('desmarcar de novo é 404', r.status === 404);

encerrar();
