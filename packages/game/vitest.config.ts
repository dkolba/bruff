/// <reference types="@vitest/browser/providers/playwright" />

import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      headless: true,
      // https://vitest.dev/guide/browser/playwright
      instances: [
        { browser: "chromium" },
        { browser: "firefox" },
        { browser: "webkit" },
      ],
      provider: playwright(),
    },
    coverage: {
      exclude: [
        "**/*spec*{js,ts,jsx,tsx}",
        "lib/bruff-game.ts",
        "lib/loop.ts",
        "lib/constants.ts",
        "lib/observable/merge.ts",
      ],
      include: ["lib/**/*.ts"],
      reporter: ["text", "json", "html"],
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
    exclude: ["**/*spec*{js,ts,jsx,tsx}"],
    include: ["lib/**/*test*.{js,ts,jsx,tsx}"],
    setupFiles: ["tests/setup.ts"],
  },
});
