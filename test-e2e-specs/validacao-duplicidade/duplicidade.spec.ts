/**
 * Testes focados em validação de dados duplicados (409 Conflict).
 *
 * Padrão de cada teste:
 *  1. Mocka o endpoint para retornar 409
 *  2. Preenche o formulário com dados válidos (inclusive o campo duplicado)
 *  3. Envia o formulário
 *  4. Verifica que o toast de erro aparece
 *  5. Verifica que o campo com o valor duplicado é MANTIDO (formulário não foi limpo)
 *  6. Verifica que a página não navegou para outra rota (operação foi bloqueada)
 */

import { test, expect } from '../fixtures';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

async function fazerLogin(page: any) {
  await page.goto('http://localhost:3000');
  await page.getByPlaceholder('Insira seu email').fill(process.env.E2E_EMAIL!);
  await page.getByPlaceholder('Insira sua senha').fill(process.env.E2E_PASSWORD!);
  await page.getByRole('button', { name: /Entrar/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 15_000 });
}

// ─────────────────────────────────────────────
// Veículo — campos com unicidade
// ─────────────────────────────────────────────

test.describe('Cadastro de Veículo — dados duplicados', () => {
  test.beforeEach(async ({ page }) => {
    await fazerLogin(page);
    await page.goto('http://localhost:3000/cadastrar-veiculo');
    await page.waitForLoadState('networkidle');
  });

  test('placa duplicada (409) mostra erro e mantém a placa preenchida', async ({ page }) => {
    const placaDuplicada = 'DUP-0001';

    // Mocka o POST /auth/register/vehicle para simular placa já existente no banco
    await page.route('**/auth/register/vehicle', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Placa já cadastrada' })
        });
      } else {
        route.continue();
      }
    });

    await page.getByPlaceholder('Digite o nome do veículo').fill('Caminhão Duplicado');
    await page.getByPlaceholder('Digite a placa').fill(placaDuplicada);
    await page.getByPlaceholder('Digite a emissão').fill('2.5');
    await page.getByPlaceholder('Digite o consumo').fill('0.12');
    await page.getByPlaceholder('Digite o email').fill(`placa-dup-${Date.now()}@test.com`);
    await page.getByPlaceholder('Digite a senha', { exact: true }).fill('Senha@123');
    await page.getByPlaceholder('Digite a senha novamente').fill('Senha@123');

    await page.locator('form button[type="submit"]').click();

    // Toast de erro deve aparecer
    await expect(page.locator('[role="alert"]').first()).toBeVisible({ timeout: 5_000 });

    // A placa deve ser mantida no campo — o usuário precisa corrigir só ela
    await expect(page.getByPlaceholder('Digite a placa')).toHaveValue(placaDuplicada);

    // Não deve ter navegado para /veiculos
    expect(page.url()).toContain('/cadastrar-veiculo');
  });

  test('email de login duplicado (409) mostra erro e mantém o email preenchido', async ({ page }) => {
    const emailDuplicado = 'motorista-existente@coleta.com';

    // O email é o login do motorista/veículo — deve ser único no sistema
    await page.route('**/auth/register/vehicle', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Email já cadastrado' })
        });
      } else {
        route.continue();
      }
    });

    await page.getByPlaceholder('Digite o nome do veículo').fill('Caminhão Email Dup');
    await page.getByPlaceholder('Digite a placa').fill(`EML-${Date.now().toString().slice(-4)}`);
    await page.getByPlaceholder('Digite a emissão').fill('2.5');
    await page.getByPlaceholder('Digite o consumo').fill('0.12');
    await page.getByPlaceholder('Digite o email').fill(emailDuplicado);
    await page.getByPlaceholder('Digite a senha', { exact: true }).fill('Senha@123');
    await page.getByPlaceholder('Digite a senha novamente').fill('Senha@123');

    await page.locator('form button[type="submit"]').click();

    // Toast de erro deve aparecer
    await expect(page.locator('[role="alert"]').first()).toBeVisible({ timeout: 5_000 });

    // O email deve ser mantido no campo — o usuário precisa trocar só o email
    await expect(page.getByPlaceholder('Digite o email')).toHaveValue(emailDuplicado);

    // Deve permanecer na página de cadastro
    expect(page.url()).toContain('/cadastrar-veiculo');
  });
});

