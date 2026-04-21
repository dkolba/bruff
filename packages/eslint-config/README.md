# @bruff/eslint-config

Opinionated plain eslint config

## ESLint config

Use this to extend eslint.config.js:

```js
import bruffeslintConfig from "@bruff/eslint-config";

export default [
  {
    ignores: ["**/*.css", "coverage/**/*.*"],
  },
  ...bruffEslintConfig,
];
```
