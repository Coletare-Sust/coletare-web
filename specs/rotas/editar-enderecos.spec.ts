// spec: specs/criar-rota/editar-rota.plan.md
// seed: specs/seed.spec.ts

import { expect, test } from '../fixtures';

test.describe('Editar rota no fluxo de criação', () => {
  test('Editar endereços - adicionar novo endereço', async ({ page }) => {
    test.skip(
      !process.env.E2E_EMAIL || !process.env.E2E_PASSWORD,
      'E2E_EMAIL/E2E_PASSWORD não configurados.'
    );
    const cityId = '5TWzDEnYsQM4HUVigcWajwbAm0g1';
    const routeButton = page.getByRole('button', { name: /Rota Teste/ }).first();
    const editRouteButton = page.getByRole('button', { name: 'Editar rota' });
    const addAddressButton = page.getByRole('img', { name: 'Ícone de adicionar' });
    const finalizeButton = page.getByRole('button', { name: 'Finalizar' });

    await page.goto('/');
    if (await page.getByPlaceholder('Insira seu email').isVisible()) {
      await page.getByPlaceholder('Insira seu email').fill(process.env.E2E_EMAIL!);
      await page.getByPlaceholder('Insira sua senha').fill(process.env.E2E_PASSWORD!);
      await page.getByRole('button', { name: /Entrar/i }).click();
      await expect(page).toHaveURL(/dashboard/, { timeout: 30_000 });
    }

    await page.goto(`/rotas?city=${cityId}`);

    // 1. Abrir edição de uma rota existente
    await routeButton.click();
    await editRouteButton.click();

    // 2. Clicar em “Adicionar mais um endereço”
    await addAddressButton.click();

    // 3. Preencher o novo endereço (digitando ou clicando no mapa) e aguardar validação
    const newAddressInput = page.locator('input[id^="address-"]').last();
    await expect(newAddressInput).toBeVisible();
    await newAddressInput.fill('Rua da Aurora, 100 - Recife, PE, Brazil');
    await page.keyboard.press('Enter');
    await expect(newAddressInput).toHaveValue('Rua da Aurora, 100 - Recife, PE, Brazil');

    // 4. Clicar em Finalizar
    await finalizeButton.click();
  });
  test('Editar endereços - remover endereço', async ({ page }) => {
    test.skip(
      !process.env.E2E_EMAIL || !process.env.E2E_PASSWORD,
      'E2E_EMAIL/E2E_PASSWORD não configurados.'
    );
    const cityId = '5TWzDEnYsQM4HUVigcWajwbAm0g1';
    const routeButton = page.getByRole('button', { name: /Rota Teste/ }).first();
    const editRouteButton = page.getByRole('button', { name: 'Editar rota' });
    const finalizeButton = page.getByRole('button', { name: 'Finalizar' });

    await page.goto('/');
    if (await page.getByPlaceholder('Insira seu email').isVisible()) {
      await page.getByPlaceholder('Insira seu email').fill(process.env.E2E_EMAIL!);
      await page.getByPlaceholder('Insira sua senha').fill(process.env.E2E_PASSWORD!);
      await page.getByRole('button', { name: /Entrar/i }).click();
      await expect(page).toHaveURL(/dashboard/, { timeout: 30_000 });
    }

    await page.goto(`/rotas?city=${cityId}`);

    // 1. Abrir edição de uma rota existente
    await routeButton.click();
    await editRouteButton.click();

    // 2. Remover um endereço usando o ícone de excluir no campo correspondente
    const addressInputs = page.locator('input[id^="address-"]');
    await expect(page.getByRole('heading', { name: /Editar rota/ })).toBeVisible();
    await expect(addressInputs.first()).toBeVisible();
    const countBefore = await addressInputs.count();
    expect(countBefore).toBeGreaterThan(1);
    const lastAddressGroup = page.locator('div.group').last();
    await lastAddressGroup.hover();
    await lastAddressGroup.locator('svg').click();
    await expect(addressInputs).toHaveCount(countBefore - 1);
    await expect(page.getByText('Adicionar mais um endereço')).toBeVisible();

    // 3. Clicar em Finalizar
    await finalizeButton.click();
  });
});
