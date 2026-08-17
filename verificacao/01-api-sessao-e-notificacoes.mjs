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
ok('cada pessoa diz se aprova (o seletor confirma antes de virar quem manda)',
   r.dados.pessoas.filter((p) => p.aprova).length === 2);

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
ok('o cookie é de sessão (fechar o navegador desfaz o "entrar como")',
   !cookie.includes('Max-Age') && !cookie.includes('Expires'));
r = await api('POST', '/api/sessao', COMO.alvaro, { usuario_id: 999 });
ok('pessoa inexistente é recusada', r.status === 400);

// O rastro da troca, lido direto no banco (conexão só-leitura; o WAL
// permite ler com o servidor no ar — é o mesmo truque do backup).
{
  const { DatabaseSync } = await import('node:sqlite');
  const { CAMINHO_BANCO } = await import('../src/config.js');
  const lerUltimaTroca = () => {
    let leitura;
    try { leitura = new DatabaseSync(CAMINHO_BANCO, { readOnly: true }); }
    catch { leitura = new DatabaseSync(CAMINHO_BANCO); }
    const troca = leitura.prepare('SELECT * FROM trocas_de_sessao ORDER BY id DESC LIMIT 1').get();
    leitura.close();
    return troca;
  };

  // O POST lá de cima veio SEM cookie: o rastro não pode inventar que o
  // Álvaro (fallback) trocou — "de" fica nulo, que é a verdade.
  let troca = lerUltimaTroca();
  ok('troca sem cookie registra "de" nulo (não culpa o fallback)',
     Boolean(troca) && troca.de_usuario_id === null && troca.para_usuario_id === COMO.lya);
  ok('com o endereço de onde veio', typeof troca?.ip === 'string' && troca.ip.length > 0);

  // Com cookie assinado, o "de" é quem a requisição prova ser.
  await api('POST', '/api/sessao', COMO.alvaro, { usuario_id: COMO.vanessa });
  troca = lerUltimaTroca();
  ok('troca com cookie válido registra quem era → quem virou',
     Boolean(troca) && troca.de_usuario_id === COMO.alvaro && troca.para_usuario_id === COMO.vanessa);
}

secao('2b. O cookie não se forja');
{
  const forjado = await fetch(`${BASE}/api/sessao`, {
    headers: { cookie: 'usuario_id=8' }, // "quero ser a direção", sem assinatura
  });
  const dados = await forjado.json();
  ok('id em texto puro NÃO vira a direção — cai no padrão (Álvaro)',
     dados.usuario.nome === 'Álvaro Abrantes');
  const rabiscado = await fetch(`${BASE}/api/sessao`, {
    headers: { cookie: 'usuario_id=8.0000000000000000000000000000000000' },
  });
  ok('assinatura errada também não', (await rabiscado.json()).usuario.nome === 'Álvaro Abrantes');
}

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
