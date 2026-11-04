import { test, expect } from '../fixtures';

test.describe('Rotas em Andamento Page', () => {
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

    await page.goto('http://localhost:3000/rotas-andamento');
    await page.waitForLoadState('networkidle');
  });

  test('Page loads with monitoring title and description visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Monitoramento de Rotas' })).toBeVisible();
    await expect(
      page.getByText('Visualize todas as coletas em andamento em tempo real.')
    ).toBeVisible();
  });

  test('Google Maps region is rendered', async ({ page }) => {
    await expect(page.getByRole('region', { name: 'Map' })).toBeVisible({ timeout: 15_000 });
  });
});
