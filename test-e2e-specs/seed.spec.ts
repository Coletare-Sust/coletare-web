// specs/seed.spec.ts
import { test } from './fixtures';

test('authenticate user', async ({ page, context }) => {
  await page.goto('http://localhost:3000');

  await page.getByPlaceholder('Insira seu email')
    .fill(process.env.E2E_EMAIL!);

  await page.getByPlaceholder('Insira sua senha')
    .fill(process.env.E2E_PASSWORD!);

  await page.getByRole('button', { name: /Entrar/i }).click();

  // Wait for redirect to dashboard before saving session
  await page.waitForURL('**/dashboard', { timeout: 30000 });

  await context.storageState({ path: 'auth.json' });
});

