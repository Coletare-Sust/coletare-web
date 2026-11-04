import { test, expect } from '../fixtures';

test.describe('Cadastrar Aviso - Server Validation & Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.getByPlaceholder('Insira seu email').fill(process.env.E2E_EMAIL!);
    await page.getByPlaceholder('Insira sua senha').fill(process.env.E2E_PASSWORD!);
    await page.getByRole('button', { name: /Entrar/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 15_000 });

    await page.goto('http://localhost:3000/avisos/cadastrar');
    await page.waitForLoadState('networkidle');
  });

  // Helper: preenche título, descrição e faz upload de imagem para passar
  // pela validação client-side e chegar à requisição de rede.
  async function preencherFormulario(page: any) {
    await page.getByPlaceholder('Inserir título').fill(`Aviso Server Teste ${Date.now()}`);
    await page.getByPlaceholder('Inserir descrição').fill('Descrição de teste para validação server-side.');

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText('anexar imagem').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles([`${process.cwd()}/public/coletare-logo.png`]);
    await expect(page.getByAltText('preview')).toBeVisible();
  }

  test('erro do servidor (500) mostra erro e reabilita botão', async ({ page }) => {
    // Endpoint real: POST http://localhost:8080/warning/{cityId}/city
    await page.route('**/warning/*/city', route => {
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

    await preencherFormulario(page);

    const titulo = await page.getByPlaceholder('Inserir título').inputValue();
    await page.getByRole('button', { name: 'Realizar post' }).click();

    // Deve mostrar toast de erro
    await expect(page.locator('[role="alert"]').first()).toBeVisible({ timeout: 5000 });

    // Botão deve ser reabilitado (finally no handleCreate sempre executa setLoading(false))
    await expect(page.getByRole('button', { name: 'Realizar post' })).toBeEnabled({ timeout: 5000 });

    // Formulário deve manter os valores preenchidos
    await expect(page.getByPlaceholder('Inserir título')).toHaveValue(titulo);

    // Não deve ter navegado para /avisos
    expect(page.url()).toContain('/avisos/cadastrar');
  });

  test('timeout de rede mostra erro e reabilita botão', async ({ page }) => {
    await page.route('**/warning/*/city', route => {
      if (route.request().method() === 'POST') {
        setTimeout(() => route.abort('timedout'), 5000);
      } else {
        route.continue();
      }
    });

    await preencherFormulario(page);
    await page.getByRole('button', { name: 'Realizar post' }).click();

    await expect(page.locator('[role="alert"]').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: 'Realizar post' })).toBeEnabled({ timeout: 5000 });
    expect(page.url()).toContain('/avisos/cadastrar');
  });

  test('submissão sem imagem mostra validação client-side sem chamar API', async ({ page }) => {
    let apiCalled = false;
    await page.route('**/warning/*/city', route => {
      apiCalled = true;
      route.continue();
    });

    await page.getByPlaceholder('Inserir título').fill('Aviso Sem Imagem');
    await page.getByPlaceholder('Inserir descrição').fill('Descrição sem imagem.');
    // Não faz upload de imagem

    await page.getByRole('button', { name: 'Realizar post' }).click();

    // Deve mostrar erro client-side
    await expect(
      page.locator('[role="alert"]').filter({ hasText: /Preencha todos os campos|imagem/i }).first()
    ).toBeVisible({ timeout: 5000 });

    // A API não deve ter sido chamada — erro foi impedido no client
    expect(apiCalled).toBe(false);
  });

  test('submissão sem título mostra validação client-side sem chamar API', async ({ page }) => {
    let apiCalled = false;
    await page.route('**/warning/*/city', route => {
      apiCalled = true;
      route.continue();
    });

    // Preenche só descrição e imagem, sem título
    await page.getByPlaceholder('Inserir descrição').fill('Descrição sem título.');

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText('anexar imagem').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles([`${process.cwd()}/public/coletare-logo.png`]);
    await expect(page.getByAltText('preview')).toBeVisible();

    await page.getByRole('button', { name: 'Realizar post' }).click();

    await expect(
      page.locator('[role="alert"]').filter({ hasText: /Preencha todos os campos/i }).first()
    ).toBeVisible({ timeout: 5000 });

    expect(apiCalled).toBe(false);
  });
});
