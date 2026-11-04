import { test, expect } from '../fixtures';

test.describe('Cadastrar Colaborador - Server Validation & Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.getByPlaceholder('Insira seu email').fill(process.env.E2E_EMAIL!);
    await page.getByPlaceholder('Insira sua senha').fill(process.env.E2E_PASSWORD!);
    await page.getByRole('button', { name: /Entrar/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 15_000 });

    await page.goto('http://localhost:3000/cadastrar-colaborador');
    await page.waitForLoadState('networkidle');
  });

  test('CPF duplicado (409) mostra erro e mantém formulário preenchido', async ({ page }) => {
    const cpfTeste = '111.222.333-44';

    // Simula o backend rejeitar o CPF como duplicado.
    // O endpoint real é POST http://localhost:8080/auth/register/employee (sem /api/).
    await page.route('**/auth/register/employee', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'CPF já cadastrado' })
        });
      } else {
        route.continue();
      }
    });

    await page.getByPlaceholder('Digite o nome do colaborador').fill('Colaborador Duplicado Teste');
    await page.getByPlaceholder('Digite o CPF do colaborador').fill(cpfTeste);
    await page.locator('form button[type="submit"]').click();

    // Deve mostrar toast de erro
    await expect(page.locator('[role="alert"]').first()).toBeVisible({ timeout: 5000 });

    // Formulário deve manter os valores (não foi limpo)
    await expect(page.getByPlaceholder('Digite o CPF do colaborador')).toHaveValue(cpfTeste);

    // Não deve ter navegado para outra página
    expect(page.url()).toContain('/cadastrar-colaborador');
  });

  test('erro do servidor (500) mostra erro e reabilita botão', async ({ page }) => {
    await page.route('**/auth/register/employee', route => {
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

    await page.getByPlaceholder('Digite o nome do colaborador').fill('Colaborador Erro 500');
    await page.getByPlaceholder('Digite o CPF do colaborador').fill('555.666.777-88');
    await page.locator('form button[type="submit"]').click();

    // Deve mostrar toast de erro
    await expect(page.locator('[role="alert"]').first()).toBeVisible({ timeout: 5000 });

    // Botão deve ser reabilitado para nova tentativa
    await expect(page.locator('form button[type="submit"]')).toBeEnabled({ timeout: 5000 });

    // Deve permanecer na página de cadastro
    expect(page.url()).toContain('/cadastrar-colaborador');
  });

  test('timeout de rede mostra erro e reabilita botão', async ({ page }) => {
    await page.route('**/auth/register/employee', route => {
      if (route.request().method() === 'POST') {
        setTimeout(() => route.abort('timedout'), 5000);
      } else {
        route.continue();
      }
    });

    await page.getByPlaceholder('Digite o nome do colaborador').fill('Colaborador Timeout Teste');
    await page.getByPlaceholder('Digite o CPF do colaborador').fill('999.888.777-66');
    await page.locator('form button[type="submit"]').click();

    await expect(page.locator('[role="alert"]').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('form button[type="submit"]')).toBeEnabled({ timeout: 5000 });
  });

  test('recuperação: corrigir dados e reenviar com sucesso', async ({ page }) => {
    // Primeira tentativa: submete com nome muito curto (erro client-side)
    await page.getByPlaceholder('Digite o nome do colaborador').fill('ab');
    await page.getByPlaceholder('Digite o CPF do colaborador').fill('123.456.789-10');
    await page.locator('form button[type="submit"]').click();

    // Erro de validação client-side deve aparecer
    await expect(page.getByText(/mínimo/i)).toBeVisible({ timeout: 5000 });

    // Corrige o nome e reenvia (sem mock — bate no backend real)
    const nomeFinal = `Colaborador Recuperação ${Date.now()}`;
    await page.getByPlaceholder('Digite o nome do colaborador').fill(nomeFinal);
    await page.locator('form button[type="submit"]').click();

    // Após sucesso, navega para a lista de colaboradores
    await page.waitForURL('**/veiculos-colaboradores', { timeout: 15_000 });
    expect(page.url()).toContain('/veiculos-colaboradores');
  });
});
