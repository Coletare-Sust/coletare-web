import { test, expect } from '../fixtures';

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

    // ✅ 2. Heading/título da página está visível
    // ✅ 3. Lista/tabela de colaboradores existe
    // A página não usa <table>/<list>/data-testid - cada colaborador é
    // renderizado como um InfoCard (src/app/(authenticated)/veiculos-colaboradores/
    // components/InfoCard/infoCard.tsx), um <div> com essas classes.
    const collaboratorsItems = page.locator(
      'div.rounded-lg.border.border-greenBlue-600'
    );

    await expect(collaboratorsItems.first()).toBeVisible();

    // ✅ 5. Interação básica: abrir o menu "mais opções" do primeiro card
    const moreOptionsBtn = collaboratorsItems.first().locator('span[aria-haspopup="menu"]');
    await moreOptionsBtn.click();

    // O menu deve mostrar as opções de editar/excluir
    await expect(page.getByText('Editar').first()).toBeVisible();
    await expect(page.getByText('Excluir').first()).toBeVisible();
  });

});
