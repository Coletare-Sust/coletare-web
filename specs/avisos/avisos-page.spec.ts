import { test, expect } from '../fixtures';

test.describe('Avisos Page', () => {
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

    await page.goto('http://localhost:3000/avisos');
    await page.waitForLoadState('networkidle');
  });

  test('Page loads with title and "Criar novo aviso" button visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Lista de Avisos' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Criar novo aviso' })).toBeVisible();
  });

  test('Date filter is visible for filtering warnings by date', async ({ page }) => {
    await expect(page.getByText('Data', { exact: true })).toBeVisible();
    await expect(page.getByText('Selecione uma data')).toBeVisible();
  });

  test('Page shows warnings list or an empty state message', async ({ page }) => {
    const emptyMessage = page.getByText('Nenhum aviso para exibir no momento.');
    // Card titles render as <h1> too (second+ heading = first card). Warnings
    // are fetched async after mount, so wait for either outcome to settle
    // instead of taking an instant isVisible() snapshot, which can race the
    // fetch (especially under parallel test load) and read a stale state.
    await expect(
      emptyMessage.or(page.getByRole('heading', { level: 1 }).nth(1))
    ).toBeVisible({ timeout: 15_000 });

    const isEmpty = await emptyMessage.isVisible();

    if (isEmpty) {
      await expect(emptyMessage).toBeVisible();
    } else {
      // page title + at least one warning card title (both rendered as <h1>)
      const headingsCount = await page.getByRole('heading', { level: 1 }).count();
      expect(headingsCount).toBeGreaterThan(1);
    }
  });

  test('Clicking "Criar novo aviso" navigates to the create warning page', async ({ page }) => {
    await page.getByRole('button', { name: 'Criar novo aviso' }).click();

    await page.waitForURL('**/avisos/cadastrar');
    await expect(page.getByRole('heading', { name: 'Criar Novo Aviso' })).toBeVisible();
  });
});
