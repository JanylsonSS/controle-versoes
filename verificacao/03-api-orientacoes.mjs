/* Orientações: publicar cria atividade e avisa; editar reabre a ciência;
 * a aprovação registra sem segurar; o histórico serve de comparação. */

import { COMO, ok, secao, encerrar, api } from './ajuda.mjs';

secao('1. A atual e o histórico (o dropdown)');
let r = await api('GET', '/api/projetos/1', COMO.alvaro);
ok('a atual da pavimentação é a da calçada',
   r.dados.orientacao_atual.titulo.includes('Remoção da calçada'));
ok('o total de orientações vem junto', r.dados.total_orientacoes === 3);
r = await api('GET', '/api/projetos/1/orientacoes', COMO.alvaro);
ok('o histórico tem as 3, mais recente primeiro',
   r.dados.orientacoes.length === 3 &&
   r.dados.orientacoes[0].titulo.includes('calçada') &&
   r.dados.orientacoes[2].titulo.includes('drenagem'));
r = await api('GET', '/api/projetos/2/orientacoes', COMO.alvaro);
ok('o histórico também respeita o R19', r.status === 403);

secao('2. A ciência de uma orientação');
const calcadaId = (await api('GET', '/api/projetos/1', COMO.alvaro)).dados.orientacao_atual.id;
r = await api('GET', `/api/orientacoes/${calcadaId}`, COMO.alvaro);
ok('quem confirmou aparece com data',
   r.dados.ciencia.filter((c) => c.confirmado_em).length === 3);
ok('quem falta aparece marcado como atrasado',
   r.dados.ciencia.filter((c) => !c.confirmado_em && c.atrasado).length === 2);
ok('o Álvaro sabe que a dele está pendente', r.dados.minha_confirmacao_pendente === true);

r = await api('POST', `/api/orientacoes/${calcadaId}/confirmar`, COMO.alvaro, {});
ok('confirmar registra', r.status === 200);
r = await api('GET', `/api/orientacoes/${calcadaId}`, COMO.alvaro);
ok('e a pendência some', r.dados.minha_confirmacao_pendente === false);
r = await api('POST', `/api/orientacoes/${calcadaId}/confirmar`, COMO.thayna, {});
ok('quem publicou não tem o que confirmar', r.status === 400);

secao('3. Publicar: um ato, três efeitos');
r = await api('POST', '/api/projetos/1/orientacoes', COMO.micael, {
  titulo: 'x', descricao: 'x', data_da_mudanca: '2026-08-14',
});
ok('orçamento não publica', r.status === 403);
r = await api('POST', '/api/projetos/1/orientacoes', COMO.lya, {
  titulo: 'Rampa de acessibilidade na esquina sul',
  descricao: 'Acrescentar rampa conforme NBR 9050, com guia rebaixada.',
  data_da_mudanca: '2026-08-14',
  responsavel_id: COMO.luiza,
});
ok('arquitetura publica', r.status === 200);
const rampaId = r.dados.id;
ok('a atividade nasceu junto', Number.isInteger(r.dados.atividade_id));

r = await api('GET', '/api/projetos/1/atividades', COMO.alvaro);
const atividadeDaRampa = r.dados.atividades.find((a) => a.orientacao_id === rampaId);
ok('ela está no quadro, ligada à orientação', Boolean(atividadeDaRampa));
ok('em "não iniciado", com a Luiza', atividadeDaRampa.situacao === 'NAO_INICIADO' &&
   atividadeDaRampa.responsavel_nome === 'Luiza Elisa');

r = await api('GET', '/api/notificacoes', COMO.luiza);
ok('a Luiza foi avisada', r.dados.avisos_pendentes.some((a) => a.orientacao_id === rampaId));
r = await api('GET', '/api/notificacoes', COMO.vanessa);
ok('quem não é da equipe não foi', !r.dados.avisos_pendentes.some((a) => a.orientacao_id === rampaId));

r = await api('POST', '/api/projetos/1/orientacoes', COMO.lya, {
  titulo: 'Sem data', descricao: 'x', data_da_mudanca: '30/02/2026',
});
ok('data fora do formato é recusada', r.status === 400);
r = await api('POST', '/api/projetos/1/orientacoes', COMO.lya, {
  titulo: 'Responsável de fora', descricao: 'x', data_da_mudanca: '2026-08-14',
  responsavel_id: COMO.vanessa,
});
ok('responsável fora da equipe é recusado', r.status === 400);

