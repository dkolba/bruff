# Frame-by-Frame ANSI Render Test - Constraints

## Runtime Boundaries

- `@bruff/cli` runtime and test source may import Node built-ins, `@bruff/glyph`, and the public `@bruff/game/headless` subpath only.
- `@bruff/cli` must not import `@bruff/game` root, `@bruff/game` internals, `@bruff/game-element`, `@bruff/arcade`, `@bruff/sigil`, `@bruff/utils`, or workspace internals.
- ANSI terminal control remains encoded in `packages/cli/module/ansi.ts`.
- `process.stdin`, `process.stdout`, raw mode, and input listeners remain in `packages/cli/bin/bruff-cli.ts`.

## Test Runner

- CLI tests use native Node TypeScript execution with `node:test` and `node:assert/strict`.
- CLI tests must not use Vitest, Jest, Playwright, Vite, DOM APIs, browser globals, jsdom, `tsx`, `ts-node`, Babel, a real TTY, or a pseudo-terminal.
- Tests assert public exports and injected ports only.

## Determinism

- Frame stepping must not read wall-clock time, sleep, use timers, or wait for asynchronous terminal events.
- `stepFrames(n)` must be synchronous.
- `getState()` and `loadState()` must clone state at the boundary.
- Writer errors must be value returns, not expected exceptions escaping into callers.

## API Shape

- No `GameState` shape change is part of this work.
- No browser query parameter or global test API is part of this work.
- New public TypeScript types must be readonly and documented with TSDoc when implemented.
- Frame count normalization must be deterministic for zero, negative, fractional, `NaN`, and infinite values.
