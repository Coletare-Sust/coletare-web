import { test, expect } from '@playwright/test';

test.describe('Colaboradores Page (E2E)', () => {

  test.beforeEach(async ({ page }) => {
    // 🔐 LOGIN REAL (fluxo de usuário)// 🔐 1. LOGIN
    await page.goto('http://localhost:3000');

    await page.getByPlaceholder('Insira seu email')
      .fill(process.env.E2E_EMAIL!);

    await page.getByPlaceholder('Insira sua senha')
      .fill(process.env.E2E_PASSWORD!);

    await page.getByRole('button', { name: /Entrar/i }).click();

    // ✅ Espera efeito do login (NÃO localStorage)
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  test('Authenticated user can view collaborators list and interact with page', async ({ page }) => {
    // 👉 Ação principal do usuário
    await page.goto('http://localhost:3000/veiculos-colaboradores');
    await page.goto('http://localhost:3000/colaboradores');

    // ✅ 1. Página correta carregou
    await page.goto('/colaboradores');

  // espere o loading sumir
    await expect(page.getByTestId('loading')).toBeHidden({
      timeout: 30_000,
    });

    // agora sim o conteúdo
    await expect(
      page.getByRole('heading', { name: /todos os colaboradores/i })
    ).toBeVisible();

    await expect(
      page.getByTestId('collaborators-list')
    ).toBeVisible();
    // ✅ 2. Heading/título da página está visível
    // ✅ 3. Lista/tabela de colaboradores existe
    // (use o seletor que fizer sentido no seu HTML real)
    const collaboratorsList =
      page.getByRole('table')
        .or(page.getByRole('list'))
        .or(page.locator('[data-testid="collaborators-list"]'));

    await expect(collaboratorsList.first()).toBeVisible();

    // ✅ 4. Deve haver pelo menos 1 colaborador renderizado
    const collaboratorsItems = page.locator(
      'tr, li, [data-testid="collaborator-item"]'
    );

    await expect(collaboratorsItems.first()).toBeVisible();

    // ✅ 5. Interação básica (exemplo: clicar em um colaborador)
    await collaboratorsItems.first().click();

    // Exemplo de comportamento esperado após interação
    await expect(
      page.getByRole('dialog').or(page.getByText(/detalhes|informações/i))
    ).toBeVisible();
  });

});
