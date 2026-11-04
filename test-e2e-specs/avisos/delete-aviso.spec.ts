import { test, expect } from '../fixtures';

test.describe('Delete Aviso', () => {
  test.beforeEach(async ({ page }) => {
    // 🔐 LOGIN REAL (fluxo de usuário)
    await page.goto('http://localhost:3000');

    await page.getByPlaceholder('Insira seu email')
      .fill(process.env.E2E_EMAIL!);

    await page.getByPlaceholder('Insira sua senha')
      .fill(process.env.E2E_PASSWORD!);

    await page.getByRole('button', { name: /Entrar/i }).click();

    // ✅ Espera efeito do login (NÃO localStorage)
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  test('Clicking "Remover" opens a delete confirmation modal', async ({ page }) => {
    const title = `Aviso Delete Modal Teste ${Date.now()}`;
    const description = 'Descrição para teste de abertura do modal.';

    await page.goto('http://localhost:3000/avisos/cadastrar');
    await page.waitForLoadState('networkidle');
    await page.getByPlaceholder('Inserir título').fill(title);
    await page.getByPlaceholder('Inserir descrição').fill(description);

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText('anexar imagem').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles([`${process.cwd()}/public/coletare-logo.png`]);

    await page.getByRole('button', { name: 'Realizar post' }).click();
    await page.waitForURL('**/avisos', { timeout: 15_000 });

    // The card div is the deepest element that has the warning's own heading as
    // a descendant, so this resolves to exactly that card (not the page title).
    const card = page.locator('div')
      .filter({ has: page.getByRole('heading', { name: title, exact: true }) })
      .last();
    await expect(card).toBeVisible({ timeout: 15_000 });
    await card.getByRole('button', { name: 'Remover' }).click();

    await expect(page.getByRole('heading', { name: 'Excluir aviso' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancelar' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Confirmar' })).toBeVisible();
  });

  test('Cancelling the confirmation modal keeps the warning in the list', async ({ page }) => {
    const title = `Aviso Delete Cancel Teste ${Date.now()}`;
    const description = 'Descrição para teste de cancelamento da exclusão.';

    await page.goto('http://localhost:3000/avisos/cadastrar');
    await page.waitForLoadState('networkidle');
    await page.getByPlaceholder('Inserir título').fill(title);
    await page.getByPlaceholder('Inserir descrição').fill(description);

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText('anexar imagem').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles([`${process.cwd()}/public/coletare-logo.png`]);

    await page.getByRole('button', { name: 'Realizar post' }).click();
    await page.waitForURL('**/avisos', { timeout: 15_000 });

    const card = page.locator('div')
      .filter({ has: page.getByRole('heading', { name: title, exact: true }) })
      .last();
    await expect(card).toBeVisible({ timeout: 15_000 });
    await card.getByRole('button', { name: 'Remover' }).click();

    await expect(page.getByRole('heading', { name: 'Excluir aviso' })).toBeVisible();
    await page.getByRole('button', { name: 'Cancelar' }).click();

    await expect(page.getByRole('heading', { name: 'Excluir aviso' })).not.toBeVisible();
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  });

  test('Confirming deletion removes the warning from the list', async ({ page }) => {
    const title = `Aviso Delete Confirm Teste ${Date.now()}`;
    const description = 'Descrição para teste de confirmação da exclusão.';

    await page.goto('http://localhost:3000/avisos/cadastrar');
    await page.waitForLoadState('networkidle');
    await page.getByPlaceholder('Inserir título').fill(title);
    await page.getByPlaceholder('Inserir descrição').fill(description);

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText('anexar imagem').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles([`${process.cwd()}/public/coletare-logo.png`]);

    await page.getByRole('button', { name: 'Realizar post' }).click();
    await page.waitForURL('**/avisos', { timeout: 15_000 });

    const card = page.locator('div')
      .filter({ has: page.getByRole('heading', { name: title, exact: true }) })
      .last();
    await expect(card).toBeVisible({ timeout: 15_000 });
    await card.getByRole('button', { name: 'Remover' }).click();

    await expect(page.getByRole('heading', { name: 'Excluir aviso' })).toBeVisible();
    await page.getByRole('button', { name: 'Confirmar' }).click();

    await expect(page.getByRole('alert').filter({ hasText: 'Aviso removido com sucesso!' }))
      .toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('heading', { name: title, exact: true }))
      .not.toBeVisible({ timeout: 10_000 });
  });
});
