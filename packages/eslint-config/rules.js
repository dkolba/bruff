/**
 * ESLint rule overrides for TSLint plugin
 */
export const overrideRulesTslint = {
  "@typescript-eslint/ban-ts-comment": [
    "error",
    {
      "ts-check": true,
      "ts-expect-error": false,
      "ts-ignore": true,
      "ts-nocheck": true,
    },
  ],
  "@typescript-eslint/consistent-type-assertions": [
    "error",
    { assertionStyle: "never" },
  ],
  "@typescript-eslint/consistent-type-imports": [
    "error",
    { prefer: "type-imports" },
  ],
  "@typescript-eslint/dot-notation": "error",
  "@typescript-eslint/explicit-function-return-type": [
    "warn",
    {
      allowConciseArrowFunctionExpressionsStartingWithVoid: false,
      allowExpressions: false,
      allowFunctionsWithoutTypeParameters: false,
      allowHigherOrderFunctions: true,
      allowIIFEs: false,
      allowTypedFunctionExpressions: true,
    },
  ],
  "@typescript-eslint/no-unnecessary-type-assertion": "error",
  "@typescript-eslint/no-unsafe-assignment": "error",
  "@typescript-eslint/no-unsafe-member-access": "error",
  "@typescript-eslint/no-unsafe-return": "error",
};

/**
 * ESLint rule overrides for TSDoc plugin
 */
export const overrideRulesTsdoc = {
  "tsdoc/syntax": "warn",
};

/**
 * ESLint rule overrides for the unicorn plugin
 */
export const overrideRulesUnicorn = {
  "unicorn/better-regex": "warn",
  "unicorn/no-array-reduce": "off",
  "unicorn/no-null": "off",
  "unicorn/try-complexity": ["error", { max: 2 }],
  "unicorn/prefer-includes-over-repeated-comparisons": [
    "error",
    { minimumComparisons: 5 },
  ],
  "unicorn/prefer-dom-node-html-methods": "off", // Set to "true" when baseline: https://developer.mozilla.org/en-US/docs/Web/API/Element/setHTML
  "unicorn/no-unsafe-dom-html": "off", // Set to "true" when baseline: https://developer.mozilla.org/en-US/docs/Web/API/Element/setHTML
  "unicorn/prefer-minimal-ternary": "off",
  "unicorn/prefer-scoped-selector": "off",
};

/**
 * ESLint rule overrides for ESLint
 */
export const overrideRulesEslint = {
  "capitalized-comments": [
    "error",
    "always",
    { ignorePattern: "(?:c8|v8|node:coverage) ignore" },
  ],
  "dot-notation": "off",
  "func-names": ["error", "always", { generators: "never" }],
  "max-lines": ["error", { skipBlankLines: true }],
  "no-console": ["error", { allow: ["info", "warn", "error"] }],
  "no-inline-comments": "off",
  "no-ternary": "off",
  "no-undefined": "off",
  "no-underscore-dangle": ["error", { allow: ["__dirname", "_exhaustive"] }],
  "no-unused-vars": [
    "error",
    { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
  ],
  "one-var": "off",
  "sort-imports": "off", // Will be sorted via simple-import-sort
};

/**
 * ESLint rule overrides for the "WC" Web Components plubin
 */
export const overrideRulesWebComponents = {
  // Web Components
  "wc/define-tag-after-class-definition": "error",
  "wc/expose-class-on-global": "off",
  "wc/file-name-matches-element": "error",
  "wc/guard-define-call": "error",
  "wc/max-elements-per-file": "error",
  "wc/no-constructor": "error",
  "wc/no-exports-with-element": "error",
  "wc/no-method-prefixed-with-on": "error",
  "wc/tag-name-matches-class": "error",
};

export const overrideRulesSimpleImportSort = {
  "simple-import-sort/imports": "error",
  "simple-import-sort/exports": "error",
};
