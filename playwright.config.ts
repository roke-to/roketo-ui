import type {PlaywrightTestConfig} from '@playwright/test';
import {devices} from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';
import yn from 'yn';

const dotenvFiles = ['.env.local', '.env'];

dotenvFiles.forEach((dotenvFile) => {
  if (fs.existsSync(dotenvFile)) {
    dotenv.config({path: dotenvFile});
  }
});

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  /* Maximum time one test can run for. */
  timeout: 5 * 60 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 20000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 1,
  /* Opt out of parallel tests on CI. */
  workers: 5, //process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on',
    headless: yn(process.env.E2E_HEADLESS),
    screenshot: 'only-on-failure',
    video: 'retry-with-video',
    // video: 'on',
  },

  /* Configure projects for major browsers */
  projects: yn(process.env.E2E_LOCAL)
    ? [
        {
          name: 'chromium',
          use: {
            ...devices['Desktop Chrome'],
          },
        },
      ]
    : [
        {
          name: 'chromium',
          use: {
            ...devices['Desktop Chrome'],
          },
        },

        {
          name: 'firefox',
          use: {
            ...devices['Desktop Firefox'],
          },
        },

        // {
        //   name: 'webkit',
        //   use: {
        //     ...devices['Desktop Safari'],
        //   },
        // },

        /* Test against mobile viewports. */
        // {
        //   name: 'Mobile Chrome',
        //   use: {
        //     ...devices['Pixel 5'],
        //   },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: {
        //     ...devices['iPhone 12'],
        //   },
        // },

        /* Test against branded browsers. */
        // {
        //   name: 'Microsoft Edge',
        //   use: {
        //     channel: 'msedge',
        //   },
        // },
        // {
        //   name: 'Google Chrome',
        //   use: {
        //     channel: 'chrome',
        //   },
        // },
      ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'yarn start',
    port: 3000,
    reuseExistingServer: true,
  },
};

// ts-unused-exports:disable-next-line
export default config;
