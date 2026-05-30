# @bruff/cli

Terminal ANSI renderer for deterministic Bruff headless game frames.

## Scope

`@bruff/cli` renders DOM-free game frames from `@bruff/game/headless` to ANSI
text. It owns terminal cells, screen clearing, cursor movement, truecolor
foregrounds, truecolor backgrounds, glyph output, prompt cleanup, and style reset
behaviour. Game state and render commands stay behind the public headless game
API.

Runtime and test source may import Node built-ins, `@bruff/glyph`, and
`@bruff/game/headless`. The package must not import `@bruff/game` root,
`@bruff/game` internals, `@bruff/game-element`, `@bruff/arcade`, or
`@bruff/utils`.

## Commands

```sh
pnpm --filter @bruff/cli run cli
pnpm --filter @bruff/cli run test
pnpm --filter @bruff/cli run typecheck
pnpm --filter @bruff/cli run lint
pnpm --filter @bruff/cli run format
```

The `cli` command runs `.ts` files directly through native Node.js TypeScript
support. Tests use `node:test` and `node:assert/strict`; no browser, DOM,
runtime transpiler, bundler, Vitest, Jest, or Playwright runtime is used.

When run in an interactive terminal, the command draws a headless game frame and
waits for movement keys or quit shortcuts (`q`, `Q`, or `Ctrl+C`). The implementation
uses injected input/output ports in tests, so tests do not need a real TTY.
