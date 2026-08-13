/* Confere o domínio novo direto no repositório, sem passar por HTTP —
   a camada web ainda não existe nesta fase da migração. */
// sem-servidor — fala direto com o repositório, não precisa de HTTP
const { usuarios, projetos, orientacoes, avisos, atividades, agenda, equipes } =
  await import('../src/persistencia/repositorio.js');

let falhas = 0;
const ok = (nome, cond, extra = '') => {
  console.log(`${cond ? '  ok  ' : ' FALHA'} ${nome}${extra ? ' — ' + extra : ''}`);
  if (!cond) falhas++;
};

console.log('\n1. Modelo novo no lugar');
ok('8 pessoas', usuarios.todos().length === 8);
ok('5 projetos', projetos.todos().length === 5);
ok('não existe mais tabela de revisões', !('revisoes' in await import('../src/persistencia/repositorio.js')));
ok('não existe mais retrabalho', !('incidentes' in await import('../src/persistencia/repositorio.js')));

console.log('\n2. "Informações atuais" = a última orientação publicada');
const atual = orientacoes.atualDoProjeto(1);
ok('a atual da pavimentação é a da calçada', atual.titulo.includes('Remoção da calçada'), atual.titulo);
ok('tem título, data e descrição', Boolean(atual.titulo && atual.data_da_mudanca && atual.descricao));
ok('tem quem vai fazer', atual.responsavel_nome === 'Lya Melo', atual.responsavel_nome);
ok('não tem número de versão', !('codigo' in atual) && !('situacao' in atual));

console.log('\n3. Histórico para comparar');
const hist = orientacoes.doProjeto(1);
ok('3 orientações no histórico', hist.length === 3, hist.map((o) => o.titulo).join(' | '));
ok('a mais recente vem primeiro', hist[0].id === atual.id);

console.log('\n4. Publicar cria a atividade sozinha');
const antes = atividades.doProjeto(1).length;
const nova = orientacoes.publicar({
  projetoId: 1, titulo: 'Rampa de acessibilidade na esquina sul',
  descricao: 'Acrescentar rampa conforme NBR 9050.',
  dataDaMudanca: '2026-08-13', responsavelId: 2, autorId: 7,
});
const depois = atividades.doProjeto(1);
ok('nasceu uma atividade', depois.length === antes + 1);
const daOrientacao = depois.find((a) => a.orientacao_id === nova);
ok('ligada à orientação', Boolean(daOrientacao));
ok('com o título da mudança', daOrientacao.nome === 'Rampa de acessibilidade na esquina sul');
ok('com quem vai fazer', daOrientacao.responsavel_nome === 'Luiza Elisa', daOrientacao.responsavel_nome);
ok('começa em "não iniciado"', daOrientacao.situacao === 'NAO_INICIADO');

console.log('\n5. Ciência: registra, mas não bloqueia');
const avisados = avisos.daOrientacao(nova);
ok('a equipe foi avisada (menos quem publicou)', avisados.length === 5, `${avisados.length} pessoas`);
ok('ninguém confirmou ainda', avisados.every((a) => !a.confirmado_em));
avisos.confirmar({ orientacaoId: nova, usuarioId: 2 });
ok('confirmar registra data', Boolean(avisos.doUsuarioNaOrientacao(2, nova).confirmado_em));
const calcada = hist.find((o) => o.titulo.includes('Remoção da calçada'));
const naoConfirmou = avisos.daOrientacao(calcada.id).filter((a) => !a.confirmado_em);
ok('a orientação da calçada tem gente que não viu', naoConfirmou.length === 2,
   naoConfirmou.map((a) => a.usuario_nome).join(', '));

console.log('\n6. Editar reabre a ciência');
orientacoes.editar({
  id: nova, titulo: 'Rampa de acessibilidade nas duas esquinas',
  descricao: 'Agora nas esquinas sul e norte.', dataDaMudanca: '2026-08-13',
  responsavelId: 2, editorId: 7,
});
ok('a confirmação anterior foi limpa', !avisos.doUsuarioNaOrientacao(2, nova).confirmado_em);
ok('a atividade acompanhou o novo título',
   atividades.porId(daOrientacao.id).nome === 'Rampa de acessibilidade nas duas esquinas');
ok('ficou registrado que foi editada', Boolean(orientacoes.porId(nova).editada_em));

console.log('\n7. Aprovação não segura nada');
const fila = orientacoes.esperandoAval();
ok('a do piso da Câmara está na fila', fila.some((o) => o.titulo.includes('porcelanato')));
const piso = fila.find((o) => o.titulo.includes('porcelanato'));
ok('mesmo esperando aval, ela já é a atual da Câmara', orientacoes.atualDoProjeto(2).id === piso.id);
ok('e já criou atividade', atividades.doProjeto(2).some((a) => a.orientacao_id === piso.id));
orientacoes.aprovar({ id: piso.id, aprovadorId: 8 });
ok('depois de aprovar, sai da fila', !orientacoes.esperandoAval().some((o) => o.id === piso.id));

console.log('\n8. Agenda da semana');
const seg = new Date(); seg.setDate(seg.getDate() - ((seg.getDay() + 6) % 7));
const dia = (n) => { const d = new Date(seg); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const semanaDoAlvaro = agenda.daSemana(1, dia(0), dia(6));
ok('o Álvaro tem 2 compromissos esta semana', semanaDoAlvaro.length === 2, semanaDoAlvaro.map((a) => a.tipo).join(', '));
ok('um é reunião e outro visita técnica',
   new Set(semanaDoAlvaro.map((a) => a.tipo)).size === 2);
const marcadasPorOutros = agenda.marcadasPorOutros(1, dia(0));
ok('uma foi marcada pela coordenação', marcadasPorOutros.length === 1,
   marcadasPorOutros.map((a) => a.criador_nome).join(', '));

console.log('\n9. Tela inicial: o que preciso saber hoje');
ok('avisos pendentes do Álvaro', avisos.doUsuario(1, { apenasPendentes: true }).length > 0);
ok('atividades em que o Álvaro está marcado', atividades.doResponsavel(1).length > 0);
ok('projetos ativos que ele vê', projetos.doUsuario(1).length === 2);

console.log(falhas ? `\n${falhas} FALHA(S)\n` : '\nDomínio novo funcionando.\n');
process.exit(falhas ? 1 : 0);