// ─────────────────────────────────────────────
// Colaborador — campos com unicidade
// ─────────────────────────────────────────────

/**
 * Cadastrar um colaborador com um CPF que JÁ existe deve ser REJEITADO com erro.
 *
 * Este teste asserta o comportamento CORRETO: ao enviar um CPF já cadastrado, o
 * sistema deve exibir um erro e NÃO concluir o cadastro (não redirecionar para a
 * lista com toast de sucesso).
 *
 * ⚠️  ESTADO ATUAL: o backend NÃO impõe unicidade de CPF (verificado na API — o
 *     mesmo CPF gera 201 Created múltiplas vezes; a base já tem dezenas de CPFs
 *     idênticos). Portanto ESTE TESTE FALHA HOJE, escancarando o bug: o cadastro
 *     é aceito quando deveria ser recusado. Quando o backend passar a rejeitar
 *     CPF duplicado, o teste passará a verde.
 *
 * Nenhum código de frontend/backend é modificado — o teste apenas exige o
 * comportamento esperado.
 */
test.describe('Cadastro de Colaborador — CPF duplicado deve dar erro', () => {
  // CPF de um colaborador que JÁ existe na base (Maria Silva, armazenado como
  // "98765432100"). Usamos o formato com máscara que o formulário aplica.
  const CPF_JA_CADASTRADO = '987.654.321-00';

  // O nome só pode conter letras/espaços (validação client-side rejeita dígitos),
  // então geramos um sufixo único mapeando cada dígito do timestamp para uma letra.
  const sufixoUnico = Date.now().toString().split('').map((d) => 'abcdefghij'[+d]).join('');
  const nomeDoRegistroCriado = `Dup Cpf Doc ${sufixoUnico}`;

  test.beforeEach(async ({ page }) => {
    await fazerLogin(page);
  });

  // Limpa qualquer colaborador duplicado que o cadastro (indevidamente) tenha
  // criado, para não poluir a base — roda mesmo quando o teste falha.
  test.afterEach(async ({ page }) => {
    try {
      const me = await page.request.get('http://localhost:8080/auth/me');
      const cityId = (await me.json()).id;
      const resp = await page.request.get(
        `http://localhost:8080/user/${cityId}/city/employees`
      );
      const employees = await resp.json();
      const criados = employees.filter((e: any) => e.name === nomeDoRegistroCriado);
      for (const emp of criados) {
        await page.request.delete(`http://localhost:8080/user/${emp.id}`);
      }
    } catch {
      // limpeza é best-effort; não deve derrubar o teste
    }
  });

  test('CPF já cadastrado deve exibir erro e NÃO concluir o cadastro', async ({ page }) => {
    // Fluxo real do usuário: parte da página /veiculos-colaboradores e clica em
    // "Cadastrar novo" na seção de Colaboradores (o último botão com esse nome;
    // o primeiro pertence à seção Veículos).
    await page.goto('http://localhost:3000/veiculos-colaboradores');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Cadastrar novo' }).last().click();
    await page.waitForURL('**/cadastrar-colaborador', { timeout: 10_000 });
    await page.waitForLoadState('networkidle');

    // Preenche com um CPF que JÁ pertence a outro colaborador cadastrado.
    await page.getByPlaceholder('Digite o nome do colaborador').fill(nomeDoRegistroCriado);
    await page.getByPlaceholder('Digite o CPF do colaborador').fill(CPF_JA_CADASTRADO);
    await page.locator('form button[type="submit"]').click();

    // ESPERADO: um erro deve ser exibido informando que o CPF já existe.
    // (Miramos o alert que contém o texto do erro, ignorando alerts vazios.)
    await expect(
      page.getByRole('alert').filter({ hasText: /erro|duplicad|já cadastrad|já existe|CPF/i }).first()
    ).toBeVisible({ timeout: 10_000 });

    // ESPERADO: o cadastro NÃO deve ser concluído — deve permanecer no formulário
    // e não navegar para a lista de colaboradores.
    expect(page.url()).toContain('/cadastrar-colaborador');
    await expect(page.getByText(/Colaborador cadastrado/i)).toHaveCount(0);
  });
});
