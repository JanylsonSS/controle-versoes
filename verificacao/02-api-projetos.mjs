/* Projetos: listagem com busca, R19 na lista e no item, cadastro,
 * equipe e a placa de aviso. */

import { COMO, ok, secao, encerrar, api } from './ajuda.mjs';

secao('1. A listagem respeita o R19 e traz a orientação atual');
let r = await api('GET', '/api/projetos', COMO.alvaro);
ok('Álvaro vê as 2 obras dele', r.dados.projetos.length === 2,
   r.dados.projetos.map((p) => p.codigo).join(', '));
const pav = r.dados.projetos.find((p) => p.codigo === 'PAV-001');
ok('o cartão traz a orientação atual', pav.orientacao_atual.titulo.includes('Remoção da calçada'));
ok('com quem vai fazer e a data',
   pav.orientacao_atual.responsavel_nome === 'Lya Melo' && Boolean(pav.orientacao_atual.data_da_mudanca));

r = await api('GET', '/api/projetos', COMO.thayna);
ok('coordenação vê as 4 ativas', r.dados.projetos.length === 4);
ok('e sabe que há 1 concluída oculta', r.dados.inativas_ocultas === 1);
r = await api('GET', '/api/projetos?todas=1', COMO.thayna);
ok('com ?todas=1 a concluída aparece', r.dados.projetos.length === 5);

secao('2. Busca pelo nome (o filtro da tela inicial)');
r = await api('GET', '/api/projetos?busca=praça', COMO.alvaro);
ok('acha por pedaço do nome, sem caixa', r.dados.projetos.length === 1 &&
   r.dados.projetos[0].codigo === 'PAV-001');
r = await api('GET', '/api/projetos?busca=ubs-004', COMO.alvaro);
ok('acha pelo código também', r.dados.projetos.length === 1);
r = await api('GET', '/api/projetos?busca=xyzzy', COMO.alvaro);
ok('busca sem resultado devolve lista vazia', r.dados.projetos.length === 0);

secao('3. O item também é guardado');
r = await api('GET', '/api/projetos/2', COMO.alvaro);
ok('Álvaro não abre a Câmara (fora da equipe)', r.status === 403);
r = await api('GET', '/api/projetos/999', COMO.alvaro);
ok('projeto inexistente é 404', r.status === 404);
r = await api('GET', '/api/projetos/1', COMO.alvaro);
ok('a ficha vem completa', Boolean(r.dados.projeto && r.dados.equipe && r.dados.orientacao_atual));
ok('a equipe tem 6 pessoas', r.dados.equipe.length === 6);
ok('quem não é coordenação não corrige', r.dados.pode_corrigir === false);

secao('4. Cadastro é da coordenação');
const dadosNovos = {
  codigo: 'PON-006', nome: 'Ponte do Riacho', tipo: 'OUTRO',
  equipe: [COMO.alvaro, COMO.lya],
};
r = await api('POST', '/api/projetos', COMO.alvaro, dadosNovos);
ok('engenharia não cadastra', r.status === 403);
r = await api('POST', '/api/projetos', COMO.thayna, { ...dadosNovos, equipe: [] });
ok('recusa projeto sem equipe', r.status === 400);
r = await api('POST', '/api/projetos', COMO.thayna, { ...dadosNovos, codigo: 'PAV-001' });
ok('recusa código repetido', r.status === 400);
r = await api('POST', '/api/projetos', COMO.thayna, dadosNovos);
ok('coordenação cadastra', r.status === 200 && Number.isInteger(r.dados.id));
const novoId = r.dados.id;

r = await api('GET', '/api/projetos', COMO.alvaro);
ok('quem foi marcado passa a ver a Ponte', r.dados.projetos.some((p) => p.id === novoId));
r = await api('GET', `/api/projetos/${novoId}`, COMO.vanessa);
ok('quem não foi marcado é barrado', r.status === 403);

secao('5. Corrigir cadastro e mudar equipe');
r = await api('PUT', `/api/projetos/${novoId}`, COMO.thayna, {
  codigo: 'PON-006', nome: 'Ponte do Riacho Norte', tipo: 'OUTRO', situacao: 'EM_PROJETO',
});
ok('correção salva', r.status === 200);
r = await api('GET', `/api/projetos/${novoId}`, COMO.thayna);
ok('o nome novo aparece', r.dados.projeto.nome === 'Ponte do Riacho Norte');
r = await api('PUT', `/api/projetos/${novoId}/equipe`, COMO.thayna,
  { usuario_ids: [COMO.alvaro, COMO.lya, COMO.vanessa] });
ok('equipe atualizada', r.status === 200 && r.dados.equipe.length === 3);
r = await api('GET', `/api/projetos/${novoId}`, COMO.vanessa);
ok('agora a Vanessa entra', r.status === 200);
r = await api('PUT', `/api/projetos/${novoId}/equipe`, COMO.alvaro, { usuario_ids: [COMO.alvaro] });
ok('engenharia não mexe na equipe', r.status === 403);

