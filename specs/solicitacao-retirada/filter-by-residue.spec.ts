// spec: specs/solicitacao-retirada/solicitacoes-retirada.plan.md
// seed: specs/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Request Filtering Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // 🔐 LOGIN REAL (fluxo de usuário)// 🔐 1. LOGIN
    await page.goto('http://localhost:3000');

    await page.getByPlaceholder('Insira seu email')
      .fill(process.env.E2E_EMAIL!);

    await page.getByPlaceholder('Insira sua senha')
      .fill(process.env.E2E_PASSWORD!);

    await page.getByRole('button', { name: /Entrar/i }).click();

    // await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(3000);
  });
  
  test('Verify different filters show different results', async ({ page }) => {
    // Navigate to solicitacoes-retirada page
    await page.goto('http://localhost:3000/solicitacoes-retirada');
    await page.waitForTimeout(3000);

    // Helper function to count requests for a filter
    const getFilteredRequestCount = async (radioId: string) => {
      await page.getByText('Filtrar por resíduo').click();
      await page.locator(`[id="${radioId}"]`).click();
      await page.waitForTimeout(1000);
      return await page.locator('[class*="cursor-pointer"] p:has-text("Aberto")').count();
    };

    // Test that different filters return different counts
    const rs = await getFilteredRequestCount('0');
    const grandesVolumesCount = await getFilteredRequestCount('1'); // Grandes Volumes
    const construcaoCount = await getFilteredRequestCount('2');      // Resíduos de Construção  
    const mix = await getFilteredRequestCount('3');
    const podas = await getFilteredRequestCount('4');
    const recicaveisCount = await getFilteredRequestCount('5');      // Recicláveis

    // Verify that we have different counts (proving filtering works)
    console.log(`Residuos Comuns: ${rs}, Grandes Volumes: ${grandesVolumesCount}, Construção: ${construcaoCount}, Recicláveis: ${recicaveisCount}, 
      Mix: ${mix}, Podas: ${podas}`);
    
    // At least one filter should have a different count than the others
    const counts = [rs, grandesVolumesCount, construcaoCount, recicaveisCount, mix, podas];
    const uniqueCounts = new Set(counts);
    expect(uniqueCounts.size).toBeGreaterThan(1);
    
    console.log('✅ Different filters show different result counts - filtering is working correctly');
  });
});