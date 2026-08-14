/* Sessão, permissões expostas ao frontend e o agregado de notificações
 * da tela inicial. */

import { COMO, ok, secao, encerrar, api, BASE } from './ajuda.mjs';

secao('1. Sessão: quem sou eu e o que posso');
let r = await api('GET', '/api/sessao', COMO.alvaro);
ok('responde 200 em JSON', r.status === 200 && typeof r.dados === 'object');
ok('a aplicação se apresenta', r.dados.aplicacao.nome === 'Promav');
ok('sou o Álvaro', r.dados.usuario.nome === 'Álvaro Abrantes');
ok('engenharia publica mas não aprova nem cadastra',
   r.dados.pode.publicar && !r.dados.pode.aprovar && !r.dados.pode.cadastrar_projeto);
ok('as 8 pessoas vêm para os seletores', r.dados.pessoas.length === 8);

r = await api('GET', '/api/sessao', COMO.thayna);
ok('coordenação pode tudo', Object.values(r.dados.pode).every(Boolean));
r = await api('GET', '/api/sessao', COMO.micael);
ok('orçamento só consulta', Object.values(r.dados.pode).every((v) => v === false));

secao('2. Trocar o "entrando como"');
const resposta = await fetch(`${BASE}/api/sessao`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ usuario_id: COMO.lya }),
});
ok('troca aceita', resposta.status === 200);
const cookie = resposta.headers.get('set-cookie') ?? '';
ok('o cookie é HttpOnly + SameSite=Lax', cookie.includes('HttpOnly') && cookie.includes('SameSite=Lax'));
r = await api('POST', '/api/sessao', COMO.alvaro, { usuario_id: 999 });
ok('pessoa inexistente é recusada', r.status === 400);

secao('3. A API recusa o que não é JSON');
const semJson = await fetch(`${BASE}/api/sessao`, {
  method: 'POST',
  headers: { cookie: 'usuario_id=1', 'content-type': 'application/x-www-form-urlencoded' },
  body: 'usuario_id=3',
});
ok('form-urlencoded leva 415 (defesa contra CSRF)', semJson.status === 415);
const quebrado = await fetch(`${BASE}/api/sessao`, {
  method: 'POST',
  headers: { cookie: 'usuario_id=1', 'content-type': 'application/json' },
  body: '{quebrado',
});
ok('JSON inválido leva 400', quebrado.status === 400);
r = await api('GET', '/api/nao-existe', COMO.alvaro);
ok('rota desconhecida leva 404 em JSON', r.status === 404 && Boolean(r.dados.erro));

// Percent-encoding inválido já DERRUBOU o processo uma vez. A resposta
// certa é 400 — e o servidor precisa continuar de pé depois.
const malformada = await fetch(`${BASE}/api/%E0%A4%A`);
ok('URL malformada leva 400 em vez de matar o servidor', malformada.status === 400);
const aindaVivo = await api('GET', '/api/sessao', COMO.alvaro);
ok('e o servidor segue vivo', aindaVivo.status === 200);

secao('4. Notificações da tela inicial');
r = await api('GET', '/api/notificacoes', COMO.alvaro);
ok('mudanças que o Álvaro não confirmou', r.dados.avisos_pendentes.length === 2,
   r.dados.avisos_pendentes.map((a) => a.orientacao_titulo).join(' | '));
ok('a da calçada está entre elas e atrasada',
   r.dados.avisos_pendentes.some((a) => a.orientacao_titulo.includes('calçada') && a.atrasado));
ok('a reunião marcada pela Thayna aparece', r.dados.marcados_para_voce.length === 1,
   r.dados.marcados_para_voce.map((c) => c.descricao).join(' | '));
ok('e diz quem marcou', r.dados.marcados_para_voce[0].criador_nome === 'Thayna Weydne');
ok('as atividades em que ele foi marcado', r.dados.suas_atividades.length >= 1);
ok('nada finalizado no meio delas',
   r.dados.suas_atividades.every((a) => a.situacao !== 'FINALIZADO'));

r = await api('GET', '/api/notificacoes', COMO.matheus);
ok('a orientação que espera aval também avisou na hora (aprovação não é portão)',
   r.dados.avisos_pendentes.length === 1 &&
   r.dados.avisos_pendentes[0].orientacao_titulo.includes('porcelanato'));

encerrar();
