import { test, expect } from '../fixtures';

const API_URL = 'http://localhost:8080';

test.describe('Cadastrar Aviso Page', () => {
  // Título do aviso criado durante um teste — usado para a limpeza no afterEach.
  let avisoCriadoTitulo: string | null = null;

  test.beforeEach(async ({ page }) => {
    avisoCriadoTitulo = null;

    // 🔐 LOGIN REAL (fluxo de usuário)
    await page.goto('http://localhost:3000');

    await page.getByPlaceholder('Insira seu email')
      .fill(process.env.E2E_EMAIL!);

    await page.getByPlaceholder('Insira sua senha')
      .fill(process.env.E2E_PASSWORD!);

    await page.getByRole('button', { name: /Entrar/i }).click();

    // ✅ Espera efeito do login (NÃO localStorage)
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    await page.goto('http://localhost:3000/avisos/cadastrar');
    await page.waitForLoadState('networkidle');
  });

  // Remove o aviso realmente criado no backend, para não poluir a base.
  // Best-effort: nunca derruba o teste se a limpeza falhar.
  test.afterEach(async ({ page }) => {
    if (!avisoCriadoTitulo) return;
    try {
      const me = await page.request.get(`${API_URL}/auth/me`);
      const cityId = (await me.json()).id;
      const resp = await page.request.get(`${API_URL}/warning/${cityId}/city`);
      const avisos = await resp.json();
      const criados = avisos.filter((a: any) => a.title === avisoCriadoTitulo);
      for (const a of criados) {
        await page.request.delete(`${API_URL}/warning/${a.id}`);
      }
    } catch {
      // limpeza é best-effort
    }
  });

  test('Form loads with title, fields and submit button visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Criar Novo Aviso' })).toBeVisible();
    await expect(page.getByPlaceholder('Inserir título')).toBeVisible();
    await expect(page.getByPlaceholder('Inserir descrição')).toBeVisible();
    await expect(page.getByText('anexar imagem')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Realizar post' })).toBeVisible();
  });

  test('Submitting an empty form shows a validation error', async ({ page }) => {
    await page.getByRole('button', { name: 'Realizar post' }).click();

    await expect(page.getByRole('alert').filter({ hasText: 'Preencha todos os campos!' }))
      .toBeVisible({ timeout: 10_000 });
  });

  test('Successfully creates a new aviso end-to-end', async ({ page }) => {
    const title = `Aviso Teste ${Date.now()}`;
    const description = 'Descrição de teste gerada automaticamente pelo e2e.';

    // Preenche título e descrição
    await page.getByPlaceholder('Inserir título').fill(title);
    await page.getByPlaceholder('Inserir descrição').fill(description);
    await expect(page.getByPlaceholder('Inserir título')).toHaveValue(title);
    await expect(page.getByPlaceholder('Inserir descrição')).toHaveValue(description);

    // Anexa a imagem (obrigatória: o handleCreate exige title + description + image)
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText('anexar imagem').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles([`${process.cwd()}/public/coletare-logo.png`]);
    await expect(page.getByAltText('preview')).toBeVisible();

    // Marca para limpeza antes de submeter — o POST persiste o aviso no backend
    avisoCriadoTitulo = title;

    // Submete o formulário (POST /warning/{cityId}/city)
    await page.getByRole('button', { name: 'Realizar post' }).click();

    // Sucesso: toast "Postagem criada!" e redirect para a lista de avisos
    await expect(page.getByText('Postagem criada!')).toBeVisible({ timeout: 15_000 });
    await page.waitForURL('**/avisos', { timeout: 15_000 });

    // Persistência: o aviso recém-criado aparece na lista
    await expect(
      page.getByRole('heading', { name: title, exact: true })
    ).toBeVisible({ timeout: 15_000 });
  });

  test('Uploading an image shows a preview', async ({ page }) => {
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText('anexar imagem').click();
    const fileChooser = await fileChooserPromise;

    await fileChooser.setFiles([`${process.cwd()}/public/coletare-logo.png`]);

    await expect(page.getByAltText('preview')).toBeVisible();
  });

  test('Back button navigates to the avisos list', async ({ page }) => {
    await page.locator('form button[type="button"]').first().click();

    await page.waitForURL('**/avisos');
  });
});
