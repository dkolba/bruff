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
      provider: playwright(),
    },
    coverage: {
      exclude: [
        "vitest.config.ts",
        "eslint.config.js",
        "**/*.d.ts",
        "**/*test-support.ts",
      ],
      include: ["module/**/*.ts"],
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
    include: ["**/*.test.ts"],
    isolate: true,
  },
});
