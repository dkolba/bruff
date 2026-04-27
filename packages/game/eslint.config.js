import bruffEslintConfig from "@bruff/eslint-config";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["lib/**/*.ts"],
    extends: [...bruffEslintConfig],
  },
  {
    ignores: ["dist", "**/*.css", "coverage/**/*.*"],
  },
]);
