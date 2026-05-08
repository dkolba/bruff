// @ts-check
import {
  overrideRulesEslint,
  overrideRulesTsdoc,
  overrideRulesTslint,
  overrideRulesUnicorn,
  overrideRulesWebComponents,
} from "./rules.js";
import eslint from "@eslint/js";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import globals from "globals";
import tsdoc from "eslint-plugin-tsdoc";
import tseslint from "typescript-eslint";
import { configs as wcconfigs } from "eslint-plugin-wc";

const typescriptFiles = { files: ["**/*.ts"] };

const rules = {
  eslint: {
    rules: { ...eslint.configs.all.rules, ...overrideRulesEslint },
  },
  tsdoc: {
    rules: {
      // Special case, existing rules need no destructuring because they will not be overridden
      ...overrideRulesTsdoc,
    },
  },
  tseslint: {
    rules: {
      // Special case, existing rules need no destructuring because they will not be overridden
      ...overrideRulesTslint,
    },
  },
  unicorn: {
    rules: {
      ...eslintPluginUnicorn.configs.all.rules,
      ...overrideRulesUnicorn,
    },
  },
  webComponents: {
    rules: {
      ...wcconfigs["flat/recommended"].rules,
      ...overrideRulesWebComponents,
    },
  },
};

const unicornTypescriptConfig = {
  ...typescriptFiles,
  ...eslintPluginUnicorn.configs.all,
  ...rules.unicorn,
};

const eslintTypescriptConfig = {
  ...typescriptFiles,
  languageOptions: {
    globals: {
      ...globals.node,
      ...globals.serviceworker,
      ...globals.browser,
    },
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      project: true,
    },
  },
  ...eslint.configs.recommended,
  ...rules.eslint,
};

const tslintTypescriptConfig = {
  ...typescriptFiles,
  extends: [tseslint.configs.recommended],
  ...rules.tseslint,
};

const tsdocTypescriptConfig = {
  ...typescriptFiles,
  plugins: {
    tsdoc,
  },
  ...rules.tsdoc,
};

const webComponentsConfig = {
  ...typescriptFiles,
  ...wcconfigs["flat/recommended"],
  settings: {
    wc: {
      elementBaseClasses: ["GameElement"], // Recognize `GameElement` as a Custom Element base class
    },
  },
  ...rules.webComponents,
};

const layerImportRestrictions = [
  {
    files: ["**/lib/core/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "**/state/**",
                "**/input/**",
                "**/render/**",
                "**/effects/**",
              ],
              message:
                "core/ must have zero imports from outer layers (state, input, render, effects). See packages-game.md A-1.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/lib/state/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/input/**", "**/render/**", "**/effects/**"],
              message:
                "state/ may import from core/ only. See packages-game.md A-4.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/lib/input/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/render/**", "**/effects/**"],
              message:
                "input/ may import from core/ and state/ only. See packages-game.md A-4.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/lib/render/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/input/**", "**/effects/**"],
              message:
                "render/ may import from core/ and state/ only. See packages-game.md A-4.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/lib/effects/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/input/**", "**/render/**"],
              message:
                "effects/ may import from core/ and state/ only. See packages-game.md A-4.",
            },
          ],
        },
      ],
    },
  },
];

const typescriptConfig = tseslint.config(
  // General
  // @ts-ignore
  eslintTypescriptConfig,
  // Unicorn
  // @ts-ignore
  unicornTypescriptConfig,
  // Typescript
  tslintTypescriptConfig,
  // TSDoc
  tsdocTypescriptConfig,
  webComponentsConfig,
  // Layer-boundary import restrictions (packages-game.md A-1..A-4)
  ...layerImportRestrictions,
);

export default typescriptConfig;
