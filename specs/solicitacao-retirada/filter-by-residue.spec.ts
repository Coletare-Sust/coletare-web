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

    // ✅ Espera efeito do login (NÃO localStorage)
    // await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(3000);
  });
  // test('Filter requests by residue type', async ({ page }) => {
  //   // Navigate to solicitacoes-retirada page
  //   await page.goto('http://localhost:3000/solicitacoes-retirada');

  //   // Wait for page to load completely
  //   // await page.waitForTimeout(3000);

  //   // Helper function to verify filter works correctly
  //   const verifyFilter = async (residueType: string, radioId: string) => {
  //     console.log(`🔍 Testing filter for: ${residueType}`);
      
  //     // Open filter dropdown
  //     await page.getByText('Filtrar por resíduo').click();
      
  //     // Select the residue type by clicking the radio button
  //     await page.locator(`[id="${radioId}"]`).click();
      
  //     // Wait for filter to apply
  //     await page.waitForTimeout(1500);
      
  //     // Verify that requests are filtered correctly
  //     const requestCards = page.locator('[class*="cursor-pointer"] p:has-text("Aberto")');
  //     const requestCount = await requestCards.count();
      
  //     if (requestCount > 0) {
  //       // Check some of the displayed residue types to verify filtering
  //       const residueTypeElements = page.locator('span').filter({ hasText: new RegExp(residueType.replace(/[()]/g, '\\$&'), 'i') });
  //       const matchingCount = await residueTypeElements.count();
        
  //       expect(matchingCount).toBeGreaterThan(0);
  //       console.log(`✅ Filter "${residueType}" working: ${requestCount} requests displayed, ${matchingCount} matching residue types found`);
  //     } else {
  //       console.log(`ℹ️ Filter "${residueType}": No requests found for this residue type`);
  //     }
  //   };

  //   // 1. First verify all filter options are available in the dropdown
  //   await page.getByText('Filtrar por resíduo').click();
    
  //   // Use more specific locators to target only dropdown options
  //   const filterDropdown = page.locator('[role="menu"]').first();
  //   await expect(filterDropdown.getByText('Resíduo comum')).toBeVisible();
  //   await expect(filterDropdown.getByText('Grandes Volumes')).toBeVisible();
  //   await expect(filterDropdown.getByText('Resíduos de Construção')).toBeVisible();
  //   await expect(filterDropdown.getByText('Resíduos Mistos (Mix)')).toBeVisible();
  //   await expect(filterDropdown.getByText('Resíduos de Podas')).toBeVisible();
  //   await expect(filterDropdown.getByText('Recicláveis')).toBeVisible();
    
  //   // Close dropdown by clicking elsewhere
  //   await page.click('main');
  //   await page.waitForTimeout(500);

  //   // 2. Test each residue type filter
  //   await verifyFilter('Resíduo comum', '0');
  //   await verifyFilter('Grandes Volumes', '1');  
  //   await verifyFilter('Resíduos de Construção', '2');
  //   await verifyFilter('Resíduos Mistos (Mix)', '3');
  //   await verifyFilter('Resíduos de Podas', '4');
  //   await verifyFilter('Recicláveis', '5');
  // });

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