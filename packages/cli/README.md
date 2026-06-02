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

## Frame-Step Terminal Tests

Native tests can drive the ANSI terminal renderer one frame at a time through
`createAnsiFrameStepDriver()`. The driver creates or loads a deterministic
`GameState`, queues raw terminal input with `dispatchInput()`, renders the
current state with `renderFrame()`, and advances fixed frame counts with
`stepFrames(frameCount)`.

Each stepped frame returns the cloned game state, headless frame, terminal cell
frame, encoded ANSI text, render stats, and typed writer result. This lets tests
assert state and terminal output without opening a terminal, parsing escape
codes first, or depending on timers.

```ts
const driver = createAnsiFrameStepDriver({ writer });

driver.dispatchInput("\u001B[C");
const result = driver.stepFrames(1);
```

`stepFrames(1)` renders exactly one ANSI frame. Queued movement input advances
the logical game tick once before rendering; calls with no queued movement still
render but preserve `frameIndex`. `loadState(state)` replaces the running state
with a clone and clears queued input.
