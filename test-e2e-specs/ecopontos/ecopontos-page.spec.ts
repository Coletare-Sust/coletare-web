import { test, expect } from '../fixtures';

test.describe('Ecopontos Page', () => {
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

    await page.goto('http://localhost:3000/ecopontos');
    await page.waitForLoadState('networkidle');
  });

  test('Page loads with title and "Criar novo ecoponto" button visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Ecopontos' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Criar novo ecoponto/i })).toBeVisible();
  });

  test('Residue type filter dropdown shows all filter options', async ({ page }) => {
    await page.getByText('Filtrar por tipo de resíduo:').waitFor();

    // Open the dropdown
    await page.getByText('Todos os tipos').click();

    await expect(page.locator('p.cursor-pointer:text-is("Todos")')).toBeVisible();
    await expect(page.locator('p.cursor-pointer:text-is("Recicláveis")')).toBeVisible();
    await expect(page.locator('p.cursor-pointer:text-is("Orgânicos")')).toBeVisible();
    await expect(page.locator('p.cursor-pointer:text-is("Especiais")')).toBeVisible();
    await expect(page.locator('p.cursor-pointer:text-is("Resíduo Comum")')).toBeVisible();
  });

  test('Selecting a residue type filter updates the list or shows the empty state', async ({ page }) => {
    await page.getByText('Todos os tipos').click();
    await page.locator('p.cursor-pointer:text-is("Recicláveis")').click();

    // Dropdown closes and the trigger now shows the selected filter
    await expect(page.getByText('Recicláveis', { exact: true }).first()).toBeVisible();

    // Either filtered ecopontos are rendered as accordion items, or the empty state message is shown
    const emptyMessage = page.getByText('Nenhum ecoponto encontrado para este município.');
    const accordionItems = page.locator('[data-state]');

    await expect(emptyMessage.or(accordionItems.first())).toBeVisible({ timeout: 10_000 });
  });

  test('Clicking "Criar novo ecoponto" navigates to the create ecoponto page', async ({ page }) => {
    await page.getByRole('button', { name: /Criar novo ecoponto/i }).click();

    await page.waitForURL('**/ecopontos/criar-ecoponto');
    await expect(page.getByRole('heading', { name: 'Novo Ecoponto' })).toBeVisible();
  });
});
