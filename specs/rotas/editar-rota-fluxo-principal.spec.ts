// spec: specs/criar-rota/editar-rota.plan.md
// seed: specs/seed.spec.ts

import { expect, test } from '@playwright/test';

test.describe('Editar rota no fluxo de criação', () => {
  test('Editar rota no fluxo de criação', async ({ page }) => {
    test.skip(
      !process.env.E2E_EMAIL || !process.env.E2E_PASSWORD,
      'E2E_EMAIL/E2E_PASSWORD não configurados.'
    );
    const cityId = '5TWzDEnYsQM4HUVigcWajwbAm0g1';
    const initialRouteButton = page.getByRole('button', { name: /Rota Aliança 1/ }).first();
    const editRouteButton = page.getByRole('button', { name: 'Editar rota' });
    const routeNameInput = page.getByRole('textbox', { name: 'Digite o nome para a rota' });
    const finalizeButton = page.getByRole('button', { name: 'Finalizar' });
    const editedRouteButton = page
      .getByRole('button', { name: /Rota Aliança 1 - Editado/ })
      .first();

    await page.goto('/');
    if (await page.getByPlaceholder('Insira seu email').isVisible()) {
      await page.getByPlaceholder('Insira seu email').fill(process.env.E2E_EMAIL!);
      await page.getByPlaceholder('Insira sua senha').fill(process.env.E2E_PASSWORD!);
      await page.getByRole('button', { name: /Entrar/i }).click();
      await expect(page).toHaveURL(/dashboard/, { timeout: 30_000 });
    }

    await page.goto(`/rotas?city=${cityId}`);

    // 1. Acessar /rotas e abrir uma rota existente; clicar em Editar rota
    await initialRouteButton.click();
    await editRouteButton.click();

    await expect(page.getByRole('heading', { name: 'Seta para esquerda Editar rota' })).toBeVisible();
    await expect(routeNameInput).toHaveValue(/Rota Aliança 1/);
    await expect(page.locator('#address-0')).toBeVisible();
    await expect(page.getByText('Adicionar mais um endereço')).toBeVisible();

    // 2. Inspecionar os endereços listados
    await expect(page.locator('#address-0')).toHaveAttribute(
      'placeholder',
      'Digite o endereço ou clique no mapa'
    );

    // 3. Abrir edição de uma rota existente
    await routeNameInput.fill('Rota Aliança 1 - Editado');

    // 4. Alterar o valor do campo Nome (ex.: adicionar sufixo “- Editado”)
    await finalizeButton.click();
    await expect(editedRouteButton).toBeVisible();

    // 5. Abrir edição de uma rota existente
    await editedRouteButton.click();
    await editRouteButton.click();

    // 6. Alternar dias de coleta (ex.: desmarcar um dia e marcar outro)
    await page.locator('div').filter({ hasText: /^Seg$/ }).nth(1).click();
    await page.getByText('Ter', { exact: true }).click();

    // 7. Alterar o período (Manhã/Tarde/Noite)
    await page.getByText('Tarde', { exact: true }).click();

    // 8. Clicar em Finalizar
    await finalizeButton.click();
    await expect(editedRouteButton).toBeVisible();
  });
});
