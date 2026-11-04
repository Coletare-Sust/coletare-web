import { test, expect } from '../fixtures';

test.describe('Dashboard - Visão Geral', () => {
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
    await page.waitForLoadState('networkidle');

    // platformAdmin users get redirected again to /dashboard?city=<id>, which
    // triggers the dashboard data fetch. Wait for that redirect (if any) and
    // for the resulting fetch to settle, otherwise the chart-vs-empty-state
    // check below can race the redirect under parallel load and report
    // "no data" before the real dashboard data has a chance to arrive.
    await page.waitForURL(/[?&]city=/, { timeout: 20000 }).catch(() => {});
    await page.waitForLoadState('networkidle');
  });

  test('Dashboard page loads with "Visão Geral" title and either the charts or the empty state', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Visão Geral/i })).toBeVisible();

    // Either the charts are rendered (city has dashboard data) or the empty state message is shown
    const costsChart = page.getByText('Relação de custos (R$)');
    const emptyState = page.getByText(/Ainda não há dados pra mostrar/i);

    await expect(costsChart.or(emptyState)).toBeVisible({ timeout: 15000 });
  });

  // Each chart (custos/massa/emissões) shares the same Anual/Semestral/Mensal
  // dropdown shape, but switches a different chart component (stacked vs. bar)
  const chartTitles = [
    'Relação de custos (R$)',
    'Massa coletada (ton)',
    'Emissões (kgCO2eq/L)'
  ];

  for (const chartTitle of chartTitles) {
    test(`${chartTitle} - period dropdown switches from Anual to Mensal`, async ({ page }) => {
      const section = page.locator('section').filter({ hasText: chartTitle }).last();
      const emptyState = page.getByText(/Ainda não há dados pra mostrar/i);

      // Wait for the dashboard to finish loading (charts or empty state)
      await expect(section.or(emptyState)).toBeVisible({ timeout: 15000 });

      // Skip if the dashboard has no data and shows the empty state instead of the charts
      const hasChart = await section.isVisible();
      test.skip(!hasChart, 'Dashboard sem dados - gráficos não renderizados');

      // Default period is "Análise Anual"
      const trigger = section.getByText('Análise Anual', { exact: true });
      await expect(trigger).toBeVisible();

      await trigger.click();

      await expect(page.getByRole('menuitem', { name: 'Análise Anual' })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: 'Análise Semestral' })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: 'Análise Mensal' })).toBeVisible();

      // Switch to the monthly view
      await page.getByRole('menuitem', { name: 'Análise Mensal' }).click();
      await expect(section.getByText('Análise Mensal', { exact: true })).toBeVisible();
    });
  }

  test('Dashboard header "more options" menu exports the city report as an Excel file', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Visão Geral/i })).toBeVisible();

    // Icon-only trigger (lucide "EllipsisVertical"/"more-vertical" icon) for the header's options menu
    const trigger = page.locator('svg.lucide-ellipsis-vertical');
    const exportOption = page.getByRole('menuitem', { name: 'Extrair informação' });

    // Re-click if a re-render closes the menu before it can be asserted
    await expect(async () => {
      await trigger.click();
      await expect(exportOption).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 15000 });

    // Clicking the option exports the dashboard data (exportExcel -> file-saver download)
    const downloadPromise = page.waitForEvent('download');
    await exportOption.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^Relatório - .+\.xlsx$/);
  });
});
