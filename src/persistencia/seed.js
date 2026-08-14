/* ══════════════════════════════════════════════════════════════════════
 * DADOS DE TESTE
 *
 * Contam a história do diagnóstico, para a validação ser sobre um caso
 * que a equipe reconhece. O caso âncora é a pavimentação da Praça do
 * Ginásio: a orientação de remover a calçada não chegou em quem executa.
 *
 * As pessoas são reais; o histórico é montado para a demonstração.
 * ══════════════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CAMINHO_BANCO } from '../config.js';

const em = (texto) => new Date(texto).toISOString();

/* A agenda do seed é marcada a partir de HOJE, para a demonstração nunca
 * abrir com o calendário e as notificações vazios — não importa em que
 * dia da semana ela aconteça. */
const daquiADias = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export async function popularSeVazio() {
  const { estaVazio } = await import('./banco.js');
  if (!estaVazio()) return false;
  await popular();
  return true;
}

async function popular() {
  const { usuarios, projetos, orientacoes, avisos, andamentos, atividades, agenda } =
    await import('./repositorio.js');

  /* ─── A equipe ─────────────────────────────────────────────────────
   * A primeira é quem o sistema abre por padrão: um engenheiro, que é o
   * ponto de vista onde a dor aparece.
   *
   * ⚑ O nome é Micael, mas a conta foi criada como "micaias". Guardamos
   * o endereço que existe de verdade, senão o aviso não chega. */
  const alvaro = usuarios.criar({ nome: 'Álvaro Abrantes', papel: 'ENGENHARIA', email: 'alvaro.promav@gmail.com' });
  const luiza = usuarios.criar({ nome: 'Luiza Elisa', papel: 'ENGENHARIA', email: 'luiza.promav@gmail.com' });
  const lya = usuarios.criar({ nome: 'Lya Melo', papel: 'ARQUITETURA', email: 'lya.promav@gmail.com' });
  const vanessa = usuarios.criar({ nome: 'Vanessa Lima', papel: 'ARQUITETURA', email: 'vanessa.promav@gmail.com' });
  const rafaela = usuarios.criar({ nome: 'Rafaela', papel: 'ESTAGIO_ARQUITETURA', email: 'rafaela.promav@gmail.com' });
  const micael = usuarios.criar({ nome: 'Micael Machado', papel: 'ORCAMENTO', email: 'micaias.promav@gmail.com' });
  const thayna = usuarios.criar({ nome: 'Thayna Weydne', papel: 'COORDENACAO', email: 'thayna.promav@gmail.com' });
  const matheus = usuarios.criar({ nome: 'Matheus Grangeiro', papel: 'DIRECAO', email: 'matheus.promav@gmail.com' });

  const confirmar = (orientacaoId, ids, quando) => {
    for (const usuarioId of ids) avisos.confirmar({ orientacaoId, usuarioId, quando: em(quando) });
  };
  const confirmarTodos = (orientacaoId, quando) =>
    confirmar(orientacaoId, avisos.daOrientacao(orientacaoId).map((a) => a.usuario_id), quando);

  const PASTA_PROMAV = 'G:\\Drives compartilhados\\PROMAV\\02_PREFEITURA DE MOMBAÇA\\';

  /* ═══ O caso âncora ═══════════════════════════════════════════════ */
  const pav = projetos.criar({
    codigo: 'PAV-001',
    nome: 'Pavimentação — Praça do Ginásio',
    local: 'Praça do Ginásio — trecho leste',
    equipe: [alvaro, luiza, lya, micael, thayna, matheus],
    tipo: 'PAVIMENTACAO', situacao: 'EM_EXECUCAO',
    cliente: 'Prefeitura Municipal', numeroContrato: '018/2026',
    dataInicio: '2026-03-16', prazo: '2026-09-30',
    linkDrive: 'https://drive.google.com/drive/folders/exemplo-pav-001',
    caminhoRede: `${PASTA_PROMAV}PAV-001 Pavimentação Praça do Ginásio`,
  });

  const pavDrenagem = orientacoes.publicar({
    projetoId: pav, titulo: 'Compatibilização com a drenagem',
    descricao:
      'As bocas de lobo do trecho norte foram deslocadas para não bater com a rede de drenagem. ' +
      'Refazer o detalhamento do trecho entre as estacas 4 e 9.',
    dataDaMudanca: '2026-04-02', responsavelId: lya, autorId: thayna,
    quando: em('2026-04-02T10:30:00-03:00'),
  });
  confirmarTodos(pavDrenagem, '2026-04-03T09:00:00-03:00');

  const pavCotas = orientacoes.publicar({
    projetoId: pav, titulo: 'Revisão das cotas de greide',
    descricao: 'Cotas de greide revisadas entre as estacas 12 e 20, conforme o levantamento novo.',
    dataDaMudanca: '2026-05-14', responsavelId: alvaro, autorId: thayna,
    quando: em('2026-05-14T16:15:00-03:00'),
  });
  confirmarTodos(pavCotas, '2026-05-15T08:20:00-03:00');

  // A orientação que ninguém da engenharia confirmou — é o buraco que
  // custou o serviço refeito, e é o que a tela precisa mostrar.
  const pavCalcada = orientacoes.publicar({
    projetoId: pav, titulo: 'Remoção da calçada no trecho leste',
    descricao:
      'A calçada entre as estacas 15 e 19 sai do projeto. O trecho passa a ser pavimentado ' +
      'até o meio-fio existente. Ajustar o detalhamento e avisar a frente de serviço antes ' +
      'de concretar.',
    dataDaMudanca: '2026-06-05', responsavelId: lya, autorId: thayna,
    quando: em('2026-06-05T15:40:00-03:00'),
  });
  // A Lya, que ia executar a mudança no desenho, viu. Quem NÃO viu foi a
  // engenharia — justamente quem tocava o serviço no campo. É esse o
  // buraco que a tela precisa mostrar.
  confirmar(pavCalcada, [lya], '2026-06-05T16:00:00-03:00');
  confirmar(pavCalcada, [matheus], '2026-06-06T08:40:00-03:00');
  confirmar(pavCalcada, [micael], '2026-06-08T09:10:00-03:00');

  /* ═══ Projetos de apoio ═══════════════════════════════════════════ */
  const cam = projetos.criar({
    codigo: 'CAM-002', nome: 'Reforma da Câmara Municipal', local: 'Centro — plenário e anexo',
    equipe: [vanessa, rafaela, luiza, micael, thayna, matheus],
    tipo: 'REFORMA', situacao: 'EM_EXECUCAO',
    cliente: 'Câmara Municipal', numeroContrato: '004/2026',
    dataInicio: '2026-02-24', prazo: '2026-08-31',
    linkDrive: 'https://drive.google.com/drive/folders/exemplo-cam-002',
    caminhoRede: `${PASTA_PROMAV}CAM-002 Reforma da Câmara Municipal`,
  });
  const camBancada = orientacoes.publicar({
    projetoId: cam, titulo: 'Bancada do plenário com quatro posições a menos',
    descricao: 'O layout do plenário muda: a bancada perde quatro posições. Refazer planta e quantitativo.',
    dataDaMudanca: '2026-05-12', responsavelId: vanessa, autorId: thayna,
    quando: em('2026-05-12T11:20:00-03:00'),
  });
  confirmar(camBancada, [luiza, rafaela, matheus], '2026-05-12T15:00:00-03:00');

  // Mexe em orçamento e prazo: entra na fila de aval, mas o trabalho já corre.
  const camPiso = orientacoes.publicar({
    projetoId: cam, titulo: 'Piso do plenário passa a porcelanato',
    descricao:
      'O cliente pediu porcelanato no lugar do laminado, e forro acústico no anexo. ' +
      'Aumenta material e acrescenta cerca de 15 dias ao prazo.',
    dataDaMudanca: '2026-08-07', responsavelId: micael, autorId: vanessa,
    mudaOrcamentoOuPrazo: true, quando: em('2026-08-07T09:30:00-03:00'),
  });

  const escola = projetos.criar({
    codigo: 'ESC-003', nome: 'Reforma da Escola Municipal Norte', local: 'Bairro Norte',
    equipe: [luiza, vanessa, micael, thayna, matheus],
    tipo: 'REFORMA', situacao: 'EM_PROJETO',
    cliente: 'Secretaria de Educação', numeroContrato: '027/2026',
    dataInicio: '2026-04-13', prazo: '2026-12-18',
    conjunto: 'Reformas de Escolas 2026',
    linkDrive: 'https://drive.google.com/drive/folders/exemplo-esc-003',
    caminhoRede: `${PASTA_PROMAV}ESC-003 Reforma Escola Municipal Norte`,
  });
  const escInicial = orientacoes.publicar({
    projetoId: escola, titulo: 'Emissão inicial do bloco de salas',
    descricao: 'Bloco de salas de aula e quadra coberta liberados para detalhamento.',
    dataDaMudanca: '2026-04-13', responsavelId: vanessa, autorId: thayna,
    quando: em('2026-04-13T14:00:00-03:00'),
  });
  confirmarTodos(escInicial, '2026-04-14T09:30:00-03:00');

  const ubs = projetos.criar({
    codigo: 'UBS-004', nome: 'UBS Centro', local: 'Avenida Central, 480',
    equipe: [lya, rafaela, alvaro, micael, thayna, matheus],
    tipo: 'EDIFICACAO', situacao: 'EM_EXECUCAO',
    cliente: 'Secretaria de Saúde', numeroContrato: '011/2026',
    dataInicio: '2026-03-09', prazo: '2026-11-20',
    linkDrive: 'https://drive.google.com/drive/folders/exemplo-ubs-004',
    caminhoRede: `${PASTA_PROMAV}UBS-004 UBS Centro`,
  });
  const ubsVacina = orientacoes.publicar({
    projetoId: ubs, titulo: 'Sala de vacina muda para o lado norte',
    descricao:
      'A vigilância sanitária exigiu que a sala de vacina fique no lado norte. ' +
      'Atualizar plantas, cortes e o layout de mobiliário.',
    dataDaMudanca: '2026-07-28', responsavelId: rafaela, autorId: thayna,
    quando: em('2026-07-28T10:10:00-03:00'),
  });
  confirmar(ubsVacina, [rafaela, matheus], '2026-07-28T13:00:00-03:00');

  const escolaSul = projetos.criar({
    codigo: 'ESC-005', nome: 'Reforma da Escola Municipal Sul', local: 'Bairro Sul',
    equipe: [vanessa, luiza, micael, thayna, matheus],
    tipo: 'REFORMA', situacao: 'CONCLUIDA',
    cliente: 'Secretaria de Educação', numeroContrato: '009/2025',
    dataInicio: '2025-08-04', prazo: '2026-01-30',
    conjunto: 'Reformas de Escolas 2026',
    linkDrive: 'https://drive.google.com/drive/folders/exemplo-esc-005',
    caminhoRede: `${PASTA_PROMAV}ESC-005 Reforma Escola Municipal Sul`,
  });
  const sulInicial = orientacoes.publicar({
    projetoId: escolaSul, titulo: 'Emissão inicial da reforma',
    descricao: 'Reforma do bloco de salas e da cobertura liberada.',
    dataDaMudanca: '2025-08-04', responsavelId: vanessa, autorId: thayna,
    quando: em('2025-08-04T09:00:00-03:00'),
  });
  confirmarTodos(sulInicial, '2025-08-05T10:00:00-03:00');

  /* ═══ Atividades que não vieram de orientação ═════════════════════ */
  const atividade = (projetoId, nome, situacao, responsavelId, descricao) =>
    atividades.criar({
      projetoId, nome, situacao, responsavelId, descricao,
      criadaPor: thayna, quando: em('2026-07-20T09:00:00-03:00'),
    });

  atividade(pav, 'Levantamento topográfico do trecho leste', 'FINALIZADO', alvaro,
    'Conferir as cotas existentes antes de detalhar o meio-fio.');
  atividade(pav, 'Revisão do quantitativo de pavimento', 'REVISAO', micael,
    'Conferir se o quantitativo bate depois da remoção da calçada.');
  atividade(ubs, 'Conferir exigências da vigilância sanitária', 'FINALIZADO', lya, null);

  /* ═══ Andamento do trabalho ═══════════════════════════════════════ */
  andamentos.registrar({
    projetoId: pav, usuarioId: alvaro,
    oQueFiz: 'Conferi o greide executado entre as estacas 12 e 18 com o projeto.',
    quando: em('2026-08-04T17:10:00-03:00'),
  });
  andamentos.registrar({
    projetoId: pav, usuarioId: lya,
    oQueFiz: 'Comecei o detalhamento do meio-fio no trecho leste.',
    dificuldade: 'O levantamento topográfico do trecho leste está impreciso perto da estaca 17.',
    duvida: 'A prefeitura já definiu se o piso da praça continua intertravado?',
    quando: em('2026-08-05T16:40:00-03:00'),
  });
  andamentos.registrar({
    projetoId: cam, usuarioId: micael,
    oQueFiz: 'Refiz o orçamento da bancada do plenário com as quatro posições a menos.',
    duvida: 'O aditivo da bancada já foi formalizado? Preciso saber para fechar a planilha.',
    quando: em('2026-08-05T11:05:00-03:00'),
  });

  /* ═══ Agenda da semana ════════════════════════════════════════════
   * Marcada relativa a hoje, para o calendário da tela inicial nunca
   * aparecer vazio na demonstração. */
  agenda.criar({
    tipo: 'REUNIAO', dia: daquiADias(1), hora: '09:00',
    descricao: 'Reunião com a prefeitura sobre o piso da Praça do Ginásio. Com Thayna e Lya.',
    participanteId: alvaro, criadaPor: thayna,
  });
  agenda.criar({
    tipo: 'VISITA_TECNICA', dia: daquiADias(2), hora: '14:30',
    descricao: 'Visita ao trecho leste da pavimentação para conferir o meio-fio executado.',
    participanteId: alvaro, criadaPor: alvaro,
  });
  agenda.criar({
    tipo: 'REUNIAO', dia: daquiADias(1), hora: '10:00',
    descricao: 'Alinhamento do orçamento da Câmara com o Micael. Projeto CAM-002.',
    participanteId: micael, criadaPor: thayna,
  });
  agenda.criar({
    tipo: 'VISITA_TECNICA', dia: daquiADias(3), hora: '08:00',
    descricao: 'Vistoria da UBS Centro com a vigilância sanitária.',
    participanteId: lya, criadaPor: thayna,
  });
}

/* ─── Recomeçar do zero ─────────────────────────────────────────────── */

function apagarTudo() {
  try {
    for (const sufixo of ['', '-wal', '-shm']) {
      fs.rmSync(`${CAMINHO_BANCO}${sufixo}`, { force: true });
    }
  } catch (erro) {
    if (erro.code === 'EPERM' || erro.code === 'EBUSY') {
      console.error(
        '\nNão deu para apagar os dados: o sistema está rodando e segurando o banco.' +
          '\nPare o servidor (Ctrl+C na janela onde ele está) e rode de novo.\n'
      );
      process.exit(1);
    }
    throw erro;
  }
}

const executadoDireto =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (executadoDireto) {
  if (process.argv.includes('--recriar')) apagarTudo();
  const criou = await popularSeVazio();
  console.log(
    criou ? 'Dados de teste criados.' : 'O banco já tem dados. Use "npm run recomecar" para começar do zero.'
  );
}
