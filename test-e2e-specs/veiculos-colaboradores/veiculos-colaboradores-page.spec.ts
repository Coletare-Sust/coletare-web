import { test, expect } from '../fixtures';

test.describe('Veículos e Colaboradores Page', () => {
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

    await page.goto('http://localhost:3000/veiculos-colaboradores');
    await page.waitForLoadState('networkidle');
  });

  test('Page loads with "Veículos" and "Colaboradores" sections visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Veículos', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Colaboradores', exact: true })).toBeVisible();
  });

  test('Each section shows a "Cadastrar novo" button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Cadastrar novo' })).toHaveCount(2);
  });

  test('"Visualizar rotas" button navigates to the live routes monitoring page', async ({ page }) => {
    await page.getByRole('button', { name: 'Visualizar rotas' }).click();

    await page.waitForURL('**/rotas-andamento');
    await expect(page.getByRole('heading', { name: 'Monitoramento de Rotas' })).toBeVisible();
  });

  test('First "Cadastrar novo" button navigates to vehicle registration', async ({ page }) => {
    await page.getByRole('button', { name: 'Cadastrar novo' }).first().click();

    await page.waitForURL('**/cadastrar-veiculo');
  });

  test('Second "Cadastrar novo" button navigates to collaborator registration', async ({ page }) => {
    await page.getByRole('button', { name: 'Cadastrar novo' }).last().click();

    await page.waitForURL('**/cadastrar-colaborador');
  });

  test('"Ver todos os veículos" link navigates to the full vehicles list', async ({ page }) => {
    const link = page.getByText('Ver todos os veículos');
    const emptyState = page.getByText('Nenhum veículo cadastrado');

    // Wait for the vehicles list to finish loading - it shows either the
    // "Ver todos" link or the empty state, never neither
    await expect(link.or(emptyState)).toBeVisible({ timeout: 15000 });

    const hasLink = await link.isVisible();
    test.skip(!hasLink, 'Nenhum veículo cadastrado para exibir o link "Ver todos os veículos"');

    await link.click();
    await page.waitForURL('**/veiculos');
    await expect(page.getByRole('heading', { name: 'Todos os veículos' })).toBeVisible();
  });

  test('"Ver todos os colaboradores" link navigates to the full collaborators list', async ({ page }) => {
    const link = page.getByText('Ver todos os colaboradores');
    const emptyState = page.getByText('Nenhum colaborador cadastrado');

    // Wait for the collaborators list to finish loading - it shows either the
    // "Ver todos" link or the empty state, never neither
    await expect(link.or(emptyState)).toBeVisible({ timeout: 15000 });

    const hasLink = await link.isVisible();
    test.skip(!hasLink, 'Nenhum colaborador cadastrado para exibir o link "Ver todos os colaboradores"');

    await link.click();
    await page.waitForURL('**/colaboradores');
  });
});
