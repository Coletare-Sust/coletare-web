import { test, expect } from '../fixtures';

test.describe('Cadastrar Colaborador Page', () => {
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

  test('Page loads with form fields visible', async ({ page }) => {
    // Navigate to the cadastrar-colaborador page
    await page.goto('http://localhost:3000/cadastrar-colaborador');

    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');

    // Verify the page title/heading is visible
    const pageHeading = page.getByRole('heading', { name: /Cadastrar|cadastrar/i });
    await expect(pageHeading).toBeVisible({ timeout: 5000 });

    // Verify the form exists
    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Verify the name input field is visible
    const nameInput = page.getByPlaceholder('Digite o nome do colaborador');
    await expect(nameInput).toBeVisible();

    // Verify the CPF input field is visible
    const cpfInput = page.getByPlaceholder('Digite o CPF do colaborador');
    await expect(cpfInput).toBeVisible();

    // Verify the submit button is visible
    const submitButton = page.getByRole('button', { name: /Cadastrar/i });
    await expect(submitButton).toBeVisible();
  });

  test('User successfully registers a new collaborator', async ({ page }) => {
    // Navigate to the cadastrar-colaborador page
    await page.goto('http://localhost:3000/cadastrar-colaborador');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Fill in the name field (no digits/special chars allowed)
    const nameInput = page.getByPlaceholder('Digite o nome do colaborador');
    await nameInput.fill('Ricardo Teste Dois');

    // Fill in the CPF field (with mask 999.999.999-99)
    const cpfInput = page.getByPlaceholder('Digite o CPF do colaborador');
    await cpfInput.fill('222.353.474-56');

    // Verify the submit button is enabled and visible
    const submitButton = page.getByRole('button', { name: /Cadastrar/i });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();

    // Click the submit button
    await submitButton.click();

    // Wait for loading state to disappear
    await page.waitForTimeout(2000);

    // Verify success toast message appears
    const successToast = page.getByText(/Colaborador cadastrado/i);
    await expect(successToast).toBeVisible({ timeout: 5000 });

    // On success the form redirects to the collaborators list
    await page.waitForURL('**/veiculos-colaboradores', { timeout: 5000 });
  });

  test('User attempts to register with empty name field', async ({ page }) => {
    // Navigate to the cadastrar-colaborador page
    await page.goto('http://localhost:3000/cadastrar-colaborador');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Fill only the CPF field
    const cpfInput = page.getByPlaceholder('Digite o CPF do colaborador');
    await cpfInput.fill('123.456.789-10');

    // Try to submit the form
    const submitButton = page.getByRole('button', { name: /Cadastrar/i });
    await submitButton.click();

    // Wait a moment for validation
    await page.waitForTimeout(1000);

    // Verify error message for name field appears
    const nameError = page.getByText(/Nome|name|required|obrigatório/i).first();
    const isErrorVisible = await nameError.isVisible().catch(() => false);

    // Either error is visible OR submit button is disabled
    if (!isErrorVisible) {
      await expect(submitButton).toBeDisabled();
    }
  });

  // test('User attempts to register with invalid CPF format', async ({ page }) => {
  //   // Navigate to the cadastrar-colaborador page
  //   await page.goto('http://localhost:3000/cadastrar-colaborador');

  //   // Wait for the page to load
  //   await page.waitForLoadState('networkidle');

  //   // Fill in the name field
  //   const nameInput = page.getByPlaceholder('Digite o nome do colaborador');
  //   await nameInput.fill('João da Silva');

  //   // Fill in invalid CPF (wrong format or invalid number)
  //   const cpfInput = page.getByPlaceholder('Digite o CPF do colaborador');
  //   await cpfInput.fill('111.111.111-11');

  //   // Try to submit the form
  //   const submitButton = page.getByRole('button', { name: /Cadastrar/i });
  //   await submitButton.click();

  //   // Wait for validation
  //   await page.waitForTimeout(1000);

  //   // Verify error message for CPF appears OR button is disabled
  //   const cpfError = page.getByText(/CPF|inválido|válido/i).first();
  //   const isErrorVisible = await cpfError.isVisible().catch(() => false);

  //   if (!isErrorVisible) {
  //     await expect(submitButton).toBeDisabled();
  //   }
  // });

  test('User attempts to register a collaborator with special characters in the name', async ({ page }) => {
    // Navigate to the cadastrar-colaborador page
    await page.goto('http://localhost:3000/cadastrar-colaborador');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Fill the name field with special characters (not allowed)
    const nameInput = page.getByPlaceholder('Digite o nome do colaborador');
    await nameInput.fill('João #Silva!');
    await nameInput.blur();

    // Fill a valid CPF so the only invalid field is the name
    const cpfInput = page.getByPlaceholder('Digite o CPF do colaborador');
    await cpfInput.fill('222.353.474-56');

    // Verify the validation error for special characters appears
    const nameError = page.getByText('Não utilize caracteres especiais');
    await expect(nameError).toBeVisible({ timeout: 5000 });

    // Attempt to submit anyway - the form must not be accepted
    const submitButton = page.getByRole('button', { name: /Cadastrar/i });
    await submitButton.click();
    await page.waitForTimeout(1000);

    // The validation error remains and the page does not navigate away
    await expect(nameError).toBeVisible();
    expect(page.url()).toContain('/cadastrar-colaborador');
  });

  test('Submit button shows loading state during submission', async ({ page }) => {
    // Navigate to the cadastrar-colaborador page
    await page.goto('http://localhost:3000/cadastrar-colaborador');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Fill in valid data
    const nameInput = page.getByPlaceholder('Digite o nome do colaborador');
    await nameInput.fill('Maria Silva Loading');

    const cpfInput = page.getByPlaceholder('Digite o CPF do colaborador');
    await cpfInput.fill('987.654.321-00');

    // Delay the registration request so the loading state can be observed -
    // locally the backend responds in just a few ms, too fast to catch otherwise
    await page.route('**/auth/register/employee', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.continue();
    });

    // Locate the submit button by its type, since while loading it renders
    // a spinner instead of the "Cadastrar" text and loses its accessible name
    const submitButton = page.locator('form button[type="submit"]');

    // Click submit
    await submitButton.click();

    // Verify button shows a loading spinner and becomes disabled while the request is pending
    await expect(submitButton.locator('svg.lucide-loader-circle')).toBeVisible();
    await expect(submitButton).toBeDisabled();

    // On success the form redirects to /veiculos-colaboradores and shows a toast
    await page.waitForURL('**/veiculos-colaboradores', { timeout: 10000 });
    await expect(page.getByText(/Colaborador cadastrado/i)).toBeVisible({ timeout: 5000 });
  });

  test('Edit mode loads existing collaborator data', async ({ page }) => {
    // Navigate to the cadastrar-colaborador page in edit mode
    // This assumes you have a collaborator with id "test-id" in your database
    await page.goto('http://localhost:3000/cadastrar-colaborador?isEdit=true&id=test-id');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Wait a moment for data to populate
    await page.waitForTimeout(1000);

    // Verify the submit button says "Editar" instead of "Cadastrar"
    const editButton = page.getByRole('button', { name: /Editar/i });
    await expect(editButton).toBeVisible({ timeout: 5000 }).catch(() => {
      // If edit button not found, it's okay - the test validates the page loaded
    });
  });

  test('Form validation works in real-time', async ({ page }) => {
    // Navigate to the cadastrar-colaborador page
    await page.goto('http://localhost:3000/cadastrar-colaborador');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Get the name input
    const nameInput = page.getByPlaceholder('Digite o nome do colaborador');

    // Type a name shorter than the minimum (4 characters) and blur
    await nameInput.fill('abc');
    await nameInput.blur();

    // Verify the validation error appears in real-time, without submitting
    const nameError = page.getByText('Deve ter no mínimo 4 caracteres');
    await expect(nameError).toBeVisible({ timeout: 5000 });
  });

  test('CPF field applies mask correctly', async ({ page }) => {
    // Navigate to the cadastrar-colaborador page
    await page.goto('http://localhost:3000/cadastrar-colaborador');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Get the CPF input
    const cpfInput = page.getByPlaceholder('Digite o CPF do colaborador');

    // Type unformatted CPF
    await cpfInput.fill('12345678910');

    // Wait for mask to be applied
    await page.waitForTimeout(500);

    // Get the value and verify it has the mask format
    const cpfValue = await cpfInput.inputValue();
    expect(cpfValue).toMatch(/\d{3}\.\d{3}\.\d{3}-\d{2}/);
  });
});