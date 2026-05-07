# @bruff/eslint-config

Opinionated shared ESLint flat config for TypeScript projects in this monorepo. Targets `**/*.ts` files and requires ESLint 9+.

## Usage

```js
// eslint.config.js
import bruffEslintConfig from "@bruff/eslint-config";

export default [
  {
    ignores: ["**/*.css", "coverage/**/*.*"],
  },
  ...bruffEslintConfig,
];
```

## What's included

The config composes five layers in order — later layers override earlier ones:

| Layer          | Plugin                  | Starting point      |
| -------------- | ----------------------- | ------------------- |
| Core JS        | `@eslint/js`            | `all`               |
| Best practices | `eslint-plugin-unicorn` | `all`               |
| TypeScript     | `typescript-eslint`     | strict + type-aware |
| Docs           | `eslint-plugin-tsdoc`   | warnings            |
| Web Components | `eslint-plugin-wc`      | recommended         |

### Notable enforcements

- **`import type`** required for type-only imports
- **Type assertions** (`as`, `<Type>`) disallowed — use type guards, `satisfies`, or generics
- **Unsafe TypeScript** (`@ts-ignore`, unsafe assignments/member access) forbidden
- **Console** restricted to `.info`, `.warn`, `.error` — `.log` is blocked
- **Web Components** — one element per file, tag name must match class name, no `on`-prefixed methods, no constructors

### Notable relaxations from `all`/strict defaults

- `unicorn/no-array-reduce` — disabled (`.reduce()` is allowed)
- `unicorn/no-null` — disabled (`null` is allowed)
- `no-ternary`, `no-inline-comments`, `no-underscore-dangle` — disabled
