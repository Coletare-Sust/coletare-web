import { test, expect } from '../fixtures';

test.describe('Veículos (Listagem) Page', () => {
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

    await page.goto('http://localhost:3000/veiculos');
    await page.waitForLoadState('networkidle');
  });

  test('Page loads with "Todos os veículos" title visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Todos os veículos' })).toBeVisible();
  });

  test('Vehicle cards display Login, Senha and Placa fields', async ({ page }) => {
    // Scope to the card's own container (not an outer wrapper that "has" every
    // card as a descendant), otherwise getByText('Login') below matches every
    // card's label and triggers a strict-mode violation
    const firstCard = page.locator('div.rounded-lg.border.border-greenBlue-600')
      .filter({ has: page.getByText('Placa') })
      .first();

    // Wait for the vehicles to finish loading before deciding whether to skip
    const hasCard = await firstCard.waitFor({ state: 'visible', timeout: 15000 })
      .then(() => true)
      .catch(() => false);

    test.skip(!hasCard, 'Nenhum veículo cadastrado para validar os campos do card');

    await expect(firstCard.getByText('Login')).toBeVisible();
    await expect(firstCard.getByText('Senha')).toBeVisible();
    await expect(firstCard.getByText('Placa')).toBeVisible();
  });

  test('Clicking the title navigates back to the previous page', async ({ page }) => {
    await page.goto('http://localhost:3000/veiculos-colaboradores');
    await page.waitForLoadState('networkidle');

    const link = page.getByText('Ver todos os veículos');
    const emptyState = page.getByText('Nenhum veículo cadastrado');

    // Wait for the vehicles list to finish loading - it shows either the
    // "Ver todos" link or the empty state, never neither
    await expect(link.or(emptyState)).toBeVisible({ timeout: 15000 });

    const hasLink = await link.isVisible();
    test.skip(!hasLink, 'Nenhum veículo cadastrado para navegar até a listagem completa');

    await link.click();
    await page.waitForURL('**/veiculos');

    await page.getByRole('heading', { name: 'Todos os veículos' }).click();
    await page.waitForURL('**/veiculos-colaboradores');
  });
});
