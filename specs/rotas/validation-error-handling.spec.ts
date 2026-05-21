// spec: specs/criar-excluir-rota/criar-rota.plan.md
// seed: specs/seed.spec.ts

import { expect, test } from '@playwright/test';

async function login(page: any) {
  await page.goto('http://localhost:3000');
  await page.getByPlaceholder('Insira seu email').fill(process.env.E2E_EMAIL!);
  await page.getByPlaceholder('Insira sua senha').fill(process.env.E2E_PASSWORD!);
  await page.getByRole('button', { name: /Entrar/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 30_000 });
}

async function addAddress(page: any, inputSelector: string, address: string) {
  const addressInput = page.locator(inputSelector);
  await addressInput.click();
  await addressInput.fill(address);
  await expect(page.locator('.pac-item').first()).toBeVisible({ timeout: 10_000 });
  await page.locator('.pac-item').first().click();
}

test.describe('Route Validation and Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('shows required name error when submitting without a route name', async ({ page }) => {
    // Step 1: Open the create route page
    await page.goto('/criar-rota');

    // Step 2: Select one collection day and add two valid addresses
    await page.getByText('Seg', { exact: true }).click();
    await page.getByText('Adicionar mais um endereço').click();
    await addAddress(page, '#address-0', 'Av. Dantas Barreto, Recife');
    await addAddress(page, '#address-1', 'Rua da Aurora, Recife');

    // Step 3: Submit with the route name empty
    await page.getByRole('button', { name: 'Finalizar' }).click();

    // Step 4: Verify the validation messages are shown and the form stays open
    await expect(page.getByText('Revise os campos')).toBeVisible();
    await expect(page.getByText('Nome da rota é obrigatório')).toBeVisible();
    await expect(page).toHaveURL(/\/criar-rota$/);
  });

  test('shows required day error when submitting without selecting collection days', async ({ page }) => {
    // Step 1: Open the create route page
    await page.goto('/criar-rota');

    // Step 2: Fill the route name and add two valid addresses
    await page.getByPlaceholder('Digite o nome para a rota').fill('Rota Sem Dias');
    await page.getByText('Adicionar mais um endereço').click();
    await addAddress(page, '#address-0', 'Av. Dantas Barreto, Recife');
    await addAddress(page, '#address-1', 'Rua da Aurora, Recife');

    // Step 3: Submit without selecting any collection day
    await page.getByRole('button', { name: 'Finalizar' }).click();

    // Step 4: Verify the validation messages are shown and the form stays open
    await expect(page.getByText('Revise os campos')).toBeVisible();
    await expect(page.getByText('Selecione ao menos um dia')).toBeVisible();
    await expect(page).toHaveURL(/\/criar-rota$/);
  });
});
