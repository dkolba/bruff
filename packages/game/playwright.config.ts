import { defineConfig, devices } from "@playwright/test";

const ONE = 1;
const TWO = 2;
const ZERO = 0;

export default defineConfig({
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    /* Test against mobile viewports. */
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? "github" : "html",
  retries: process.env.CI ? TWO : ZERO,
  // Ignore vites tests
  testIgnore: "*.test.ts",
  // Run E2E specs
  testMatch: "*.spec.ts",
  use: {
    // headless: Boolean(process.env.CI),
    headless: true,
    launchOptions: {
      slowMo: 500,
    },
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    /* Create videos if Playwright fails on first retry */
    video: "on-first-retry",
  },
  webServer: {
    command: "pnpm run dev",
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? ONE : undefined,
});
