import bruffEslintConfig from "@bruff/eslint-config";

export default [
  {
    ignores: ["**/*.css", "coverage/**/*.*"],
  },
  ...bruffEslintConfig,
];
