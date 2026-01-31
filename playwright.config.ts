import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });


/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  globalSetup: require.resolve('./specs/auth.setup'),
  testDir: './specs',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
   timeout: 60_0000,

  expect: {
    timeout: 10_0000,
  },

  use: {
    headless: false,
    actionTimeout: 15_0000,
    navigationTimeout: 300_000,
    baseURL: 'http://localhost:3000',
    storageState: './auth.json',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },

  projects: [
    // Setup project
    { name: 'setup', testMatch: /auth\.setup\.ts/ },

    // Test projects that depend on setup
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    //   dependencies: ['setup'],
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    //   dependencies: ['setup'],
    // },
  ],
});