import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@bruff/utils": new URL("index.ts", import.meta.url).pathname,
    },
  },
  test: {
    environment: "node",
    include: ["module/**/*.node.test.ts"],
    isolate: true,
  },

  coverage: {
    // Only collect coverage for files in the 'module' folder
    exclude: [
      "index.js",
      "vitest.config.ts",
      "vitest.node.config.ts",
      "eslint.config.js",
      "**/*.d.ts",
    ],
    include: ["module/**/*.ts"],
    thresholds: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
});
