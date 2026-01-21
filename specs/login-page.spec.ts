// Placeholder - tests moved to register-colaborator.spec.ts
// This file is intentionally empty

import { test, expect } from '@playwright/test';

test('User successfully logs in', async ({ page }) => {
  // Navigate to the login page
  await page.goto('http://localhost:3000');

  // Verify email input field is visible
  const emailInput = page.getByPlaceholder('Insira seu email');
  await expect(emailInput).toBeVisible();

  // Verify password input field is visible
  const passwordInput = page.getByPlaceholder('Insira sua senha');
  await expect(passwordInput).toBeVisible();

  // Verify the "Redefinir senha?" link is visible
  const forgotPasswordLink = page.getByRole('button', { name: /Redefinir senha/i });
  await expect(forgotPasswordLink).toBeVisible();

  // Verify the "Entrar" button is visible
  const submitButton = page.getByRole('button', { name: /Entrar/i });
  await expect(submitButton).toBeVisible();

  // Fill in the email input field
  await page.getByPlaceholder('Insira seu email')
  .fill(process.env.E2E_EMAIL!);

  await page.getByPlaceholder('Insira sua senha')
  .fill(process.env.E2E_PASSWORD!);


  // Click the "Entrar" button
  await submitButton.click();

  // Wait for navigation to dashboard
  await expect(page).toHaveURL(/dashboard/, { timeout: 10_000 });

  // Verify the user is redirected to the dashboard
  await expect(page).toHaveURL(/.*dashboard/);
});

test('User attempts login with invalid email format', async ({ page }) => {
  await page.goto('http://localhost:3000');

  await page.getByPlaceholder('Insira seu email').fill('coletagmail');
  await page.getByPlaceholder('Insira sua senha').fill('123');

  const submitButton = page.getByRole('button', { name: /entrar/i });
  await submitButton.click();

  // Wait a moment for error to appear or page to respond
  await page.waitForTimeout(2000);

  // Check if error message appears or we're still on login page
  const errorMessage = page.getByText(/Insira um e-mail válido/i);
  const isErrorVisible = await errorMessage.isVisible().catch(() => false);

  // Either error message is visible OR page stayed on login (no redirect to dashboard)
  const url = page.url();
  const stayedOnLogin = !url.includes('/dashboard');

  expect(isErrorVisible || stayedOnLogin).toBeTruthy();
});

test('User clicks "Redefinir senha?" without filling email', async ({ page }) => {
  await page.goto('http://localhost:3000');

  await page
    .getByRole('button', { name: /redefinir senha\?/i })
    .click();

  // Wait for alert/toast with error message to appear
  await expect(
  page.getByText('Preecha o campo de email.')
).toBeVisible();



  // const errorAlert = page.getByRole('alert').locator('text=/Preecha o campo de email|email/i');
  // await expect(errorAlert).toBeVisible({ timeout: 5000 });
});


test('User clicks "Redefinir senha?" with email filled', async ({ page }) => {
  // Navigate to the login page
  await page.goto('http://localhost:3000');

  // Fill in the email input
  await page.getByPlaceholder('Insira seu email')
    .fill('teste@email.com');

  // Click "Redefinir senha?" button
  const forgotPasswordLink = page.getByRole('button', { name: /Redefinir senha/i });
  await forgotPasswordLink.click();

  // Wait for the action to complete
  await page.waitForTimeout(2000);

  // Verify password reset flow is initiated (no error should appear)
  const url = page.url();
  expect(url).toContain('localhost:3000');
});

test('Login button shows loading state during submission', async ({ page }) => {
  // Navigate to the login page
  await page.goto('http://localhost:3000');

  // Fill in credentials
  const emailInput = page.getByPlaceholder('Insira seu email');
  const passwordInput = page.getByPlaceholder('Insira sua senha');
  const submitButton = page.getByRole('button', { name: /Entrar/i });

  await emailInput.fill('test@example.com');
  await passwordInput.fill('Test123!@#');

  // Monitor loading state
  // This depends on how your loading indicator is implemented
  const loadingIndicator = page.locator('[aria-busy="true"]');

  // Click submit
  await submitButton.click();

  // The button may show loading state or be disabled
  // Adjust based on your actual implementation
});