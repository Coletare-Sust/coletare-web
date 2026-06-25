import { test, expect } from '../fixtures';

test.describe('Cadastrar Aviso Page', () => {
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

    await page.goto('http://localhost:3000/avisos/cadastrar');
    await page.waitForLoadState('networkidle');
  });

  test('Form loads with title, fields and submit button visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Criar Novo Aviso' })).toBeVisible();
    await expect(page.getByPlaceholder('Inserir título')).toBeVisible();
    await expect(page.getByPlaceholder('Inserir descrição')).toBeVisible();
    await expect(page.getByText('anexar imagem')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Realizar post' })).toBeVisible();
  });

  test('Submitting an empty form shows a validation error', async ({ page }) => {
    await page.getByRole('button', { name: 'Realizar post' }).click();

    await expect(page.getByRole('alert').filter({ hasText: 'Preencha todos os campos!' }))
      .toBeVisible({ timeout: 10_000 });
  });

  test('Filling title and description accepts the input values', async ({ page }) => {
    const title = `Aviso Teste ${Date.now()}`;
    const description = 'Descrição de teste gerada automaticamente pelo e2e.';

    await page.getByPlaceholder('Inserir título').fill(title);
    await page.getByPlaceholder('Inserir descrição').fill(description);

    await expect(page.getByPlaceholder('Inserir título')).toHaveValue(title);
    await expect(page.getByPlaceholder('Inserir descrição')).toHaveValue(description);
  });

  test('Uploading an image shows a preview', async ({ page }) => {
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText('anexar imagem').click();
    const fileChooser = await fileChooserPromise;

    await fileChooser.setFiles([`${process.cwd()}/public/coletare-logo.png`]);

    await expect(page.getByAltText('preview')).toBeVisible();
  });

  test('Back button navigates to the avisos list', async ({ page }) => {
    await page.locator('form button[type="button"]').first().click();

    await page.waitForURL('**/avisos');
  });
});
