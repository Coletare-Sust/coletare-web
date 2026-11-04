import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:3000');

  await page.getByPlaceholder('Insira seu email')
    .fill(process.env.E2E_A_EMAIL!);

  await page.getByPlaceholder('Insira sua senha')
    .fill(process.env.E2E_A_PASSWORD!);

  await page.getByRole('button', { name: /Entrar/i }).click();

  // Wait for redirect to dashboard before saving session
  await page.waitForURL('**/dashboard', { timeout: 30000 });

  // 🔐 salva sessão autenticada
  await page.context().storageState({ path: './auth.json' });

  await browser.close();
}

export default globalSetup;
