// spec: specs/solicitacao-retirada/solicitacoes-retirada.plan.md
// seed: specs/seed.spec.ts

import { test, expect } from '../fixtures';

test.describe('Page Load and Initial Display', () => {
  test.beforeEach(async ({ page }) => {
    // 🔐 LOGIN REAL (fluxo de usuário)// 🔐 1. LOGIN
    await page.goto('http://localhost:3000');

    await page.getByPlaceholder('Insira seu email')
      .fill(process.env.E2E_EMAIL!);

    await page.getByPlaceholder('Insira sua senha')
      .fill(process.env.E2E_PASSWORD!);

    await page.getByRole('button', { name: /Entrar/i }).click();

    // ✅ Espera efeito do login (NÃO localStorage)
    // await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(3000);
  });
  test('Display withdrawal requests page successfully', async ({ page }) => {
    // 1. Navigate to /solicitacoes-retirada page
    await page.goto('http://localhost:3000/solicitacoes-retirada');

    // Wait for page to load completely
    await new Promise(f => setTimeout(f, 3 * 1000));

    // 2. Verify main components are rendered - The header shows 'Solicitações de retirada de lixo' title
    await expect(page.getByText('Solicitações de retirada de lixo')).toBeVisible();

    // 1. Navigate to /solicitacoes-retirada page - The sidebar navigation is visible with 'Solicitação de retirada de lixo' highlighted
    // The sidebar is collapsed by default (its text label is hidden via CSS,
    // so it doesn't contribute to the link's accessible name), and the name
    // would also include a live pending-requests badge count that changes as
    // data changes - match on the stable href instead.
    await expect(page.locator('a[href="/solicitacoes-retirada"]').first()).toBeVisible();

    // 2. Verify main components are rendered - A 'Criar nova rota' button with plus icon is visible
    await expect(page.getByRole('button', { name: 'Icon de mais Criar nova rota' })).toBeVisible();

    // 2. Verify main components are rendered - A Google Maps component is displayed on the left side
    await expect(page.getByRole('region', { name: 'Map' })).toBeVisible();

    // 2. Verify main components are rendered - The request details card is displayed on the right side showing 'Ponto de lixo em aberto'
    await expect(page.getByText('Ponto de lixo em aberto')).toBeVisible();

    // 2. Verify main components are rendered - The 'Todas as solicitações' section is visible below
    await expect(page.getByText('Todas as solicitações')).toBeVisible();

    // 2. Verify main components are rendered - A 'Filtrar por resíduo' dropdown button is visible
    await expect(page.getByText('Filtrar por')).toBeVisible();

    // 3. Verify the first request details are displayed - The details card displays all information fields using more specific selectors
    // Target the specific elements in the detail card by their unique classes or structure
    await expect(page.locator('span.text-xl.font-medium').filter({ hasText: 'Origem' })).toBeVisible();
    await expect(page.locator('span.text-xl.font-medium').filter({ hasText: 'Solicitante' })).toBeVisible();
    await expect(page.locator('span.text-xl.font-medium').filter({ hasText: 'Contato' })).toBeVisible();
    await expect(page.locator('span.text-xl.font-medium').filter({ hasText: 'Situação' })).toBeVisible();
    await expect(page.locator('span.text-xl.font-medium').filter({ hasText: 'Local' })).toBeVisible();
    await expect(page.locator('span.text-xl.font-medium').filter({ hasText: 'Tipo de Residuo' })).toBeVisible();
    await expect(page.locator('span.text-xl.font-medium').filter({ hasText: 'Data' })).toBeVisible();

    // 3. Verify the first request details are displayed - A message 'Resolva esse e outros pontos em aberto em criar rota de ponto de lixo' is displayed
    await expect(page.getByText('Resolva esse e outros pontos em aberto em')).toBeVisible();
  });
});