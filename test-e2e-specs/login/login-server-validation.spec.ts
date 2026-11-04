import { test, expect } from '../fixtures';

test.describe('Login - Server Validation & Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('credenciais inválidas (401) mostram erro e reabilitam botão', async ({ page }) => {
    await page.route('**/auth/login', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Email ou senha inválidos' })
        });
      } else {
        route.continue();
      }
    });

    await page.getByPlaceholder('Insira seu email').fill('usuario@invalido.com');
    await page.getByPlaceholder('Insira sua senha').fill('SenhaErrada123');
    await page.getByRole('button', { name: /Entrar/i }).click();

    // Deve mostrar toast de erro
    await expect(page.locator('[role="alert"]').first()).toBeVisible({ timeout: 5000 });

    // Botão deve ser reabilitado para nova tentativa
    await expect(page.locator('form button[type="submit"]')).toBeEnabled({ timeout: 5000 });

    // Não deve navegar para o dashboard
    expect(page.url()).not.toContain('/dashboard');
  });

  test('conta bloqueada (403) mostra erro e reabilita botão', async ({ page }) => {
    await page.route('**/auth/login', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Conta bloqueada ou sem permissão' })
        });
      } else {
        route.continue();
      }
    });

    await page.getByPlaceholder('Insira seu email').fill('bloqueado@test.com');
    await page.getByPlaceholder('Insira sua senha').fill('SenhaTest123');
    await page.getByRole('button', { name: /Entrar/i }).click();

    await expect(page.locator('[role="alert"]').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('form button[type="submit"]')).toBeEnabled({ timeout: 5000 });
    expect(page.url()).not.toContain('/dashboard');
  });

  test('erro do servidor (500) mostra erro e reabilita botão', async ({ page }) => {
    await page.route('**/auth/login', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Erro interno do servidor' })
        });
      } else {
        route.continue();
      }
    });

    await page.getByPlaceholder('Insira seu email').fill('usuario@test.com');
    await page.getByPlaceholder('Insira sua senha').fill('SenhaTest123');
    await page.getByRole('button', { name: /Entrar/i }).click();

    await expect(page.locator('[role="alert"]').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('form button[type="submit"]')).toBeEnabled({ timeout: 5000 });
    expect(page.url()).not.toContain('/dashboard');
  });

  test('timeout de rede mostra erro e reabilita botão', async ({ page }) => {
    await page.route('**/auth/login', route => {
      if (route.request().method() === 'POST') {
        setTimeout(() => route.abort('timedout'), 5000);
      } else {
        route.continue();
      }
    });

    await page.getByPlaceholder('Insira seu email').fill('usuario@test.com');
    await page.getByPlaceholder('Insira sua senha').fill('SenhaTest123');
    await page.getByRole('button', { name: /Entrar/i }).click();

    await expect(page.locator('[role="alert"]').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('form button[type="submit"]')).toBeEnabled({ timeout: 5000 });
  });

  test('campo de email retém valor após falha no login', async ({ page }) => {
    const testEmail = 'email-retido@test.com';

    await page.route('**/auth/login', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Credenciais inválidas' })
        });
      } else {
        route.continue();
      }
    });

    await page.getByPlaceholder('Insira seu email').fill(testEmail);
    await page.getByPlaceholder('Insira sua senha').fill('SenhaErrada');
    await page.getByRole('button', { name: /Entrar/i }).click();

    await expect(page.locator('[role="alert"]').first()).toBeVisible({ timeout: 5000 });

    // Email deve ser mantido para facilitar a correção
    await expect(page.getByPlaceholder('Insira seu email')).toHaveValue(testEmail);
  });
});
