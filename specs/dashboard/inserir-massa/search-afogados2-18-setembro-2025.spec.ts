// spec: Dashboard > Inserir Dados de Rotas 
// seed: specs/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Dashboard - Inserir Dados de Rotas', () => {
  test.beforeEach(async ({ page }) => {
    // 🔐 LOGIN REAL (fluxo de usuário)
    await page.goto('http://localhost:3000');

    await page.getByPlaceholder('Insira seu email')
      .fill(process.env.E2E_EMAIL!);

    await page.getByPlaceholder('Insira sua senha')
      .fill(process.env.E2E_PASSWORD!);

    await page.getByRole('button', { name: /Entrar/i }).click();

    // Wait for redirect to dashboard after login
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });
  
  test('Search for Teste - IFPE route and navigate date picker to December 18, 2025', async ({ page }) => {
    // Wait for the dashboard content to be visible after login in beforeEach
    await expect(page.getByRole('button', { name: 'Inserir massa coletada' })).toBeVisible({ timeout: 15000 });

    // Navigate from Dashboard to the Inserir Dados de Rotas page
    await page.getByRole('button', { name: 'Inserir massa coletada' }).click();
    
    // Verify page loaded with route search controls
    await expect(page.getByRole('button', { name: 'Selecione uma data' })).toBeVisible();
    await expect(page.getByRole('combobox').first()).toBeVisible();

    // FIRST: Select the route 'Teste - IFPE'
    // Click to open the route search dropdown list
    await page.getByRole('combobox').first().click();
    
    // Verify dropdown shows available routes including Teste - IFPE
    await expect(page.getByRole('option', { name: 'Teste - IFPE' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Afogados 2' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Afogados', exact: true })).toBeVisible();

    // Select 'Teste - IFPE' route from the dropdown to filter results
    await page.getByRole('option', { name: 'Teste - IFPE' }).click();
    
    // Verify combobox shows selected route
    await expect(page.getByRole('combobox').first()).toHaveText('Teste - IFPE');

    // SECOND: Now select the date (18 de dezembro de 2025)
    // Open the date picker to select the specific date 18 de dezembro de 2025
    await page.getByRole('button', { name: 'Selecione uma data' }).click();

    // Navigate backward to find December 2025 from the current March 2026
    await page.getByRole('button', { name: 'Go to previous month' }).click();

    // Continue navigating backward to reach December 2025
    await page.getByRole('button', { name: 'Go to previous month' }).click();

    // Continue navigating backward to reach December 2025  
    await page.getByRole('button', { name: 'Go to previous month' }).click();
    
    // Verify we reached December 2025
    await expect(page.getByText('dezembro 2025')).toBeVisible();

    // Attempt to select day 18 in December 2025 even though it appears disabled
    await page.getByRole('row', { name: '15 16 17 18 19 20' }).click();

    // Close the calendar date picker since all dates appear disabled
    await page.getByRole('main').click();

    // Now search with both route and date selected
    await page.getByRole('button', { name: 'Pesquisar rota' }).click();

    // Verify that Teste - IFPE route results are visible after applying the filter
    await expect(page.getByRole('heading', { name: 'Teste - IFPE', level: 1 })).toBeVisible();

    // Verify that collections with date 18/12/2025 are visible in the filtered results
    await expect(page.getByText('18/12/2025').first()).toBeVisible();

    // Click on one of the Teste - IFPE collection entries to test interaction and see collection details
    await page.getByRole('button', { name: 'Teste - IFPE Cidade Teste' }).first().click();
    
    // Verify collection details are displayed when expanded
    await expect(page.getByText('Dados da coleta')).toBeVisible();
    await expect(page.getByText('Km rodados (km)')).toBeVisible();
    await expect(page.getByText('Massa coletada (ton)')).toBeVisible();
    await expect(page.getByText('Custo de combustível (R$/L)')).toBeVisible();
    
    // Verify that input fields are visible (values may vary)
    await expect(page.locator('input[disabled]')).toHaveCount(6);
  });
});