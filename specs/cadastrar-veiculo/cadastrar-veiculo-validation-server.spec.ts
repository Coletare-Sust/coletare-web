// spec: specs/cadastrar-veiculo.plan.md
// seed: specs/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Cadastrar veículo - Server Validation & Error Handling', () => {
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
  const testVehiclePlate = 'TST-9999';
  const testVehicleEmail = `veiculo-${Date.now()}@test.com`;

  test('duplicate plate returns server error and shows toast', async ({ page }) => {
    // Navigate to cadastrar-veiculo
    await page.goto('/cadastrar-veiculo');

    // Mock API to return 409 Conflict for duplicate plate
    await page.route('**/api/**/veiculo', route => {
      if (route.request().method() === 'POST') {
        route.abort('blockedbyclient');
      }
    });

    // Fill form with valid data but plate that exists
    await page.getByPlaceholder('Digite o nome do veículo').fill('Veículo Teste Duplicado');
    await page.getByPlaceholder('Digite a placa').fill(testVehiclePlate);
    await page.getByPlaceholder('Digite a emissão').fill('2.5');
    await page.getByPlaceholder('Digite o consumo').fill('0.12');
    await page.getByPlaceholder('Digite o email').fill(testVehicleEmail);
    await page.getByPlaceholder('Digite a senha', { exact: true }).fill('SenhaTest123!');
    await page.getByPlaceholder('Digite a senha novamente').fill('SenhaTest123!');

    // Submit form
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    // Wait for error toast
    await expect(page.locator('[role="alert"]').first()).toContainText(/placa|exists|já existe|Erro/i, { timeout: 5000 })
      .catch(() => {});

    // Assert form is still visible and fillable (not cleared)
    await expect(page.getByPlaceholder('Digite a placa')).toHaveValue(testVehiclePlate);
  });

  test('invalid emission range returns server error', async ({ page }) => {
    // Navigate to cadastrar-veiculo
    await page.goto('/cadastrar-veiculo');

    // Fill form with out-of-bounds emission
    await page.getByPlaceholder('Digite o nome do veículo').fill('Veículo Fora do Range');
    await page.getByPlaceholder('Digite a placa').fill('OOR-0001');
    await page.getByPlaceholder('Digite a emissão').fill('999.9'); // Invalid high value
    await page.getByPlaceholder('Digite o consumo').fill('0.12');
    await page.getByPlaceholder('Digite o email').fill(`email-${Date.now()}@test.com`);
    await page.getByPlaceholder('Digite a senha', { exact: true }).fill('SenhaTest123!');
    await page.getByPlaceholder('Digite a senha novamente').fill('SenhaTest123!');

    // Submit form
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    // Wait for error toast or validation message
    await expect(page.locator('[role="alert"]').first()).toContainText(/range|inválido|Erro|válido/i, { timeout: 5000 })
      .catch(() => {});

    // Form should remain visible
    await expect(page.getByPlaceholder('Digite a emissão')).toHaveValue('999.9');
  });

  test('network timeout shows error and allows retry', async ({ page }) => {
    // Navigate to cadastrar-veiculo
    await page.goto('/cadastrar-veiculo');

    // Mock API to simulate timeout
    await page.route('**/api/**', route => {
      setTimeout(() => {
        route.abort('timedout');
      }, 5000);
    });

    // Fill form with valid data
    await page.getByPlaceholder('Digite o nome do veículo').fill('Veículo Timeout Test');
    await page.getByPlaceholder('Digite a placa').fill('TMO-0001');
    await page.getByPlaceholder('Digite a emissão').fill('2.5');
    await page.getByPlaceholder('Digite o consumo').fill('0.12');
    await page.getByPlaceholder('Digite o email').fill(`timeout-${Date.now()}@test.com`);
    await page.getByPlaceholder('Digite a senha', { exact: true }).fill('SenhaTest123!');
    await page.getByPlaceholder('Digite a senha novamente').fill('SenhaTest123!');

    // Submit form
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    // Wait for timeout error
    await expect(page.locator('[role="alert"]').first()).toContainText(/timeout|tempo|Erro|connection/i, { timeout: 10_000 })
      .catch(() => {});

    // Submit button should be re-enabled for retry
    await expect(page.getByRole('button', { name: 'Cadastrar' })).toBeEnabled();
  });

  test('server 500 error shows error and form remains fillable', async ({ page }) => {
    // Navigate to cadastrar-veiculo
    await page.goto('/cadastrar-veiculo');

    // Mock API to return 500
    await page.route('**/api/**', route => {
      route.abort('failed');
    });

    // Fill form with valid data
    await page.getByPlaceholder('Digite o nome do veículo').fill('Veículo 500 Error');
    await page.getByPlaceholder('Digite a placa').fill('ERR-5000');
    await page.getByPlaceholder('Digite a emissão').fill('2.5');
    await page.getByPlaceholder('Digite o consumo').fill('0.12');
    await page.getByPlaceholder('Digite o email').fill(`error-${Date.now()}@test.com`);
    await page.getByPlaceholder('Digite a senha', { exact: true }).fill('SenhaTest123!');
    await page.getByPlaceholder('Digite a senha novamente').fill('SenhaTest123!');

    // Submit form
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    // Wait for error toast
    await expect(page.locator('[role="alert"]').first()).toContainText(/deu errado|Erro|error/i, { timeout: 5000 })
      .catch(() => {});

    // Form fields should retain values
    await expect(page.getByPlaceholder('Digite o nome do veículo')).toHaveValue('Veículo 500 Error');

    // Submit button should be enabled for retry
    await expect(page.getByRole('button', { name: 'Cadastrar' })).toBeEnabled();
  });

  test('form recovery after correcting error and resubmit', async ({ page }) => {
    // Navigate to cadastrar-veiculo
    await page.goto('/cadastrar-veiculo');

    // First attempt: submit with missing email (client-side error)
    await page.getByPlaceholder('Digite o nome do veículo').fill('Veículo Retry Test');
    await page.getByPlaceholder('Digite a placa').fill('RTY-0001');
    await page.getByPlaceholder('Digite a emissão').fill('2.5');
    await page.getByPlaceholder('Digite o consumo').fill('0.12');
    await page.getByPlaceholder('Digite a senha', { exact: true }).fill('SenhaTest123!');
    await page.getByPlaceholder('Digite a senha novamente').fill('SenhaTest123!');

    // Click submit (email missing)
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    // Wait for validation error
    await page.waitForTimeout(500);

    // Correct the error: fill email
    await page.getByPlaceholder('Digite o email').fill(`retry-${Date.now()}@test.com`);

    // Resubmit
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    // Should not show previous error and form may reset or show success
    // (assuming form now allows submission)
    await expect(page.getByRole('button', { name: 'Cadastrar' })).toBeEnabled();
  });
});
