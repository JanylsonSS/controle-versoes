/* A agenda do calendário semanal: cada um marca para si; a coordenação
 * marca para os outros e o compromisso cai direto na agenda da pessoa. */

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

secao('3. Marcar para os outros é da coordenação');
r = await api('POST', '/api/agenda', COMO.alvaro, {
  tipo: 'REUNIAO', dia: hoje(), descricao: 'x', participante_id: COMO.luiza,
});
ok('engenharia não marca para colega', r.status === 403);
r = await api('POST', '/api/agenda', COMO.thayna, {
  tipo: 'REUNIAO', dia: hoje(), hora: '11:00',
  descricao: 'Alinhamento da rampa com a arquitetura. Projeto PAV-001.',
  participante_id: COMO.luiza,
});
ok('coordenação marca', r.status === 200);
const marcadoId = r.dados.id;
r = await api('GET', '/api/agenda', COMO.luiza);
ok('cai direto no calendário da Luiza',
   r.dados.compromissos.some((c) => c.id === marcadoId));
r = await api('GET', '/api/notificacoes', COMO.luiza);
ok('e nas notificações dela, dizendo quem marcou',
   r.dados.marcados_para_voce.some((c) => c.id === marcadoId && c.criador_nome === 'Thayna Weydne'));

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
