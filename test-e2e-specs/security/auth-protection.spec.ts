/**
 * Testes de segurança de controle de acesso (broken access control).
 *
 * Pontos vulneráveis cobertos:
 *  1. Rotas autenticadas (/dashboard, /cadastrar-colaborador, etc.) não podem
 *     expor NENHUM conteúdo protegido a um usuário anônimo.
 *  2. O app deve barrar a renderização atrás do portão de autenticação
 *     (FetchAuthState) enquanto valida a sessão — nada de "flash" de dados.
 *
 * ⚠️ COMPORTAMENTO OBSERVADO / OBSERVAÇÃO DE SEGURANÇA:
 *   Ao acessar uma rota protegida sem sessão, o app NÃO redireciona para o login.
 *   Como o perfil é buscado com `useProfile(uid)` e a query fica `enabled: !!uid`
 *   (uid vazio para anônimo), o React Query permanece em estado `loading`
 *   indefinidamente e o FetchAuthState exibe um spinner para sempre. A garantia
 *   de segurança que de fato se sustenta — e que estes testes asseguram — é que
 *   o conteúdo protegido NUNCA é renderizado. A ausência de um redirect explícito
 *   para /login é uma fragilidade de UX/segurança que vale endereçar
 *   (ver src/hooks/queries/useProfile.ts + src/components/templates/FetchAuth).
 *
 * Estes testes rodam SEM sessão (storageState vazio), simulando um atacante
 * que acessa as URLs internas diretamente.
 */

import { test, expect } from '../fixtures';

// Atacante anônimo: nenhuma sessão salva
test.use({ storageState: { cookies: [], origins: [] } });

const ROTAS_PROTEGIDAS = [
  '/dashboard',
  '/cadastrar-colaborador',
  '/veiculos-colaboradores',
  '/municipios',
];

test.describe('Controle de acesso — rotas autenticadas sem sessão', () => {
  for (const rota of ROTAS_PROTEGIDAS) {
    test(`acesso anônimo a ${rota} é barrado pelo portão de autenticação`, async ({ page }) => {
      await page.goto(rota);

      // O portão de autenticação engaja: um spinner é exibido enquanto o app
      // valida a sessão (LoadingComponent -> svg.animate-spin).
      await expect(page.locator('svg.animate-spin').first()).toBeVisible({ timeout: 15_000 });

      // Nenhum conteúdo protegido interativo pode ser renderizado para um anônimo:
      // sem formulários, sem tabelas de dados e sem títulos de página.
      await expect(page.locator('form')).toHaveCount(0);
      await expect(page.locator('table')).toHaveCount(0);
      await expect(page.getByRole('heading')).toHaveCount(0);
    });
  }

  test('formulário de colaborador nunca é renderizado sem sessão', async ({ page }) => {
    await page.goto('/cadastrar-colaborador');

    // O portão de autenticação bloqueia a renderização do formulário
    await expect(page.locator('svg.animate-spin').first()).toBeVisible({ timeout: 15_000 });

    // Nenhum campo do formulário protegido pode existir no DOM
    await expect(page.getByPlaceholder('Digite o nome do colaborador')).toHaveCount(0);
    await expect(page.getByPlaceholder('Digite o CPF do colaborador')).toHaveCount(0);
  });
});
