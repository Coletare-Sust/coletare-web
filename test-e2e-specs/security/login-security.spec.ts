/**
 * Testes de segurança da tela de login (/).
 *
 * Pontos vulneráveis cobertos:
 *  1. SQL injection no campo de email deve ser bloqueado no client, sem nenhuma
 *     requisição chegar ao backend
 *  2. Emails malformados (sem @, sem domínio, com espaço, sem TLD) devem ser
 *     rejeitados pela validação client-side
 *  3. Payload de XSS no email deve ser rejeitado
 *  4. O campo de senha nunca pode expor o valor digitado (type="password")
 *  5. Credenciais erradas contra o backend REAL não podem autenticar nem vazar
 *     detalhes — apenas um toast genérico de erro
 *
 * Estes testes rodam SEM sessão (storageState vazio) — são o fluxo de um atacante
 * anônimo na tela de login.
 */

import { test, expect } from '../fixtures';

// Atacante anônimo: nenhuma sessão salva
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Segurança da tela de login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByPlaceholder('Insira seu email')).toBeVisible();
  });

  test('SQL injection no email é bloqueado no client sem disparar requisição', async ({ page }) => {
    let loginDisparado = false;
    await page.route('**/auth/login', route => {
      if (route.request().method() === 'POST') loginDisparado = true;
      route.continue();
    });

    await page.getByPlaceholder('Insira seu email').fill("' OR '1'='1'--");
    await page.getByPlaceholder('Insira sua senha').fill('qualquercoisa1');
    await page.getByRole('button', { name: /Entrar/i }).click();

    // Validação client-side deve barrar o formato antes de qualquer requisição
    await expect(page.getByText('Insira um e-mail válido')).toBeVisible();
    await page.waitForTimeout(1000);
    expect(loginDisparado).toBe(false);
    expect(page.url()).not.toContain('/dashboard');
  });

  test('payload de XSS no email é rejeitado pela validação', async ({ page }) => {
    await page.getByPlaceholder('Insira seu email').fill('<script>alert(1)</script>@x.com');
    await page.getByPlaceholder('Insira sua senha').fill('qualquercoisa1');
    await page.getByRole('button', { name: /Entrar/i }).click();

    await expect(page.getByText('Insira um e-mail válido')).toBeVisible();
    expect(page.url()).not.toContain('/dashboard');
  });

  test('emails malformados são rejeitados pela validação client-side', async ({ page }) => {
    const emailsInvalidos = [
      'plainaddress',        // sem @
      'user@',               // sem domínio
      '@domain.com',         // sem parte local
      'user @domain.com',    // espaço na parte local
      'user@domain',         // sem TLD
    ];

    const emailInput = page.getByPlaceholder('Insira seu email');

    for (const email of emailsInvalidos) {
      await emailInput.fill(email);
      await emailInput.blur();
      await expect(page.getByText('Insira um e-mail válido')).toBeVisible();
    }
  });

  test('campo de senha não expõe o valor digitado', async ({ page }) => {
    const senhaInput = page.getByPlaceholder('Insira sua senha');

    await senhaInput.fill('SenhaSecreta123');

    // O input precisa ser type="password" — o texto nunca fica visível na tela
    await expect(senhaInput).toHaveAttribute('type', 'password');
  });

  test('credenciais erradas no backend real não autenticam e mostram erro genérico', async ({ page }) => {
    // Sem mock: bate no backend real com uma senha errada
    await page.getByPlaceholder('Insira seu email').fill(process.env.E2E_EMAIL!);
    await page.getByPlaceholder('Insira sua senha').fill('SenhaErrada999');
    await page.getByRole('button', { name: /Entrar/i }).click();

    // Deve mostrar um erro (toast) e permanecer fora do dashboard
    await expect(page.locator('[role="alert"]').first()).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(1000);
    expect(page.url()).not.toContain('/dashboard');

    // O botão volta a ficar habilitado para nova tentativa
    await expect(page.locator('form button[type="submit"]')).toBeEnabled({ timeout: 5000 });
  });
});
