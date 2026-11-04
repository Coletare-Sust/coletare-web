/**
 * Testes de segurança contra injeção nos campos de texto livre
 * (/cadastrar-colaborador — campo "Nome do colaborador").
 *
 * Pontos vulneráveis cobertos:
 *  1. Payloads de XSS (<script>) devem ser rejeitados pela validação de nome
 *  2. Payloads de SQL injection (aspas, ponto e vírgula, --) devem ser rejeitados
 *  3. ⚠️ VULNERABILIDADE DOCUMENTADA: o regex de nome usa a classe `A-z` (maiúsculo
 *     A até minúsculo z na tabela ASCII), que inclui os caracteres `[ \ ] ^ _ `` `.
 *     Ou seja: "Nome_Com[Injecao]^" passa na validação "Não utilize caracteres
 *     especiais". (src/common/validation/name.ts — o correto seria `A-Za-z`)
 *
 * O teste 3 usa `test.fail()`: asserta o comportamento SEGURO esperado e hoje
 * falha de propósito, documentando o bug no regex. Nenhum formulário é submetido
 * nesse teste — a vulnerabilidade é comprovada só com a validação client-side.
 */

import { test, expect } from '../fixtures';

const ERRO_CARACTERES = 'Não utilize caracteres especiais';

test.describe('Segurança contra injeção — campo nome do colaborador', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cadastrar-colaborador');
    await page.waitForLoadState('networkidle');
    await expect(page.getByPlaceholder('Digite o nome do colaborador')).toBeVisible();
  });

  test('payload de XSS no nome é rejeitado e o formulário não é enviado', async ({ page }) => {
    const nameInput = page.getByPlaceholder('Digite o nome do colaborador');

    await nameInput.fill('<script>alert(1)</script>');
    await nameInput.blur();

    // Validação client-side deve acusar caracteres especiais
    await expect(page.getByText(ERRO_CARACTERES)).toBeVisible();

    // Mesmo forçando o submit, o cadastro não pode prosseguir
    await page.getByPlaceholder('Digite o CPF do colaborador').fill('222.353.474-56');
    await page.locator('form button[type="submit"]').click();
    await page.waitForTimeout(1000);

    await expect(page.getByText(ERRO_CARACTERES)).toBeVisible();
    expect(page.url()).toContain('/cadastrar-colaborador');
  });

  test('payload de SQL injection no nome é rejeitado e o formulário não é enviado', async ({ page }) => {
    const nameInput = page.getByPlaceholder('Digite o nome do colaborador');

    await nameInput.fill("Robert'); DROP TABLE users;--");
    await nameInput.blur();

    await expect(page.getByText(ERRO_CARACTERES)).toBeVisible();

    await page.getByPlaceholder('Digite o CPF do colaborador').fill('222.353.474-56');
    await page.locator('form button[type="submit"]').click();
    await page.waitForTimeout(1000);

    await expect(page.getByText(ERRO_CARACTERES)).toBeVisible();
    expect(page.url()).toContain('/cadastrar-colaborador');
  });

  test('caracteres especiais [ ] ^ _ devem ser rejeitados pela validação de nome', async ({ page }) => {
    // ⚠️ Falha esperada: o regex /^[A-zÀ-ú-\s]+$/ aceita [ \ ] ^ _ e crase por
    // causa da classe `A-z`. A validação deveria exibir o erro, mas não exibe.
    test.fail();

    const nameInput = page.getByPlaceholder('Digite o nome do colaborador');

    await nameInput.fill('Nome_Com[Injecao]^');
    await nameInput.blur();

    // Comportamento SEGURO esperado: erro de caracteres especiais visível
    await expect(page.getByText(ERRO_CARACTERES)).toBeVisible({ timeout: 3000 });
  });
});
