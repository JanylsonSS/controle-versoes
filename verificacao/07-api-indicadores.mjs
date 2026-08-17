/* R12: o painel de indicadores — restrito a quem aprova, com os números
 * do seed, e a lição do R19 valendo nos COUNTs: quem sai da equipe
 * deixa de contar como pendência. */

import { COMO, ok, secao, encerrar, api } from './ajuda.mjs';

secao('1. Restrito a quem aprova');
let r = await api('GET', '/api/indicadores', COMO.alvaro);
ok('engenharia não vê os indicadores', r.status === 403);
r = await api('GET', '/api/indicadores', COMO.matheus);
ok('a direção vê', r.status === 200);
const d = r.dados;

secao('2. Os números do seed');
ok('as 5 obras aparecem', d.por_obra.length === 5, d.por_obra.map((p) => p.codigo).join(', '));
const pav = d.por_obra.find((p) => p.codigo === 'PAV-001');
ok('a pavimentação deve 2 ciências, as 2 atrasadas',
   pav.ciencias_pendentes === 2 && pav.ciencias_atrasadas === 2);
ok('o aval do porcelanato espera', d.gerais.aval_esperando === 1);
ok('o tempo médio até a ciência é calculado em horas',
   typeof d.gerais.tempo_medio_ciencia_horas === 'number' && d.gerais.tempo_medio_ciencia_horas > 0);
ok('as 4 colunas do quadro vêm com contagem (e rótulo pronto)',
   d.atividades_por_coluna.length === 4 &&
   d.atividades_por_coluna.every((c) => c.rotulo) &&
   d.atividades_por_coluna.reduce((s, c) => s + c.quantidade, 0) > 0);
const alvaro = d.por_pessoa.find((p) => p.id === COMO.alvaro);
ok('o Álvaro deve 2 ciências (a calçada e a sala de vacina)',
   alvaro.ciencias_pendentes === 2);

secao('3. Quem sai da equipe deixa de contar como pendência');
const rafaelaAntes = d.por_pessoa.find((p) => p.id === COMO.rafaela);
ok('a Rafaela devia 1 (o porcelanato da Câmara)', rafaelaAntes.ciencias_pendentes === 1);
r = await api('PUT', '/api/projetos/2/equipe', COMO.thayna, {
  usuario_ids: [COMO.vanessa, COMO.luiza, COMO.micael, COMO.thayna, COMO.matheus],
});
ok('a coordenação tira a Rafaela da equipe da Câmara', r.status === 200);
r = await api('GET', '/api/indicadores', COMO.matheus);
ok('fora da equipe, a pendência dela some do painel (história fica, dívida não)',
   r.dados.por_pessoa.find((p) => p.id === COMO.rafaela).ciencias_pendentes === 0);

// No Windows, process.exit imediatamente após o último fetch caía numa
// assertion do libuv (uv_async fechando durante o teardown). Um tique
// de espera deixa os handles do undici assentarem antes do exit.
await new Promise((resolve) => setTimeout(resolve, 100));

encerrar();
