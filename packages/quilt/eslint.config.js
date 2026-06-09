import bruffEslintConfig from "@bruff/eslint-config";

export default [
  {
    ignores: ["**/*.css", "coverage/**/*.*"],
  },
  ...bruffEslintConfig,
  {
    files: ["module/**/*.test.ts"],
    rules: {
      "max-lines-per-function": "off",
      "max-statements": "off",
      "no-magic-numbers": "off",
      "sort-keys": "off",
    },
  },
  {
    files: ["module/render/**/*.ts", "module/render/**/*.test.ts"],
    rules: {
      "id-length": "off",
      "max-params": "off",
      "no-use-before-define": "off",
    },
  },
  {
    files: ["module/quilt-element.ts"],
    rules: {
      "capitalized-comments": "off",
      "no-use-before-define": "off",
      "wc/no-exports-with-element": "off",
    },
  },
  {
    files: [
      "module/controller/quilt-controller.ts",
      "module/controller/quilt-controller.test.ts",
    ],
    rules: {
      "max-lines-per-function": "off",
      "unicorn/prefer-dom-node-dataset": "off",
    },
  },
  {
    files: ["module/runtime/quilt-runtime.ts"],
    rules: {
      "capitalized-comments": "off",
    },
  },
];
