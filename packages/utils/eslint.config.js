import bruffEslintConfig from "@bruff/eslint-config";

export default [
  {
    ignores: ["**/*.css", "**/*.scss", "coverage/**/*.*"],
  },
  ...bruffEslintConfig,
];
