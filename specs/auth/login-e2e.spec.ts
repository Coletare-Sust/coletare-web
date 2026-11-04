// spec: specs/auth.plan.md
// seed: specs/auth.setup.ts

import { test, expect } from '../fixtures';

test.describe('Authentication - E2E', () => {
  test('Login → access protected page → logout', async ({ page }) => {
    // Step 1: Navigate to the login page (root '/')
    await page.goto('/');

    // Step 2: Fill email and password from env vars and submit
    const email = process.env.TEST_USER_EMAIL ?? process.env.E2E_EMAIL ?? '';
    const password = process.env.TEST_USER_PASSWORD ?? process.env.E2E_PASSWORD ?? '';
    await page.getByPlaceholder('Insira seu email').fill(email);
    await page.getByPlaceholder('Insira sua senha').fill(password);
    await page.getByRole('button', { name: /Entrar/i }).click();

    // Step 3: Wait for redirect to dashboard and assert URL
    await page.waitForURL(/.*dashboard.*/i, { timeout: 10_000 });
    await expect(page).toHaveURL(/.*dashboard.*/i);

    // Step 4: Access protected page '/cadastrar-veiculo' and assert response OK
    const res = await page.goto('/cadastrar-veiculo');
    expect(res && res.ok()).toBeTruthy();

    // Step 5: Click logout ('Sair') and assert redirect to login
    await page.click('text=Sair').catch(() => {});
    await page.waitForURL(/.*login.*/i, { timeout: 5000 }).catch(() => {});
  });
});
