import { test, expect } from '../fixtures';

test.describe('Criar Ecoponto Page', () => {
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

    await page.goto('http://localhost:3000/ecopontos/criar-ecoponto');
    await page.waitForLoadState('networkidle');
  });

  test('Form loads with all required fields visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Novo Ecoponto' })).toBeVisible();

    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#address-search')).toBeVisible();
    await expect(page.locator('#lat')).toBeVisible();
    await expect(page.locator('#lng')).toBeVisible();

    await expect(page.getByText('Tipo de Resíduo')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Criar Ecoponto' })).toBeVisible();
  });

  test('Submitting the form without filling required fields shows a validation error', async ({ page }) => {
    await page.getByRole('button', { name: 'Criar Ecoponto' }).click();

    await expect(
      page.getByText('Preencha todos os campos obrigatórios.')
    ).toBeVisible({ timeout: 10_000 });
  });

  test('Filling name, latitude and longitude accepts the input values', async ({ page }) => {
    const ecopontoName = `Ecoponto Teste ${Date.now()}`;

    await page.locator('#name').fill(ecopontoName);
    await page.locator('#lat').fill('-8.0476');
    await page.locator('#lng').fill('-34.8770');

    await expect(page.locator('#name')).toHaveValue(ecopontoName);
    await expect(page.locator('#lat')).toHaveValue('-8.0476');
    await expect(page.locator('#lng')).toHaveValue('-34.8770');
  });

  test('Back arrow navigates back to the ecopontos list', async ({ page }) => {
    await page.getByAltText('Seta').click();

    await page.waitForURL('**/ecopontos');
  });
});
