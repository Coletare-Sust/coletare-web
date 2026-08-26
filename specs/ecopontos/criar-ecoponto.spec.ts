import { test, expect } from '../fixtures';

const API_URL = 'http://localhost:8080';

test.describe('Criar Ecoponto Page', () => {
  // Nome do ecoponto criado durante um teste — usado para a limpeza no afterEach.
  let ecopontoCriadoNome: string | null = null;

  test.beforeEach(async ({ page }) => {
    ecopontoCriadoNome = null;
    // 🔐 LOGIN REAL (fluxo de usuário)
    await page.goto('http://localhost:3000');

    await page.getByPlaceholder('Insira seu email')
      .fill(process.env.E2E_EMAIL!);

    await page.getByPlaceholder('Insira sua senha')
      .fill(process.env.E2E_PASSWORD!);

    await page.getByRole('button', { name: /Entrar/i }).click();

    // ✅ Espera efeito do login (NÃO localStorage)
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    await page.goto('http://localhost:3000/ecopontos/criar-ecoponto');
    await page.waitForLoadState('networkidle');
  });

  // Remove o ecoponto realmente criado no backend, para nao poluir a base.
  // Best-effort: nunca derruba o teste se a limpeza falhar.
  test.afterEach(async ({ page }) => {
    if (!ecopontoCriadoNome) return;
    try {
      const me = await page.request.get(`${API_URL}/auth/me`);
      const cityId = (await me.json()).id;
      const resp = await page.request.get(`${API_URL}/ecopoint/${cityId}/city`);
      const pontos = await resp.json();
      const criados = pontos.filter((e: any) => e.name === ecopontoCriadoNome);
      for (const e of criados) {
        await page.request.delete(`${API_URL}/ecopoint/${e.id}`);
      }
    } catch {
      // limpeza e best-effort
    }
  });

  test('Form loads with all required fields visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Novo Ecoponto' })).toBeVisible();

    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#address-search')).toBeVisible();
    await expect(page.locator('#lat')).toBeVisible();
    await expect(page.locator('#lng')).toBeVisible();

    await expect(page.getByText('Tipo de Resíduo')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Criar Ecoponto' })).toBeVisible();
  });

  test('Submitting the form without filling required fields shows a validation error', async ({ page }) => {
    await page.getByRole('button', { name: 'Criar Ecoponto' }).click();

    await expect(
      page.getByText('Preencha todos os campos obrigatórios.')
    ).toBeVisible({ timeout: 10_000 });
  });

  test('Successfully creates a new ecoponto end-to-end', async ({ page }) => {
    const ecopontoName = `Ecoponto Teste ${Date.now()}`;

    // Preenche todos os campos obrigatorios do handleSubmit:
    // name + description (campo de endereco) + lat + lng.
    // O tipo de residuo ja vem preenchido por padrao (primeiro da lista).
    await page.locator('#name').fill(ecopontoName);
    await page.locator('#address-search').fill('Rua de Teste E2E, 100 - Recife/PE');
    await page.locator('#lat').fill('-8.0476');
    await page.locator('#lng').fill('-34.8770');

    await expect(page.locator('#name')).toHaveValue(ecopontoName);
    await expect(page.locator('#lat')).toHaveValue('-8.0476');
    await expect(page.locator('#lng')).toHaveValue('-34.8770');

    // Marca para limpeza antes de submeter — o POST persiste no backend
    ecopontoCriadoNome = ecopontoName;

    // Submete (POST /ecopoint/{cityId}/city)
    await page.getByRole('button', { name: 'Criar Ecoponto' }).click();

    // Sucesso: toast e redirect para a lista
    await expect(page.getByText('Ecoponto criado com sucesso!')).toBeVisible({ timeout: 15_000 });
    await page.waitForURL('**/ecopontos', { timeout: 15_000 });

    // Persistencia: o ecoponto recem-criado aparece na lista
    await expect(page.getByText(ecopontoName).first()).toBeVisible({ timeout: 15_000 });
  });

  test('Back arrow navigates back to the ecopontos list', async ({ page }) => {
    await page.getByAltText('Seta').click();

    await page.waitForURL('**/ecopontos');
  });
});