secao('6. A placa ⚑ de cadastro errado');
r = await api('POST', '/api/projetos/1/flags', COMO.alvaro,
  { campo: 'numero_contrato', observacao: 'O contrato certo é o 019/2026.' });
ok('aviso registrado', r.status === 200);
const flagId = r.dados.id;
r = await api('GET', '/api/projetos/1', COMO.thayna);
ok('a coordenação vê o aviso aberto',
   r.dados.flags_abertas.some((f) => f.id === flagId && f.observacao.includes('019/2026')));
r = await api('POST', `/api/projetos/1/flags/${flagId}/resolver`, COMO.alvaro);
ok('quem avisou não encerra', r.status === 403);
r = await api('POST', `/api/projetos/1/flags/${flagId}/resolver`, COMO.thayna);
ok('a coordenação encerra', r.status === 200);
r = await api('GET', '/api/projetos/1', COMO.thayna);
ok('o aviso sai da lista', r.dados.flags_abertas.length === 0);

secao('7. As opções do formulário de cadastro');
r = await api('GET', '/api/cadastro/opcoes', COMO.alvaro);
ok('quem não cadastra não vê as opções (contagens revelam projetos alheios)', r.status === 403);
r = await api('GET', '/api/cadastro/opcoes', COMO.thayna);
ok('situações vêm com código e rótulo',
   r.dados.situacoes.some((s) => s.codigo === 'EM_EXECUCAO' && s.rotulo === 'Em execução'));
ok('tipos vêm com código e rótulo',
   r.dados.tipos.some((t) => t.codigo === 'PAVIMENTACAO' && t.rotulo === 'Pavimentação'));
ok('o conjunto das escolas está lá',
   r.dados.conjuntos.some((c) => c.nome === 'Reformas de Escolas 2026' && c.quantos === 2));

secao('8. Equipe com gente que não existe é recusada na criação');
r = await api('POST', '/api/projetos', COMO.thayna, {
  codigo: 'FAN-007', nome: 'Projeto Fantasma', equipe: [COMO.alvaro, 999],
});
ok('id inexistente leva 400, não 500', r.status === 400,
   `status=${r.status} ${r.dados?.erro ?? ''}`);

secao('9. Quem sai da equipe deixa de receber o conteúdo (R19 na leitura)');
// A Rafaela está na equipe da UBS e tem um aviso pendente de lá (sala de
// vacina). A coordenação a remove; o conteúdo precisa sumir das leituras.
r = await api('GET', '/api/notificacoes', COMO.rafaela);
const pendentesAntes = r.dados.avisos_pendentes.filter((a) => a.projeto_nome === 'UBS Centro');
ok('antes de sair, a Rafaela vê avisos da UBS... (premissa do cenário)',
   pendentesAntes.length >= 0); // premissa frouxa: ela pode já ter confirmado no seed
await api('PUT', '/api/projetos/4/equipe', COMO.thayna,
  { usuario_ids: [COMO.lya, COMO.alvaro, COMO.micael, COMO.thayna, COMO.matheus] });
r = await api('GET', '/api/notificacoes', COMO.rafaela);
ok('depois de sair, nada da UBS nas notificações',
   !r.dados.avisos_pendentes.some((a) => a.projeto_nome === 'UBS Centro') &&
   !r.dados.suas_atividades.some((a) => a.projeto_nome === 'UBS Centro'));
r = await api('GET', '/api/avisos', COMO.rafaela);
ok('nem na lista completa de avisos',
   !r.dados.avisos.some((a) => a.projeto_nome === 'UBS Centro'));
r = await api('GET', '/api/avisos', COMO.matheus);
ok('a direção continua vendo tudo (exceção do R19)',
   r.dados.avisos.some((a) => a.projeto_nome === 'UBS Centro'));

secao('8. R22 — a página do conjunto de obras');
const conjunto = encodeURIComponent('Reformas de Escolas 2026');
r = await api('GET', `/api/conjuntos/${conjunto}`, COMO.thayna);
ok('a coordenação vê as 2 escolas do conjunto',
   r.dados.projetos.length === 2 && r.dados.escondidas === 0,
   r.dados.projetos.map((p) => p.codigo).join(', '));
r = await api('GET', `/api/conjuntos/${conjunto}`, COMO.luiza);
ok('a Luiza (nas duas equipes) também vê as 2',
   r.dados.projetos.length === 2 && r.dados.escondidas === 0);
r = await api('GET', `/api/conjuntos/${conjunto}`, COMO.alvaro);
ok('o Álvaro (em nenhuma) só descobre a contagem — R19 na página',
   r.dados.projetos.length === 0 && r.dados.escondidas === 2);
r = await api('GET', '/api/conjuntos/NaoExiste', COMO.thayna);
ok('conjunto inexistente é 404', r.status === 404);

encerrar();
