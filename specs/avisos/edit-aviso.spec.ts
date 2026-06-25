import { test, expect } from '../fixtures';

test.describe('Edit Aviso', () => {
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

  test('Successfully edit an existing warning from the avisos list', async ({ page }) => {
    const title = `Aviso Edit Teste ${Date.now()}`;
    const description = 'Descrição original gerada pelo e2e.';

    // Disposable warning created via the real UI flow, so the test is self-contained.
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
    await card.getByRole('button', { name: 'Editar' }).click();

    await page.waitForURL('**/avisos/cadastrar/*');
    await expect(page.getByRole('heading', { name: 'Editar Aviso' })).toBeVisible();

    // Form should load prefilled with the existing warning data.
    await expect(page.getByPlaceholder('Inserir título')).toHaveValue(title);
    await expect(page.getByPlaceholder('Inserir descrição')).toHaveValue(description);

    const updatedTitle = `${title} Editado`;
    const updatedDescription = 'Descrição atualizada pelo e2e.';
    await page.getByPlaceholder('Inserir título').fill(updatedTitle);
    await page.getByPlaceholder('Inserir descrição').fill(updatedDescription);
    await page.getByRole('button', { name: 'Salvar Alterações' }).click();

    await expect(page.getByRole('alert').filter({ hasText: 'Aviso atualizado!' }))
      .toBeVisible({ timeout: 10_000 });
    await page.waitForURL('**/avisos', { timeout: 15_000 });

    await expect(page.getByRole('heading', { name: updatedTitle, exact: true }))
      .toBeVisible({ timeout: 15_000 });
  });

  test('Back button on edit form navigates to the avisos list without saving changes', async ({ page }) => {
    const title = `Aviso Edit Cancel Teste ${Date.now()}`;
    const description = 'Descrição para teste de cancelamento.';

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
    await card.getByRole('button', { name: 'Editar' }).click();
    await page.waitForURL('**/avisos/cadastrar/*');

    // Back chevron is always the first type="button" element in the form.
    await page.locator('form button[type="button"]').first().click();
    await page.waitForURL('**/avisos');

    // The warning still exists, untouched by the aborted edit.
    await expect(page.getByRole('heading', { name: title, exact: true }))
      .toBeVisible({ timeout: 15_000 });
  });
});
