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
);

export default typescriptConfig;
