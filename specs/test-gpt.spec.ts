import { test, expect } from '@playwright/test';

test.describe('Criar Rota - Fluxo E2E', () => {
    test.beforeEach(async ({ page }) => {
    // 🔐 LOGIN REAL (fluxo de usuário)// 🔐 1. LOGIN
    await page.goto('http://localhost:3000');

    await page.getByPlaceholder('Insira seu email')
      .fill(process.env.E2E_EMAIL!);

    await page.getByPlaceholder('Insira sua senha')
      .fill(process.env.E2E_PASSWORD!);

    await page.getByRole('button', { name: /Entrar/i }).click();

    // ✅ Espera efeito do login (NÃO localStorage)
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  test('Usuário cria uma rota simples com sucesso', async ({ page }) => {

    // 🔐 1. LOGIN
    await page.goto('http://localhost:3000');

    await page.getByPlaceholder('Insira seu email')
      .fill(process.env.E2E_EMAIL!);

    await page.getByPlaceholder('Insira sua senha')
      .fill(process.env.E2E_PASSWORD!);

    await page.getByRole('button', { name: /Entrar/i }).click();

    // ✅ Espera efeito do login (NÃO localStorage)
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // 🧭 2. IR PARA CRIAR ROTA
    await page.goto('http://localhost:3000/criar-rota');

    const routeNameInput =
      page.getByPlaceholder('Digite o nome para a rota');

    await expect(routeNameInput).toBeVisible({ timeout: 20000 });

    // 📝 3. CRIAR ROTA
    await routeNameInput.fill('Rota Centro');

    await page.getByText('Seg', { exact: true }).click();

    await page.getByRole('button', { name: /Finalizar/i }).click();

    // ✅ 4. VALIDAÇÃO FINAL
    await page.waitForURL('**/rotas', { timeout: 15000 });

    await expect(page.getByText('Rota Centro')).toBeVisible();
  });

});
