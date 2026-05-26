# @bruff/cli

Terminal ANSI renderer spike for deterministic Bruff mock scenes.

## Scope

`@bruff/cli` renders fixed mock terminal cells to ANSI text. It proves screen
clearing, cursor movement, truecolor foregrounds, truecolor backgrounds, glyph
output, prompt cleanup, and style reset behaviour without importing game state
or render commands.

Runtime and test source may import Node built-ins and `@bruff/glyph`. The package
does not import `@bruff/game`, `@bruff/game-element`, `@bruff/arcade`, or
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

When run in an interactive terminal, the command draws the mock scene and waits
until the user presses `q`, `Q`, or `Ctrl+C`. The implementation uses injected
input/output ports in tests, so tests do not need a real TTY.

## Deferred Integration

This package is mock-only. A later spec can connect terminal rendering to
game-owned data through an explicit public game API. This package must not deep
import game internals or introduce shared renderer types for game packages.
