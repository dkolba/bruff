import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      headless: true,
      instances: [
        { browser: "chromium" },
        { browser: "firefox" },
        { browser: "webkit" },
      ],
      // https://vitest.dev/guide/browser/playwright
      provider: playwright(),
    },
    coverage: {
      // Only collect coverage for files in the 'module' folder
      exclude: ["vitest.config.ts", "eslint.config.js", "**/*.d.ts"],
      include: ["module/**/*.ts"],
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
    include: ["**/*.test.ts"], // Match test files
  },
});
