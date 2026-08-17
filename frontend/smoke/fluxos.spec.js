/* O smoke do frontend: os fluxos que quebram em silêncio.
 *
 * As 3 superfícies mais frágeis (sem teste, ninguém nota):
 *   - o arrastar do quadro (limiar de 6px, elementFromPoint, CSS);
 *   - o formulário de publicar (o checkbox que alimenta a fila do CEO);
 *   - as janelas <dialog> e os confirm/prompt nativos.
 *
 * Os cenários correm EM ORDEM sobre o mesmo banco descartável e contam
 * uma história: Álvaro publica → Luiza confirma → Matheus aprova.
 * Sem cookie o sistema abre como o Álvaro (engenharia). */

import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

const TITULO_DA_MUDANCA = 'Smoke: muda o meio-fio do trecho leste';

/** Troca o "entrar como" pela lateral. Isolado num helper de propósito:
 *  quando o login Google entrar, só este lugar do smoke muda.
 *
 *  Espera o POST /api/sessao de verdade e confere o VALUE do select —
 *  toContainText num <select> enxerga o texto de TODAS as options e
 *  passaria sempre (a revisão adversarial provou). */
async function entrarComo(pagina, nome, { aprova = false } = {}) {
  if (aprova) pagina.once('dialog', (d) => d.accept()); // o "tem certeza?"
  const seletor = pagina.locator('.lateral-rodape select');
  const valor = await seletor.locator('option', { hasText: nome }).getAttribute('value');
  const trocou = pagina.waitForResponse(
    (r) => r.url().includes('/api/sessao') && r.request().method() === 'POST',
  );
  await seletor.selectOption(valor);
  await trocou;
  await expect(seletor).toHaveValue(valor);
}

test('a tela inicial abre inteira: marca, notificações, projetos e semana', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('.lateral-marca')).toContainText('PRO');
  await expect(page.locator('.lateral-marca')).toContainText('MAV');
  await expect(page.getByRole('heading', { name: /Sua semana no/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mudanças para você ver' })).toBeVisible();

  // Álvaro trabalha em 2 obras ativas (R19: só vê as dele)
  await expect(page.locator('.cartao-projeto')).toHaveCount(2);
  // o calendário tem os 7 dias da semana
  await expect(page.locator('.calendario-dia')).toHaveCount(7);
});

test('publicar uma mudança com aval: o formulário inteiro, inclusive o checkbox', async ({ page }) => {
  await page.goto('/projetos/1');
  await page.getByRole('button', { name: 'Publicar mudança' }).click();

  const janela = page.locator('dialog[open]');
  await expect(janela).toContainText('Publicar uma mudança');

  await janela.locator('input[name="titulo"]').fill(TITULO_DA_MUDANCA);
  await janela.locator('input[name="data_da_mudanca"]').fill('2026-08-17');
  await janela.locator('textarea[name="descricao"]')
    .fill('Cenário do smoke: o meio-fio do trecho leste muda de seção. Refazer o detalhe 7.');
  await janela.locator('select[name="responsavel_id"]').selectOption({ label: 'Luiza Elisa — Engenharia' });
  await janela.locator('input[name="muda_orcamento_ou_prazo"]').check();
  await janela.getByRole('button', { name: 'Publicar e avisar a equipe' }).click();

  // vira as "informações atuais" na hora
  await expect(page.locator('.orientacao-atual .titulo')).toHaveText(TITULO_DA_MUDANCA);
  await expect(page.locator('.orientacao-atual')).toContainText('quem faz: Luiza');
});

test('a ciência: Luiza confirma e o chip fica verde', async ({ page }) => {
  await page.goto('/');
  await entrarComo(page, 'Luiza Elisa — Engenharia');

  await page.goto('/projetos/1');
  await page.getByRole('button', { name: 'Confirmo que vi esta mudança' }).click();
  await expect(page.locator('.ciencia .chip-sucesso', { hasText: 'Luiza Elisa' })).toBeVisible();
});

test('o aval: Matheus (direção) confirma a troca, vê a fila e registra', async ({ page }) => {
  await page.goto('/');
  await entrarComo(page, 'Matheus Grangeiro — Direção', { aprova: true });

  // o rodapé avisa que a sessão manda
  await expect(page.locator('.lateral-rodape')).toHaveClass(/rodape-aprovador/);

  await page.goto('/aprovacoes');
  const pendente = page.locator('.aprovacao-item', { hasText: TITULO_DA_MUDANCA });
  await expect(pendente).toBeVisible();
  await pendente.getByRole('button', { name: 'Registrar o aval' }).click();
  await expect(page.locator('.aprovacao-item', { hasText: TITULO_DA_MUDANCA })).toHaveCount(0);

  // e o selo aparece na página do projeto
  await page.goto('/projetos/1');
  await expect(page.locator('.orientacao-atual')).toContainText('Aval registrado');
});

test('o quadro: clique abre a janela; arrastar move de coluna', async ({ page }) => {
  await page.goto('/projetos/1/atividades');

  const cartao = page.locator('.cartao-atividade', { hasText: TITULO_DA_MUDANCA }).first();
  await expect(cartao).toBeVisible();
  await expect(page.locator('section[data-coluna="NAO_INICIADO"]')).toContainText(TITULO_DA_MUDANCA);

  // clique (abaixo do limiar de 6px) = abrir os detalhes
  await cartao.click();
  await expect(page.locator('dialog[open]')).toContainText(TITULO_DA_MUDANCA);
  await page.locator('dialog[open]').getByRole('button', { name: 'Cancelar' }).click();

  // arrastar (acima do limiar) = mover para "Em execução".
  // boundingBox é relativo à viewport: garante os dois na tela antes,
  // senão o drop cai fora e o quadro ignora EM SILÊNCIO.
  await cartao.scrollIntoViewIfNeeded();
  const origem = await cartao.boundingBox();
  const destino = await page.locator('section[data-coluna="EM_EXECUCAO"]').boundingBox();
  await page.mouse.move(origem.x + origem.width / 2, origem.y + origem.height / 2);
  await page.mouse.down();
  await page.mouse.move(destino.x + destino.width / 2, destino.y + 60, { steps: 12 });
  await page.mouse.up();

  await expect(page.locator('section[data-coluna="EM_EXECUCAO"]')).toContainText(TITULO_DA_MUDANCA);
  // a data de início é do sistema, não da pessoa (datasAoMover)
  await expect(page.locator('section[data-coluna="EM_EXECUCAO"] .cartao-atividade', { hasText: TITULO_DA_MUDANCA }))
    .toContainText('iniciada');
});

test('a agenda: clicar no dia, marcar, e o compromisso aparecer na semana', async ({ page }) => {
  await page.goto('/');

  await page.locator('.calendario-dia.hoje').click();
  const janela = page.locator('dialog[open]');
  await janela.locator('select[name="tipo"]').selectOption('VISITA_TECNICA');
  await janela.locator('input[name="hora"]').fill('08:30');
  await janela.locator('textarea[name="descricao"]')
    .fill('Smoke: vistoria do meio-fio no trecho leste. Projeto PAV-001.');
  await janela.getByRole('button', { name: 'Marcar', exact: true }).click();

  // A grade da semana, não a célula .hoje: se a rodada cruzar a
  // meia-noite, a classe .hoje migra de célula e o dado certo estaria
  // na célula "de ontem" — a semana inteira é o alvo estável.
  await expect(page.locator('.calendario-grade')).toContainText('08:30');
  await expect(page.locator('.calendario-grade')).toContainText('Visita');
});
