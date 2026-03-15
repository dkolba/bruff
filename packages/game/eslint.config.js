import bruffEslintConfig from "@bruff/eslint-config";
import { defineConfig } from "eslint/config";
import playwright from "eslint-plugin-playwright";

export default defineConfig([
  {
    files: ["app.ts", "lib/**/*.ts"],
    extends: [...bruffEslintConfig],
  },
  {
    files: ["**/*.spec.ts"],
    extends: [playwright.configs["flat/recommended"]],
    rules: {
      // Customize Playwright rules
      // ...
    },
  },
  {
    ignores: [
      "dist",
      "**/*.css",
      "**/*.scss",
      "coverage/**/*.*",
      "e2e/base-fixtures.ts",
    ],
  },
]);
