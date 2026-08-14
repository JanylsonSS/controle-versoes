/* O quadro por JSON: mover com datas automáticas, permissões, e o
 * registro de andamento. */

import { COMO, ok, secao, encerrar, api } from './ajuda.mjs';

secao('1. O quadro do projeto');
let r = await api('GET', '/api/projetos/1/atividades', COMO.alvaro);
ok('as colunas vêm na ordem, com rótulo pronto',
   r.dados.colunas.map((c) => c.codigo).join(',') === 'NAO_INICIADO,EM_EXECUCAO,REVISAO,FINALIZADO' &&
   r.dados.colunas[1].rotulo === 'Em execução');
ok('as atividades do seed estão lá', r.dados.atividades.length >= 4);
ok('as que vieram de orientação carregam o vínculo',
   r.dados.atividades.filter((a) => a.orientacao_id).length >= 3);
ok('cada cartão diz se posso apagá-lo',
   r.dados.atividades.every((a) => typeof a.pode_excluir === 'boolean'));
r = await api('GET', '/api/projetos/2/atividades', COMO.alvaro);
ok('o quadro respeita o R19', r.status === 403);

secao('2. Criar, mover, e as datas são do sistema');
r = await api('POST', '/api/projetos/1/atividades', COMO.alvaro, {
  nome: 'Conferir greide após a rampa', responsavel_id: COMO.luiza,
  descricao: 'Refazer a conferência depois que a rampa entrar.',
});
ok('atividade criada', r.status === 200);
const id = r.dados.id;
let atividade = (await api('GET', '/api/projetos/1/atividades', COMO.alvaro))
  .dados.atividades.find((a) => a.id === id);
ok('nasce sem data de início', atividade.iniciada_em === null);

r = await api('POST', `/api/atividades/${id}/mover`, COMO.alvaro,
  { situacao: 'EM_EXECUCAO', posicao: 0 });
ok('mover devolve a atividade atualizada', r.status === 200 &&
   r.dados.atividade.situacao === 'EM_EXECUCAO');
ok('entrar em execução carimbou o início', Boolean(r.dados.atividade.iniciada_em));

r = await api('POST', `/api/atividades/${id}/mover`, COMO.alvaro,
  { situacao: 'FINALIZADO', posicao: 0 });
ok('finalizar carimbou o fim', Boolean(r.dados.atividade.finalizada_em));
r = await api('POST', `/api/atividades/${id}/mover`, COMO.alvaro,
  { situacao: 'REVISAO', posicao: 0 });
ok('sair de finalizado apaga o fim (senão a data mentiria)',
   r.dados.atividade.finalizada_em === null);

secao('3. Editar pela janela é PARCIAL de verdade');
r = await api('PATCH', `/api/atividades/${id}`, COMO.alvaro, {
  nome: 'Conferir greide após as rampas', descricao: 'Texto novo.',
  responsavel_id: COMO.luiza, situacao: 'NAO_INICIADO',
});
ok('edição aplica nome e coluna', r.dados.atividade.nome.includes('rampas') &&
   r.dados.atividade.situacao === 'NAO_INICIADO');
r = await api('PATCH', `/api/atividades/${id}`, COMO.alvaro, { nome: 'Só renomeando' });
ok('renomear NÃO apaga responsável nem descrição',
   r.dados.atividade.responsavel_nome === 'Luiza Elisa' &&
   r.dados.atividade.descricao === 'Texto novo.');
r = await api('PATCH', `/api/atividades/${id}`, COMO.alvaro, { responsavel_id: null });
ok('limpar é explícito: responsavel_id null desmarca',
   r.dados.atividade.responsavel_id === null && r.dados.atividade.nome === 'Só renomeando');
r = await api('PATCH', `/api/atividades/${id}`, COMO.alvaro, {
  nome: 'x', responsavel_id: COMO.vanessa,
});
ok('responsável fora da equipe é recusado', r.status === 400);
r = await api('POST', `/api/atividades/${id}/mover`, COMO.alvaro, { posicao: 2 });
ok('mover SEM dizer a coluna é recusado (antes caía em "não iniciado")',
   r.status === 400);
r = await api('POST', `/api/atividades/${id}/mover`, COMO.alvaro,
  { situacao: 'COLUNA_INVENTADA', posicao: 0 });
ok('coluna inventada é recusada', r.status === 400);

secao('4. Apagar é de quem criou, ou da coordenação');
r = await api('DELETE', `/api/atividades/${id}`, COMO.lya);
ok('outra pessoa da equipe não apaga', r.status === 403);
r = await api('DELETE', `/api/atividades/${id}`, COMO.alvaro);
ok('quem criou apaga', r.status === 200);
r = await api('DELETE', `/api/atividades/${id}`, COMO.alvaro);
ok('apagar de novo é 404', r.status === 404);

// A atividade nascida de ORIENTAÇÃO tem uma FK apontando para ela — sem
// desfazer o vínculo, o DELETE quebrava com 500 e o cartão era inapagável.
const doQuadro = (await api('GET', '/api/projetos/1/atividades', COMO.thayna)).dados.atividades;
const deOrientacao = doQuadro.find((a) => a.orientacao_id);
r = await api('DELETE', `/api/atividades/${deOrientacao.id}`, COMO.thayna);
ok('atividade vinda de orientação também é apagável', r.status === 200,
   `status=${r.status}`);
const orientacaoDela = await api('GET', `/api/orientacoes/${deOrientacao.orientacao_id}`, COMO.thayna);
ok('a orientação sobrevive, só perde o atalho',
   orientacaoDela.status === 200 && orientacaoDela.dados.orientacao.atividade_id === null);

secao('5. Mover não encosta em orientação nem em aviso');
const antes = await api('GET', '/api/projetos/1', COMO.alvaro);
const avisosAntes = (await api('GET', '/api/notificacoes', COMO.luiza)).dados.avisos_pendentes.length;
const alguma = (await api('GET', '/api/projetos/1/atividades', COMO.alvaro)).dados.atividades[0];
await api('POST', `/api/atividades/${alguma.id}/mover`, COMO.alvaro,
  { situacao: 'EM_EXECUCAO', posicao: 1 });
const depois = await api('GET', '/api/projetos/1', COMO.alvaro);
ok('a orientação atual não mudou',
   depois.dados.orientacao_atual.id === antes.dados.orientacao_atual.id);
ok('nenhum aviso novo nasceu',
   (await api('GET', '/api/notificacoes', COMO.luiza)).dados.avisos_pendentes.length === avisosAntes);

secao('6. Andamento do trabalho (o "commit")');
r = await api('GET', '/api/projetos/1/andamentos', COMO.alvaro);
ok('os registros do seed aparecem', r.dados.andamentos.length === 2);
ok('a dúvida em aberto vem marcada', r.dados.andamentos.some((a) => a.duvida));
r = await api('POST', '/api/projetos/1/andamentos', COMO.alvaro, {
  o_que_fiz: 'Conferi as cotas do trecho oeste.', duvida: 'Falta definição do meio-fio na esquina sul.',
});
ok('registro aceito', r.status === 200);
r = await api('POST', '/api/projetos/2/andamentos', COMO.alvaro, { o_que_fiz: 'invasão' });
ok('fora da equipe não registra', r.status === 403);

encerrar();
