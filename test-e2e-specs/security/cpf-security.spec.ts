/**
 * Testes de segurança do campo CPF (/cadastrar-colaborador).
 *
 * Pontos vulneráveis cobertos:
 *  1. A máscara deve neutralizar caracteres não numéricos (letras, símbolos, payloads XSS)
 *  2. A máscara deve truncar dígitos excedentes (limite de 11 dígitos)
 *  3. ⚠️ VULNERABILIDADE DOCUMENTADA: o schema valida apenas `min(11)` sobre a string
 *     JÁ MASCARADA ("123.456.789" tem 11 caracteres!), então um CPF INCOMPLETO com
 *     apenas 9 dígitos passa na validação client-side e é enviado ao backend.
 *     (src/validations/registerCollaborator.ts)
 *  4. ⚠️ VULNERABILIDADE DOCUMENTADA: não há validação de dígito verificador — CPFs
 *     matematicamente inválidos como 111.111.111-11 são aceitos e enviados.
 *
 * Os testes 3 e 4 usam `test.fail()`: eles assertam o comportamento SEGURO esperado
 * e hoje falham de propósito, documentando o bug. Quando a validação for corrigida,
 * o Playwright acusará "passed unexpectedly" e o `test.fail()` deve ser removido.
 * As requisições são mockadas — nenhum dado inválido é gravado no banco.
 */

import { test, expect } from '../fixtures';

test.describe('Segurança do campo CPF — cadastrar colaborador', () => {
  test.beforeEach(async ({ page }) => {
    // Sessão autenticada vem do storageState (auth.json) gerado no globalSetup
    await page.goto('/cadastrar-colaborador');
    await page.waitForLoadState('networkidle');
    await expect(page.getByPlaceholder('Digite o CPF do colaborador')).toBeVisible();
  });

  test('máscara do CPF neutraliza letras e caracteres especiais', async ({ page }) => {
    const cpfInput = page.getByPlaceholder('Digite o CPF do colaborador');

    await cpfInput.fill('abc!@#$%&*()');
    expect(await cpfInput.inputValue()).toBe('');

    // Mistura de dígitos e lixo: só os dígitos devem sobrar, já formatados
    await cpfInput.fill('1a2b3c4d5e6f7g8h9i10j');
    const valor = await cpfInput.inputValue();
    expect(valor).toMatch(/^[\d.\-]*$/);
    expect(valor.replace(/\D/g, '')).toBe('12345678910');
  });

  test('máscara do CPF neutraliza payload de XSS', async ({ page }) => {
    const cpfInput = page.getByPlaceholder('Digite o CPF do colaborador');

    await cpfInput.fill('<script>alert(1)</script>');
    const valor = await cpfInput.inputValue();

    // Nada de markup pode sobreviver à máscara — apenas dígitos e separadores
    expect(valor).not.toContain('<');
    expect(valor).not.toContain('>');
    expect(valor).toMatch(/^[\d.\-]*$/);
  });

  test('máscara do CPF trunca dígitos excedentes em 11 dígitos', async ({ page }) => {
    const cpfInput = page.getByPlaceholder('Digite o CPF do colaborador');

    await cpfInput.fill('12345678901234567890');
    const valor = await cpfInput.inputValue();

    // Deve manter o formato completo da máscara e não exceder 11 dígitos
    expect(valor).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
    expect(valor.replace(/\D/g, '')).toBe('12345678901');
  });

  test('CPF incompleto (9 dígitos) deve ser bloqueado no client', async ({ page }) => {
    // ⚠️ Falha esperada: "123.456.789" tem 11 caracteres e passa no min(11)
    // do schema, então o formulário envia um CPF com só 9 dígitos ao backend.
    test.fail();

    let postDisparado = false;
    await page.route('**/auth/register/employee', route => {
      if (route.request().method() === 'POST') {
        postDisparado = true;
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'CPF inválido' })
        });
      } else {
        route.continue();
      }
    });

    await page.getByPlaceholder('Digite o nome do colaborador').fill('Colaborador Cpf Incompleto');
    const cpfInput = page.getByPlaceholder('Digite o CPF do colaborador');
    await cpfInput.fill('123456789');

    // Apenas 9 dígitos foram informados, mas a string mascarada "123.456.789"
    // tem 11 CARACTERES — o que satisfaz o min(11) do schema (a raiz do bug).
    const valor = await cpfInput.inputValue();
    expect(valor.replace(/\D/g, '')).toHaveLength(9);
    expect(valor.length).toBeGreaterThanOrEqual(11);

    await page.locator('form button[type="submit"]').click();
    await page.waitForTimeout(1500);

    // Comportamento SEGURO esperado: erro de validação e nenhuma requisição enviada
    await expect(page.getByText(/CPF|11 caracteres|inválido/i).first()).toBeVisible();
    expect(postDisparado).toBe(false);
  });

  test('CPF com todos os dígitos iguais (111.111.111-11) deve ser rejeitado', async ({ page }) => {
    // ⚠️ Falha esperada: não existe validação de dígito verificador — o CPF
    // matematicamente inválido passa no client e a requisição é disparada.
    test.fail();

    let postDisparado = false;
    await page.route('**/auth/register/employee', route => {
      if (route.request().method() === 'POST') {
        postDisparado = true;
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'CPF inválido' })
        });
      } else {
        route.continue();
      }
    });

    await page.getByPlaceholder('Digite o nome do colaborador').fill('Colaborador Cpf Invalido');
    await page.getByPlaceholder('Digite o CPF do colaborador').fill('111.111.111-11');
    await page.locator('form button[type="submit"]').click();
    await page.waitForTimeout(1500);

    // Comportamento SEGURO esperado: erro client-side e nenhuma requisição enviada
    await expect(page.getByText(/CPF inválido|dígito verificador/i).first()).toBeVisible();
    expect(postDisparado).toBe(false);
  });
});
