// spec: specs/cadastrar-veiculo.plan.md
// seed: specs/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Vehicle Registration - New Vehicle Creation', () => {
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
  test('Validate vehicle name minimum length requirement', async ({ page }) => {
    // 1. Navigate to the cadastrar-veiculo page
    await page.goto('http://localhost:3000/cadastrar-veiculo');
    await page.waitForTimeout(2000);

    // 2. Enter 'ABC' (less than 4 characters) in the 'Nome do veículo' field
    await page.getByRole('textbox', { name: 'Digite o nome do veículo' }).fill('ABC');

    // 3. Tab to another field to trigger validation
    await page.keyboard.press('Tab');

    // 4. Observe error message for vehicle name field
    await expect(page.locator('text=Deve ter no mínimo 4 caracteres')).toBeVisible();
  });

  test('Validate license plate minimum length requirement', async ({ page }) => {
    // 1. Navigate to the cadastrar-veiculo page
    await page.goto('http://localhost:3000/cadastrar-veiculo');
    await page.waitForTimeout(2000);

    // 2. Enter 'AB-123' (less than 7 characters) in the 'Placa' field
    await page.getByRole('textbox', { name: 'Digite a placa' }).fill('AB-123');

    // 3. Tab to another field to trigger validation
    await page.keyboard.press('Tab');

    // 4. Observe error message for plate field
    await expect(page.locator('text=A placa deve ter no mínimo 7 caracteres')).toBeVisible();
  });

  test('Validate emission field accepts only valid numbers', async ({ page }) => {
    // 1. Navigate to the cadastrar-veiculo page
    await page.goto('http://localhost:3000/cadastrar-veiculo');
    await page.waitForTimeout(2000);

    // 2. Enter 'invalid' in the 'Emissão (kgCO2eq/L)' field
    await page.getByRole('textbox', { name: 'Digite a emissão' }).fill('invalid');

    // 3. Tab to another field to trigger validation
    await page.keyboard.press('Tab');

    // 4. Observe error message for emission field
    await expect(page.locator('text=Digite um número válido')).toBeVisible();
  });

  test('Validate consumption field accepts only valid numbers', async ({ page }) => {
    // 1. Navigate to the cadastrar-veiculo page
    await page.goto('http://localhost:3000/cadastrar-veiculo');
    await page.waitForTimeout(2000);

    // 2. Enter 'abc123' in the 'Consumo (L/km)' field
    await page.getByRole('textbox', { name: 'Digite o consumo' }).fill('abc123');

    // 3. Tab to another field to trigger validation
    await page.keyboard.press('Tab');

    // 4. Observe error message for consumption field
    await expect(page.locator('text=Digite um número válido')).toBeVisible();
  });

  test('Validate email field accepts valid email format', async ({ page }) => {
    // 1. Navigate to the cadastrar-veiculo page
    await page.goto('http://localhost:3000/cadastrar-veiculo');
    await page.waitForTimeout(2000);

    // 2. Enter 'notanemail' in the 'Criar login' field
    await page.getByRole('textbox', { name: 'Digite o email' }).fill('notanemail');

    // 3. Tab to another field to trigger validation
    await page.keyboard.press('Tab');

    // 4. Observe error message for email field
    await expect(page.locator('text=Insira um e-mail válido')).toBeVisible();
  });

  test('Validate password field meets requirements', async ({ page }) => {
    // 1. Navigate to the cadastrar-veiculo page
    await page.goto('http://localhost:3000/cadastrar-veiculo');
    await page.waitForTimeout(2000);

    // 2. Enter 'weak' in the 'Senha' field
    await page.getByRole('textbox', { name: 'Digite a senha', exact: true }).fill('weak');

    // 3. Tab to another field to trigger validation
    await page.keyboard.press('Tab');

    // 4. Observe error message for password field
    await expect(page.locator('text=Deve ter no mínimo 8 caracteres')).toBeVisible();
  });

  test('Validate password confirmation must match', async ({ page }) => {
    // 1. Navigate to the cadastrar-veiculo page
    await page.goto('http://localhost:3000/cadastrar-veiculo');
    await page.waitForTimeout(2000);

    // 2. Enter valid vehicle details (name, plate, emission, consumption, email)
    await page.getByRole('textbox', { name: 'Digite o nome do veículo' }).fill('Test Vehicle');
    await page.getByRole('textbox', { name: 'Digite a placa' }).fill('ABC1234');
    await page.getByRole('textbox', { name: 'Digite a emissão' }).fill('2.5');
    await page.getByRole('textbox', { name: 'Digite o consumo' }).fill('0.8');
    await page.getByRole('textbox', { name: 'Digite o email' }).fill('test@example.com');

    // 3. Enter 'Password123!' in the 'Senha' field
    await page.getByRole('textbox', { name: 'Digite a senha', exact: true }).fill('Password123!');

    // 4. Enter 'Password456!' in the 'Confirmar senha' field
    await page.getByRole('textbox', { name: 'Digite a senha novamente' }).fill('Password456!');

    // 5. Tab to trigger validation
    await page.keyboard.press('Tab');

    // 6. Observe error message for password confirmation
    await expect(page.locator('text=As senhas não são iguais')).toBeVisible();
  });

  test('All new registration fields are required', async ({ page }) => {
    // 1. Navigate to the cadastrar-veiculo page
    await page.goto('http://localhost:3000/cadastrar-veiculo');
    await page.waitForTimeout(2000);

    // 2. Leave all fields empty and attempt to submit
    // 3. Try to click submit button
    // Tab through all fields to trigger validation on empty form
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // 4. Observe validation errors appear for required fields
    await expect(page.locator('text=Insira o nome do veículo')).toBeVisible();
  });

  test('Accept decimal numbers for emission and consumption', async ({ page }) => {
    // 1. Navigate to the cadastrar-veiculo page
    await page.goto('http://localhost:3000/cadastrar-veiculo');
    await page.waitForTimeout(2000);

    // 2. Enter 'Test Vehicle' in the 'Nome do veículo' field
    await page.getByRole('textbox', { name: 'Digite o nome do veículo' }).fill('Test Vehicle');

    // 3. Enter 'ABC-1234' in the 'Placa' field
    await page.getByRole('textbox', { name: 'Digite a placa' }).fill('ABC1234');

    // 4. Enter '2.456' in the 'Emissão (kgCO2eq/L)' field
    await page.getByRole('textbox', { name: 'Digite a emissão' }).fill('2.456');

    // 5. Enter '0.75' in the 'Consumo (L/km)' field
    await page.getByRole('textbox', { name: 'Digite o consumo' }).fill('0.75');

    // 6. Enter 'vehicle@test.com' in the 'Criar login' field
    await page.getByRole('textbox', { name: 'Digite o email' }).fill('vehicle@test.com');

    // 7. Enter 'ValidPass123!' in the 'Senha' field
    await page.getByRole('textbox', { name: 'Digite a senha', exact: true }).fill('ValidPass123!');

    // 8. Enter 'ValidPass123!' in the 'Confirmar senha' field
    await page.getByRole('textbox', { name: 'Digite a senha novamente' }).fill('ValidPass123!');

    // 9. Verify no validation errors for decimal fields
    const emissionField = page.getByRole('textbox', { name: 'Digite a emissão' });
    const consumoField = page.getByRole('textbox', { name: 'Digite o consumo' });

    await expect(emissionField).toHaveValue('2.456');
    await expect(consumoField).toHaveValue('0.75');

    // Verify no error messages appear for these fields
    const emissionError = page.locator('text=Digite um número válido').first();
    await expect(emissionError).not.toBeVisible();
  });

  test('Plate field applies correct mask format', async ({ page }) => {
    // 1. Navigate to the cadastrar-veiculo page
    await page.goto('http://localhost:3000/cadastrar-veiculo');
    await page.waitForTimeout(2000);

    // 2. Click on the 'Placa' input field
    const plateField = page.getByRole('textbox', { name: 'Digite a placa' });
    await plateField.click();

    // 3. Type 'ABC1234'
    await plateField.fill('ABC1234');

    // 4. Observe the formatted value - should display as 'ABC-1234'
    await expect(plateField).toHaveValue('ABC-1234');
  });

  test('Password field hides character input', async ({ page }) => {
    // 1. Navigate to the cadastrar-veiculo page
    await page.goto('http://localhost:3000/cadastrar-veiculo');
    await page.waitForTimeout(2000);

    // 2. Click on the 'Senha' input field
    const passwordField = page.getByRole('textbox', { name: 'Digite a senha', exact: true });

    // 3. Verify the input type is password (which masks characters)
    const passwordType = await passwordField.evaluate((el: HTMLInputElement) => el.type);
    expect(passwordType).toBe('password');

    // 4. Type and verify characters are masked
    await passwordField.fill('Password123!');
    await expect(passwordField).toHaveValue('Password123!');
  });

  test('Confirm password field hides character input', async ({ page }) => {
    // 1. Navigate to the cadastrar-veiculo page
    await page.goto('http://localhost:3000/cadastrar-veiculo');
    await page.waitForTimeout(2000);

    // 2. Click on the 'Confirmar senha' input field
    const confirmPasswordField = page.getByRole('textbox', { name: 'Digite a senha novamente' });

    // 3. Verify the input type is password
    const passwordType = await confirmPasswordField.evaluate((el: HTMLInputElement) => el.type);
    expect(passwordType).toBe('password');

    // 4. Type and verify
    await confirmPasswordField.fill('Password123!');
    await expect(confirmPasswordField).toHaveValue('Password123!');
  });

  test('Verify form layout and field organization', async ({ page }) => {
    // 1. Navigate to the cadastrar-veiculo page
    await page.goto('http://localhost:3000/cadastrar-veiculo');
    await page.waitForTimeout(2000);

    // 2. Verify all expected fields are present
    const nameField = page.getByRole('textbox', { name: 'Digite o nome do veículo' });
    const plateField = page.getByRole('textbox', { name: 'Digite a placa' });
    const emissionField = page.getByRole('textbox', { name: 'Digite a emissão' });
    const consumoField = page.getByRole('textbox', { name: 'Digite o consumo' });
    const emailField = page.getByRole('textbox', { name: 'Digite o email' });
    const senhaField = page.getByRole('textbox', { name: 'Digite a senha', exact: true });
    const confirmSenhaField = page.getByRole('textbox', { name: 'Digite a senha novamente' });
    const submitButton = page.getByRole('button', { name: 'Cadastrar' });

    // 3. Verify all fields are visible
    await expect(nameField).toBeVisible();
    await expect(plateField).toBeVisible();
    await expect(emissionField).toBeVisible();
    await expect(consumoField).toBeVisible();
    await expect(emailField).toBeVisible();
    await expect(senhaField).toBeVisible();
    await expect(confirmSenhaField).toBeVisible();
    await expect(submitButton).toBeVisible();

    // 4. Verify button is clickable
    await expect(submitButton).toBeEnabled();
  });

  test('Verify error messages are properly displayed', async ({ page }) => {
    // 1. Navigate to the cadastrar-veiculo page
    await page.goto('http://localhost:3000/cadastrar-veiculo');
    await page.waitForTimeout(2000);

    // 2. Leave the 'Nome do veículo' field empty
    const nameField = page.getByRole('textbox', { name: 'Digite o nome do veículo' });
    await nameField.click();

    // 3. Tab to another field to trigger validation
    await page.keyboard.press('Tab');

    // 4. Observe error message display
    const errorMessage = page.locator('text=Insira o nome do veículo');
    await expect(errorMessage).toBeVisible();
  });
});
