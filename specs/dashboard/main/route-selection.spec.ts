// spec: specs/dashboard/main/dashboard.plan.md
// seed: specs/seed.spec.ts

import { expect, test } from '@playwright/test';

test.describe('Dashboard - Route & Date Filtering', () => {
  test.beforeEach(async ({ page }) => {
    // 🔐 LOGIN REAL (fluxo de usuário)
    await page.goto('http://localhost:3000');

    await page.getByPlaceholder('Insira seu email')
      .fill(process.env.E2E_EMAIL!);

    await page.getByPlaceholder('Insira sua senha')
      .fill(process.env.E2E_PASSWORD!);

    await page.getByRole('button', { name: /Entrar/i }).click();

    // Wait for redirect to dashboard after login
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });
  
  test('Route picker opens and supports search-as-you-type', async ({ page }) => {
    // 1. Open `/dashboard`.
    await page.goto('/dashboard');

    // 2. Click the route combobox to open the route picker dialog.
    await page.getByRole('combobox').click();

    // 3. Type into the route search field.
    // Use a route that is expected to have collects so the DatePicker has active days.
    await page.getByPlaceholder('Pesquisar rota').pressSequentially('IFPE');

    // 4. Select the route.
    await page.getByRole('option', { name: /Teste\s*-\s*IFPE/i }).first().click();

    // Ensure the selection applied before interacting with the date picker.
    await expect(page.getByRole('main').getByRole('combobox')).toContainText(
      /IFPE/i
    );

    // 5. Select a date (required to filter routes on the dashboard).
    const filterForm = page.locator('main form').first();
    const dateButton = filterForm.getByRole('button', {
      name: /Selecione uma data|\d{2}\/\d{2}\/\d{4}/
    });
    await dateButton.click();

    // Pick the first enabled day across a small range of months.
    // (Days are disabled when they are not present in `activeDays`.)
    const prevMonthButton = page.getByRole('button', { name: 'Go to previous month' });
    const enabledDayButton = page.locator('[role="gridcell"]:not([disabled])').first();
    let foundEnabledDay = false;

    for (let i = 0; i < 18; i++) {
      if ((await enabledDayButton.count()) > 0) {
        await enabledDayButton.click();
        foundEnabledDay = true;
        break;
      }
      await prevMonthButton.click();
    }

    expect(foundEnabledDay).toBeTruthy();

    // Confirm the date button now shows a formatted date.
    await expect(dateButton).toContainText(/\d{2}\/\d{2}\/\d{4}/);

    // The dialog closes and the combobox shows the selected route.
    await expect(page.getByRole('main').getByRole('combobox')).toContainText(/IFPE/i);
        // 6. Click the search button to navigate to the route page.
    await page.getByRole('button', { name: 'Pesquisar rota' }).click();

    // Wait for the route page to load and verify route data is displayed.
    await expect(page.getByRole('heading', { name: /Teste\s*-\s*IFPE/i, level: 1 })).toBeVisible({ timeout: 15000 });
  });
});
