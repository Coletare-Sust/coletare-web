import { test as base, expect, Page } from '@playwright/test';
import MCR from 'monocart-coverage-reports';
import mcrConfig from '../mcr.config';

export const test = base.extend<{ autoCoverage: void }>({
  autoCoverage: [async ({ context }, use) => {
    const isChromium = test.info().project.name === 'chromium';

    const onPage = async (page: Page) => {
      await Promise.all([
        page.coverage.startJSCoverage({ resetOnNavigation: false }),
        page.coverage.startCSSCoverage({ resetOnNavigation: false }),
      ]);
    };

    if (isChromium) context.on('page', onPage);
    await use();

    if (isChromium) {
      context.off('page', onPage);
      const coverage = await Promise.all(context.pages().map(async (page) => {
        const js = await page.coverage.stopJSCoverage();
        const css = await page.coverage.stopCSSCoverage();
        return [...js, ...css];
      }));
      await MCR(mcrConfig).add(coverage.flat());
    }
  }, { scope: 'test', auto: true }],
});

export { expect };