secao('3b. R15 — de onde a mudança veio');
r = await api('POST', '/api/projetos/1/orientacoes', COMO.lya, {
  titulo: 'Guia rebaixada também na esquina norte',
  descricao: 'Replicar o detalhe da rampa sul na esquina norte.',
  origem: 'Pedido do cliente na reunião de 14/08',
  data_da_mudanca: '2026-08-14',
});
const comOrigemId = r.dados.id;
r = await api('GET', `/api/orientacoes/${comOrigemId}`, COMO.alvaro);
ok('a origem gravada volta na leitura',
   r.dados.orientacao.origem === 'Pedido do cliente na reunião de 14/08');
r = await api('GET', `/api/orientacoes/${rampaId}`, COMO.alvaro);
ok('sem origem informada fica nulo — o campo é opcional',
   r.dados.orientacao.origem === null);
r = await api('PUT', `/api/orientacoes/${comOrigemId}`, COMO.lya, {
  titulo: 'Guia rebaixada também na esquina norte',
  descricao: 'Replicar o detalhe da rampa sul na esquina norte.',
  origem: 'Ofício 42/2026 da prefeitura',
  data_da_mudanca: '2026-08-14',
});
r = await api('GET', `/api/orientacoes/${comOrigemId}`, COMO.alvaro);
ok('editar troca a origem', r.dados.orientacao.origem === 'Ofício 42/2026 da prefeitura');

secao('4. Editar reabre a ciência de todos');
await api('POST', `/api/orientacoes/${rampaId}/confirmar`, COMO.luiza, {});
r = await api('GET', `/api/orientacoes/${rampaId}`, COMO.luiza);
ok('a Luiza tinha confirmado', r.dados.minha_confirmacao_pendente === false);
r = await api('PUT', `/api/orientacoes/${rampaId}`, COMO.lya, {
  titulo: 'Rampa de acessibilidade nas DUAS esquinas',
  descricao: 'Agora nas esquinas sul e norte, conforme pedido do cliente em reunião.',
  data_da_mudanca: '2026-08-14',
  responsavel_id: COMO.luiza,
});
ok('edição salva', r.status === 200);
r = await api('GET', `/api/orientacoes/${rampaId}`, COMO.luiza);
ok('a confirmação dela reabriu', r.dados.minha_confirmacao_pendente === true);
ok('ficou registrado quem editou', Boolean(r.dados.orientacao.editada_em));
r = await api('GET', '/api/projetos/1/atividades', COMO.alvaro);
ok('a atividade acompanhou o título novo',
   r.dados.atividades.some((a) => a.orientacao_id === rampaId && a.nome.includes('DUAS')));

secao('5. Aprovação: registro, não portão');
r = await api('GET', '/api/aprovacoes', COMO.alvaro);
ok('a fila é só de quem aprova', r.status === 403);
r = await api('GET', '/api/aprovacoes', COMO.matheus);
ok('a do porcelanato espera aval', r.dados.esperando.some((o) => o.titulo.includes('porcelanato')));
const porcelanato = r.dados.esperando.find((o) => o.titulo.includes('porcelanato'));

r = await api('GET', '/api/projetos/2', COMO.thayna);
ok('mesmo sem aval, ela já é a atual da Câmara',
   r.dados.orientacao_atual.id === porcelanato.id);
r = await api('GET', '/api/projetos/2/atividades', COMO.thayna);
ok('e a atividade já existe', r.dados.atividades.some((a) => a.orientacao_id === porcelanato.id));

r = await api('POST', `/api/orientacoes/${porcelanato.id}/aprovar`, COMO.vanessa, {});
ok('quem publicou não aprova a própria', r.status === 403);
r = await api('POST', `/api/orientacoes/${porcelanato.id}/aprovar`, COMO.matheus, {});
ok('o CEO aprova', r.status === 200);
r = await api('GET', '/api/aprovacoes', COMO.matheus);
ok('sai da fila', !r.dados.esperando.some((o) => o.id === porcelanato.id));
r = await api('POST', `/api/orientacoes/${rampaId}/aprovar`, COMO.matheus, {});
ok('orientação comum não pede aval', r.status === 400);

r = await api('POST', '/api/projetos/1/orientacoes', COMO.thayna, {
  titulo: 'Aditivo do trecho refeito', descricao: 'Formalizar o aditivo do trecho leste.',
  data_da_mudanca: '2026-08-14', muda_orcamento_ou_prazo: true,
});
const aditivoId = r.dados.id;
r = await api('POST', `/api/orientacoes/${aditivoId}/reprovar`, COMO.matheus, {});
ok('negar sem motivo é recusado', r.status === 400);
r = await api('POST', `/api/orientacoes/${aditivoId}/reprovar`, COMO.matheus,
  { motivo: 'Precisa do de acordo da prefeitura antes.' });
ok('negar com motivo registra', r.status === 200);
r = await api('GET', `/api/orientacoes/${aditivoId}`, COMO.thayna);
ok('o motivo fica na orientação',
   r.dados.orientacao.motivo_reprovacao.includes('de acordo'));

encerrar();
