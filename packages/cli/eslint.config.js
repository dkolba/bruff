import bruffEslintConfig from "@bruff/eslint-config";

export default [
  {
    ignores: ["coverage/**/*.*"],
  },
  ...bruffEslintConfig,
];
