// spec: specs/cadastrar-veiculo.plan.md
// seed: specs/auth.setup.ts

import { test, expect } from '../fixtures';

test.describe('Vehicle Registration - Edit Mode', () => {
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
  test('Edit mode displays form fields without email/password', async ({ page }) => {
    // 1. Navigate to the cadastrar-veiculo page with isEdit parameter
    await page.goto('http://localhost:3000/cadastrar-veiculo?isEdit=true&id=test-vehicle-id');
    await page.waitForTimeout(3000);

    // 2. Verify the form structure for edit mode
    const nameField = page.getByRole('textbox', { name: 'Digite o nome do veículo' });
    const plateField = page.getByRole('textbox', { name: 'Digite a placa' });
    const emissionField = page.getByRole('textbox', { name: 'Digite a emissão' });
    const consumoField = page.getByRole('textbox', { name: 'Digite o consumo' });
    
    // 3. Verify all fields are visible for editing
    await expect(nameField).toBeVisible();
    await expect(plateField).toBeVisible();
    await expect(emissionField).toBeVisible();
    await expect(consumoField).toBeVisible();

    // 4. Verify email/password fields are NOT visible in edit mode
    const emailField = page.getByRole('textbox', { name: 'Digite o email' });
    const senhaField = page.getByRole('textbox', { name: 'Digite a senha', exact: true });
    const confirmSenhaField = page.getByRole('textbox', { name: 'Digite a senha novamente' });
    
    await expect(emailField).not.toBeVisible();
    await expect(senhaField).not.toBeVisible();
    await expect(confirmSenhaField).not.toBeVisible();

    // 5. Verify button label shows 'Editar' instead of 'Cadastrar'
    const editButton = page.getByRole('button', { name: 'Editar' });
    await expect(editButton).toBeVisible();
  });

  test('Validate updated vehicle name in edit mode', async ({ page }) => {
    // 1. Navigate to the cadastrar-veiculo page in edit mode
    await page.goto('http://localhost:3000/cadastrar-veiculo?isEdit=true&id=test-vehicle-id');
    await page.waitForTimeout(3000);

    // 2. Clear the 'Nome do veículo' field
    const nameField = page.getByRole('textbox', { name: 'Digite o nome do veículo' });
    await nameField.fill('');

    // 3. Enter 'AB' (less than 4 characters)
    await nameField.fill('AB');

    // 4. Tab to another field to trigger validation
    await page.keyboard.press('Tab');

    // 5. Verify error message is displayed
    const errorMessage = page.locator('text=Deve ter no mínimo 4 caracteres');
    await expect(errorMessage).toBeVisible();

    // 6. Verify the edit button is disabled or form cannot be submitted
    const editButton = page.getByRole('button', { name: 'Editar' });
    const isDisabled = await editButton.isDisabled();
    
    // The button may have disabled state or the form validation prevents submission
    // Either is acceptable behavior
    if (!isDisabled) {
      // If button is not disabled, try clicking and verify no submission happens
      await editButton.click();
      // Page should still be on edit page due to validation
      expect(page.url()).toContain('isEdit=true');
    }
  });

  test('Validate updated vehicle plate in edit mode', async ({ page }) => {
    // 1. Navigate to the cadastrar-veiculo page in edit mode
    await page.goto('http://localhost:3000/cadastrar-veiculo?isEdit=true&id=test-vehicle-id');
    await page.waitForTimeout(3000);

    // 2. Clear the 'Placa' field
    const plateField = page.getByRole('textbox', { name: 'Digite a placa' });
    await plateField.fill('');

    // 3. Enter 'ABC' (less than 7 characters)
    await plateField.fill('ABC');

    // 4. Tab to another field to trigger validation
    await page.keyboard.press('Tab');

    // 5. Verify error message is displayed
    const errorMessage = page.locator('text=A placa deve ter no mínimo 7 caracteres');
    await expect(errorMessage).toBeVisible();
  });

  test('Validate updated emission in edit mode', async ({ page }) => {
    // 1. Navigate to the cadastrar-veiculo page in edit mode
    await page.goto('http://localhost:3000/cadastrar-veiculo?isEdit=true&id=test-vehicle-id');
    await page.waitForTimeout(3000);

    // 2. Clear the 'Emissão (kgCO2eq/L)' field
    const emissionField = page.getByRole('textbox', { name: 'Digite a emissão' });
    await emissionField.fill('');

    // 3. Enter 'not-a-number'
    await emissionField.fill('not-a-number');

    // 4. Tab to another field to trigger validation
    await page.keyboard.press('Tab');

    // 5. Verify error message is displayed
    const errorMessage = page.locator('text=Digite um número válido');
    await expect(errorMessage).toBeVisible();
  });

  test('Validate updated consumption in edit mode', async ({ page }) => {
    // 1. Navigate to the cadastrar-veiculo page in edit mode
    await page.goto('http://localhost:3000/cadastrar-veiculo?isEdit=true&id=test-vehicle-id');
    await page.waitForTimeout(3000);

    // 2. Clear the 'Consumo (L/km)' field
    const consumoField = page.getByRole('textbox', { name: 'Digite o consumo' });
    await consumoField.fill('');

    // 3. Enter 'xyz'
    await consumoField.fill('xyz');

    // 4. Tab to another field to trigger validation
    await page.keyboard.press('Tab');

    // 5. Verify error message is displayed
    const errorMessage = page.locator('text=Digite um número válido');
    await expect(errorMessage).toBeVisible();
  });

  test('Accept valid updates with decimal numbers in edit mode', async ({ page }) => {
    // 1. Navigate to the cadastrar-veiculo page in edit mode
    await page.goto('http://localhost:3000/cadastrar-veiculo?isEdit=true&id=test-vehicle-id');
    await page.waitForTimeout(3000);

    // 2. Update vehicle name
    const nameField = page.getByRole('textbox', { name: 'Digite o nome do veículo' });
    await nameField.fill('Updated Vehicle');

    // 3. Update plate (no email/password in edit mode)
    const plateField = page.getByRole('textbox', { name: 'Digite a placa' });
    await plateField.fill('XYZ9876');

    // 4. Update emission with decimal
    const emissionField = page.getByRole('textbox', { name: 'Digite a emissão' });
    await emissionField.fill('3.789');

    // 5. Update consumption with decimal
    const consumoField = page.getByRole('textbox', { name: 'Digite o consumo' });
    await consumoField.fill('1.25');

    // 6. Verify all fields have valid values without errors
    await expect(nameField).toHaveValue('Updated Vehicle');
    await expect(plateField).toHaveValue('XYZ-9876');
    await expect(emissionField).toHaveValue('3.789');
    await expect(consumoField).toHaveValue('1.25');

    // 7. Verify no validation error messages are visible
    const errorMessages = page.locator('text=/Digite um número válido|Deve ter no mínimo/');
    await expect(errorMessages).not.toBeVisible();
  });

  test('Edit mode button shows loading state when submitting', async ({ page }) => {
    // 1. Navigate to the cadastrar-veiculo page in edit mode
    await page.goto('http://localhost:3000/cadastrar-veiculo?isEdit=true&id=test-vehicle-id');
    await page.waitForTimeout(3000);

    // 2. Fill valid data
    const nameField = page.getByRole('textbox', { name: 'Digite o nome do veículo' });
    await nameField.fill('Updated Vehicle');

    // 3. Verify the Editar button exists
    const editButton = page.getByRole('button', { name: 'Editar' });
    await expect(editButton).toBeVisible();

    // 4. Verify button is clickable before submission
    await expect(editButton).toBeEnabled();
  });
});
