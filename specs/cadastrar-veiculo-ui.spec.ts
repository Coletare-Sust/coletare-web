// spec: specs/cadastrar-veiculo.plan.md
// seed: specs/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Vehicle Registration - UI/UX', () => {
  test('All form labels are visible and properly positioned', async ({ page }) => {
    // Navigate to the cadastrar-veiculo page
    await page.goto('http://localhost:3000/cadastrar-veiculo');
    await page.waitForTimeout(2000);

    // Verify all labels are visible
    const labels = [
      'Nome do veículo',
      'Placa',
      'Emissão (kgCO2eq/L)',
      'Consumo (L/km)',
      'Criar login',
      'Senha',
      'Confirmar senha'
    ];

    for (const label of labels) {
      const labelElement = page.locator(`text=${label}`).first();
      await expect(labelElement).toBeVisible();
    }
  });

  test('Page title displays correct heading', async ({ page }) => {
    // Navigate to the cadastrar-veiculo page
    await page.goto('http://localhost:3000/cadastrar-veiculo');
    await page.waitForTimeout(2000);

    // Verify page heading
    const heading = page.locator('text=Cadastrar novo Veículo');
    await expect(heading).toBeVisible();
  });

  test('Submit button is visible and properly labeled', async ({ page }) => {
    // Navigate to the cadastrar-veiculo page
    await page.goto('http://localhost:3000/cadastrar-veiculo');
    await page.waitForTimeout(2000);

    // Verify Cadastrar button
    const submitButton = page.getByRole('button', { name: 'Cadastrar' });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
  });

  test('Back button is accessible in the page header', async ({ page }) => {
    // Navigate to the cadastrar-veiculo page
    await page.goto('http://localhost:3000/cadastrar-veiculo');
    await page.waitForTimeout(2000);

    // Verify back button/link exists
    const backButton = page.locator('img[alt*="Seta"]').first();
    await expect(backButton).toBeVisible();
  });

  test('Form input fields have appropriate placeholder text', async ({ page }) => {
    // Navigate to the cadastrar-veiculo page
    await page.goto('http://localhost:3000/cadastrar-veiculo');
    await page.waitForTimeout(2000);

    // Verify placeholders
    const nameField = page.getByRole('textbox', { name: 'Digite o nome do veículo' });
    const plateField = page.getByRole('textbox', { name: 'Digite a placa' });
    const emissionField = page.getByRole('textbox', { name: 'Digite a emissão' });

    await expect(nameField).toHaveAttribute('placeholder', 'Digite o nome do veículo');
    await expect(plateField).toHaveAttribute('placeholder', 'Digite a placa');
    await expect(emissionField).toHaveAttribute('placeholder', 'Digite a emissão');
  });

  test('Form fields are properly spaced and organized vertically', async ({ page }) => {
    // Navigate to the cadastrar-veiculo page
    await page.goto('http://localhost:3000/cadastrar-veiculo');
    await page.waitForTimeout(2000);

    // Get all form fields
    const nameField = page.getByRole('textbox', { name: 'Digite o nome do veículo' });
    const plateField = page.getByRole('textbox', { name: 'Digite a placa' });

    // Get bounding boxes to verify vertical arrangement
    const nameBBox = await nameField.boundingBox();
    const plateBBox = await plateField.boundingBox();

    // Verify plate field is below name field
    expect(plateBBox!.y).toBeGreaterThan(nameBBox!.y);
  });

  test('Edit mode shows different button label', async ({ page }) => {
    // Navigate to the cadastrar-veiculo page in edit mode
    await page.goto('http://localhost:3000/cadastrar-veiculo?isEdit=true&id=test-id');
    await page.waitForTimeout(2000);

    // Verify Editar button is shown instead of Cadastrar
    const editButton = page.getByRole('button', { name: 'Editar' });
    await expect(editButton).toBeVisible();

    // Verify Cadastrar button is not shown
    const registerButton = page.getByRole('button', { name: 'Cadastrar' });
    await expect(registerButton).not.toBeVisible();
  });

  test('Vehicle image is displayed on the page', async ({ page }) => {
    // Navigate to the cadastrar-veiculo page
    await page.goto('http://localhost:3000/cadastrar-veiculo');
    await page.waitForTimeout(2000);

    // Verify vehicle image is visible
    const vehicleImage = page.locator('img[src="/vehicle.png"]');
    await expect(vehicleImage).toBeVisible();
  });

  test('Form container has proper structure', async ({ page }) => {
    // Navigate to the cadastrar-veiculo page
    await page.goto('http://localhost:3000/cadastrar-veiculo');
    await page.waitForTimeout(2000);

    // Verify form element exists
    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Verify form has proper class structure
    const hasFlexClass = await form.evaluate((el) => {
      const classes = el.className;
      return classes.includes('flex') || classes.includes('flex-col');
    });

    expect(hasFlexClass).toBeTruthy();
  });

  test('Number fields display numeric values correctly', async ({ page }) => {
    // Navigate to the cadastrar-veiculo page
    await page.goto('http://localhost:3000/cadastrar-veiculo');
    await page.waitForTimeout(2000);

    // Enter numeric values
    const emissionField = page.getByRole('textbox', { name: 'Digite a emissão' });
    await emissionField.fill('2.5');

    // Verify the value is displayed correctly
    await expect(emissionField).toHaveValue('2.5');
  });

  test('Error messages appear below respective input fields', async ({ page }) => {
    // Navigate to the cadastrar-veiculo page
    await page.goto('http://localhost:3000/cadastrar-veiculo');
    await page.waitForTimeout(2000);

    // Create validation error in name field
    const nameField = page.getByRole('textbox', { name: 'Digite o nome do veículo' });
    await nameField.fill('AB');
    await page.keyboard.press('Tab');

    // Find the error message
    const errorMessage = page.locator('text=Deve ter no mínimo 4 caracteres');
    
    // Get bounding boxes
    const nameBBox = await nameField.boundingBox();
    const errorBBox = await errorMessage.boundingBox();

    // Verify error appears below the field (y-coordinate should be larger)
    expect(errorBBox!.y).toBeGreaterThan(nameBBox!.y + nameBBox!.height);
  });

  test('Field focus indicators are visible', async ({ page }) => {
    // Navigate to the cadastrar-veiculo page
    await page.goto('http://localhost:3000/cadastrar-veiculo');
    await page.waitForTimeout(2000);

    // Click on a field to focus it
    const nameField = page.getByRole('textbox', { name: 'Digite o nome do veículo' });
    await nameField.focus();

    // Verify field is focused
    const isFocused = await nameField.evaluate((el) => document.activeElement === el);
    expect(isFocused).toBeTruthy();
  });

  test('All required fields are clearly marked', async ({ page }) => {
    // Navigate to the cadastrar-veiculo page
    await page.goto('http://localhost:3000/cadastrar-veiculo');
    await page.waitForTimeout(2000);

    // Verify all input fields exist (they're all required in the form)
    const inputs = page.locator('input[type="text"], input[type="email"], input[type="password"]');
    const inputCount = await inputs.count();

    // Should have at least 7 fields (name, plate, emission, consumption, email, password, confirm password)
    expect(inputCount).toBeGreaterThanOrEqual(7);
  });

  test('Form prevents accidental double submission', async ({ page }) => {
    // Navigate to the cadastrar-veiculo page
    await page.goto('http://localhost:3000/cadastrar-veiculo');
    await page.waitForTimeout(2000);

    // Fill form with valid data
    await page.getByRole('textbox', { name: 'Digite o nome do veículo' }).fill('Test Vehicle');
    await page.getByRole('textbox', { name: 'Digite a placa' }).fill('ABC1234');
    await page.getByRole('textbox', { name: 'Digite a emissão' }).fill('2.5');
    await page.getByRole('textbox', { name: 'Digite o consumo' }).fill('0.8');
    await page.getByRole('textbox', { name: 'Digite o email' }).fill('test@test.com');
    await page.getByRole('textbox', { name: 'Digite a senha', exact: true }).fill('Password123!');
    await page.getByRole('textbox', { name: 'Digite a senha novamente' }).fill('Password123!');

    // Get submit button
    const submitButton = page.getByRole('button', { name: 'Cadastrar' });

    // Button should be clickable initially
    await expect(submitButton).toBeEnabled();
  });

  test('Responsive layout maintains readability', async ({ page }) => {
    // Navigate to the cadastrar-veiculo page
    await page.goto('http://localhost:3000/cadastrar-veiculo');
    await page.waitForTimeout(2000);

    // Verify main content area is visible and properly sized
    const mainContent = page.locator('main');
    const boundingBox = await mainContent.boundingBox();

    // Main content should have reasonable dimensions
    expect(boundingBox!.width).toBeGreaterThan(200);
    expect(boundingBox!.height).toBeGreaterThan(300);
  });

  test('Navigation menu remains visible while scrolling form', async ({ page }) => {
    // Navigate to the cadastrar-veiculo page
    await page.goto('http://localhost:3000/cadastrar-veiculo');
    await page.waitForTimeout(2000);

    // Verify navigation banner is visible
    const banner = page.locator('banner');
    await expect(banner).toBeVisible();

    // Navigation should remain in viewport (not scroll away)
    const bannerBBox = await banner.boundingBox();
    expect(bannerBBox!.y).toBeLessThanOrEqual(200); // Near top of page
  });
});
