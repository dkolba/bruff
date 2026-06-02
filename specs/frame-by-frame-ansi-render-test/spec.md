# Frame-by-Frame ANSI Render Test

## Goal

Enable `@bruff/cli` tests to drive the terminal game deterministically one frame at a time, using the same state-first testing idea that `packages/arcade/e2e` applies through `window.__bruffTestApi` in `?test=1` mode. Native Node tests should be able to create or load a known `GameState`, queue terminal input text, step a fixed number of frames, and assert both the resulting game state and the ANSI output written by the CLI without opening a real terminal, using Playwright, or depending on wall-clock timing.

## User-visible behaviour

- `@bruff/cli` exposes a testable terminal frame-step control surface from package source, not from a browser global.
- Tests can create a deterministic terminal driver from a seed and canvas size or from an explicit `GameState`.
- Tests can read the current `GameState` as a clone so assertions cannot mutate live driver state.
- Tests can replace the running state with a supplied `GameState` and clear queued input.
- Tests can queue raw terminal input strings such as arrow escape sequences, WASD keys, and ignored text.
- Tests can call `stepFrames(frameCount)` and receive the final state plus the ANSI frames produced during that call.
- `stepFrames(1)` renders exactly one terminal frame. If movement input was queued, it advances the logical game tick once before rendering. If no movement input was queued, it renders without incrementing `frameIndex`.
- `stepFrames(n)` follows the browser test API semantics: queued input is consumed by the next frame, then later frames in the same call are render-only unless more input is queued between calls.
- Tests can inspect terminal render facts without parsing escape codes first: headless frame data, terminal cell data, encoded ANSI text, write result, and render stats.
- Tests can assert the actual writer output through an injected `TextWriter`, proving the CLI writes the same ANSI bytes that the pure render pipeline produced.
- Interactive `runBruffCli()` continues to work through injected `TextInput` and `TextWriter` ports, but its implementation uses the same frame-step path as native tests.
- The executable CLI remains unchanged for users: it draws a deterministic terminal scene, accepts movement keys, redraws after valid movement, ignores invalid input, and quits on `q`, `Q`, or `Ctrl+C`.

## Out of scope

- Adding `window.__bruffTestApi`, `?test=1`, Playwright, a browser runtime, DOM APIs, or custom elements to `@bruff/cli`.
- Opening a real TTY, pseudo-terminal, alternate screen, mouse mode, resize handling, or process signal handling.
- Full terminal screenshot testing.
- Terminal capability negotiation through `terminfo`.
- Changing `GameState` shape, `stateVersion`, replay fixture format, or browser test API behaviour.
- Importing `@bruff/game` root, `@bruff/game` internals, `@bruff/game-element`, `@bruff/arcade`, `@bruff/sigil`, `@bruff/utils`, or workspace internals from CLI source.
- Adding Vitest, Jest, Playwright, Vite, `tsx`, `ts-node`, Babel, jsdom, or a third-party TUI framework to `@bruff/cli`.
- Golden-file ANSI snapshots as the primary test signal. Structural assertions on state, terminal frames, and command output are preferred.

## Open questions (resolved)

- **Q: Should the CLI literally expose `window.__bruffTestApi` or parse `?test=1`?**  
  A: No. `@bruff/cli` is a Node-only package. The equivalent is an explicit exported factory that tests import directly and production CLI code can compose behind injected ports.

- **Q: Should frame stepping live in `@bruff/game/headless` or `@bruff/cli`?**  
  A: The deterministic game step stays in `@bruff/game/headless` through `stepHeadlessGame()`. The terminal-specific queueing, rendering, ANSI encoding, and injected writer behaviour live in `@bruff/cli`.

- **Q: Should `stepFrames()` return only `GameState`, matching the browser API exactly?**  
  A: No. CLI tests also need terminal artifacts. `stepFrames()` should return a structured result containing final state and per-frame terminal output while preserving the same logical stepping semantics.

- **Q: Should tests drive `runBruffCli()` by emitting fake input, or call the frame-step driver directly?**  
  A: Both. Most deterministic tests should call the frame-step driver directly. A smaller set of injected-port tests should prove `runBruffCli()` delegates valid input to the same path and releases input on quit or write failure.

- **Q: Should `loadState()` accept partial state patches for convenience?**  
  A: No. It accepts a complete `GameState`. Tests can create a baseline with `createHeadlessGame()` from `@bruff/game/headless` and use object spread to build a complete explicit state.

- **Q: Should failed writer calls throw?**  
  A: No. Writer failures remain `WriteFrameResult` values, consistent with the existing CLI boundary.

## Edge cases

- `stepFrames(0)` returns the current cloned state, produces no additional ANSI frames, and does not write.
- Negative, fractional, `NaN`, and infinite frame counts are normalized to a safe non-negative integer count before stepping.
- A call with queued invalid input renders the requested frames but does not advance `frameIndex`.
- Multiple queued valid inputs before one frame are applied FIFO in the single logical tick for that frame.
- Multiple queued valid inputs followed by `stepFrames(3)` increment `frameIndex` once, then render two additional no-input frames.
- Input queued after `loadState()` starts from a clean queue; input queued before `loadState()` is discarded.
- `loadState()` clones the supplied state so later test mutation of the original object cannot affect the driver.
- `getState()` clones the current state so direct mutation of the returned value cannot affect the driver.
- A writer returning `false` is surfaced as `{ type: "error", reason: "write-failed" }` and prevents further interactive input from staying active.
- A writer throwing is surfaced as `{ type: "error", reason: "write-threw" }`.
- Rendering with no cells still emits the ANSI clear, cursor cleanup, and style reset sequence.
- Terminal coordinates stay one-indexed in `TerminalCell` output, while `GameState` grid cells remain zero-indexed.
- Quit shortcuts release raw mode and pause input without stepping or rendering a new game frame.
- Tests run under native `node:test` without a real TTY, browser globals, timers, sleeps, or nondeterministic waits.
