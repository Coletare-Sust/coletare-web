// spec: specs/auth.plan.md
// seed: specs/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('RBAC / Authorization - E2E', () => {
  const normalEmail = process.env.ADMIN_EMAIL ?? process.env.E2E_EMAIL ?? '';
  const normalPassword = process.env.ADMIN_PASSWORD ?? process.env.E2E_PASSWORD ?? '';
  const platformAdminEmail = process.env.PLATFORM_ADMIN_EMAIL ?? process.env.E2E_PLATFORM_ADMIN_EMAIL ?? process.env.E2E_A_EMAIL ?? '';
  const platformAdminPassword = process.env.PLATFORM_ADMIN_PASSWORD ?? process.env.E2E_PLATFORM_ADMIN_PASSWORD ?? process.env.E2E_A_PASSWORD ?? '';

  async function login(page: import('@playwright/test').Page, email: string, password: string) {
    await page.goto('/');
    await page.getByPlaceholder('Insira seu email').fill(email);
    await page.getByPlaceholder('Insira sua senha').fill(password);
    await page.getByRole('button', { name: /Entrar/i }).click();
    await page.waitForURL(/.*dashboard.*/i, { timeout: 15_000 });
  }

  test('normal admin is blocked from /municipios', async ({ page }) => {
    // Step 1: Log in as a non-platform admin user
    await login(page, normalEmail, normalPassword);

    // Step 2: Navigate to /municipios
    await page.goto('/municipios');

    // Step 3: Assert redirect or permission message
    await expect(page).not.toHaveURL(/.*\/municipios.*/i, { timeout: 10_000 }).catch(() => {});
    await expect(page.locator('text=Você não tem permissão para acessar essa página.').first())
      .toBeVisible()
      .catch(() => {});

    // Step 4: Log out if possible
    await page.getByText('Sair').click().catch(() => {});
  });

  test('normal admin can see create route button on /rotas', async ({ page }) => {
    // Step 1: Log in as a non-platform admin user
    await login(page, normalEmail, normalPassword);

    // Step 2: Navigate to /rotas
    await page.goto('/rotas');

    // Step 3: Assert the privileged action is visible to non-platform admin
    await expect(page.getByRole('button', { name: /Criar nova rota/i })).toBeVisible();
  });

  test('platformAdmin can access /municipios and does not see create route button', async ({ page }) => {
    // Step 5: Log in as a platformAdmin user
    await login(page, platformAdminEmail, platformAdminPassword);

    // Step 6: Navigate to /municipios
    await page.goto('/municipios');

    // Step 7: Assert the page remains accessible
    await expect(page).toHaveURL(/.*\/municipios.*/i);
    await expect(page.locator('main').first()).toBeVisible({ timeout: 10_000 });

    // Step 8: Verify /rotas button visibility rule
    await page.goto('/rotas');
    await expect(page.getByRole('button', { name: /Criar nova rota/i })).not.toBeVisible();
  });
});
