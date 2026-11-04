// spec: specs/smoke/smoke.plan.md
// seed: specs/auth.setup.ts

import { test, expect } from '../fixtures';

test.describe('Smoke tests', () => {
  const paths = ['/', '/cadastrar-veiculo'];

  test('critical pages respond and render', async ({ page }) => {
    for (const p of paths) {
      const res = await page.goto(p);
      expect(res && res.ok()).toBeTruthy();
      await page.waitForTimeout(300);
      const title = await page.title().catch(() => '');
      expect(title.length).toBeGreaterThan(0);
    }
  });
});
