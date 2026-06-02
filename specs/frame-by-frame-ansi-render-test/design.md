# Frame-by-Frame ANSI Render Test - Design

## Architectural Overview

The browser E2E path uses `gotoTestMode(page)`, then drives `window.__bruffTestApi` through `dispatchInput()`, `loadState()`, and `stepFrames()`. The CLI equivalent should keep the same simulation semantics while replacing the browser global with an explicit Node test factory.

```text
node:test
  |
  v
createAnsiFrameStepDriver()
  |
  | dispatchInput(raw terminal text)
  | loadState(GameState)
  | stepFrames(1)
  v
@bruff/game/headless stepHeadlessGame()
  |
  v
projectHeadlessFrame()
  |
  v
gameFrameToTerminalFrame()
  |
  v
renderTerminalFrame() -> encodeAnsiCommands() -> injected TextWriter
```

The design keeps the functional core intact. `@bruff/game/headless` owns game creation, input normalization, state stepping, and headless frame projection. `@bruff/cli` owns input queueing for terminal tests, conversion to terminal cells, ANSI encoding, and writer results.

## Layer Assignment

| Module or file                                       | Package      | Layer                  | Purpose                                                                                                                       |
| ---------------------------------------------------- | ------------ | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `packages/cli/module/ansi-frame-step-driver.ts`      | `@bruff/cli` | Terminal shell adapter | Creates the deterministic terminal frame-step driver used by tests and CLI input handling.                                    |
| `packages/cli/module/ansi-frame-step-driver.test.ts` | `@bruff/cli` | Native Node tests      | Verifies state loading, input queueing, frame stepping, render-only frames, ANSI output, and writer failures.                 |
| `packages/cli/module/ansi-frame-step-result.ts`      | `@bruff/cli` | Pure terminal model    | Defines result types for per-frame terminal output and render stats if the type set is large enough to merit a separate file. |
| `packages/cli/bin/bruff-cli.ts`                      | `@bruff/cli` | Executable Node shell  | Uses the frame-step driver for initial render and movement redraws while preserving injected ports.                           |
| `packages/cli/bin/bruff-cli.test.ts`                 | `@bruff/cli` | Native Node tests      | Narrows interactive tests to port lifecycle and proves valid input delegates to the shared frame-step path.                   |
| `packages/cli/index.ts`                              | `@bruff/cli` | Public package API     | Exports the driver factory and public result types for package-level tests and future consumers.                              |
| `packages/cli/README.md`                             | `@bruff/cli` | Package documentation  | Documents the frame-step test workflow and native Node constraints.                                                           |

No new module is added to `packages/game`, `packages/game-element`, or `packages/arcade`. If a missing `@bruff/game/headless` capability is discovered during implementation, that is a design change and must be handled through a separate SDTE update before continuing.

## Public API Surface

```ts
// packages/cli/module/ansi-frame-step-driver.ts
import type {
  CanvasSize,
  GameState,
  HeadlessFrame,
} from "@bruff/game/headless";
import type { TerminalFrame } from "./terminal-cell.ts";
import type { TextWriter, WriteFrameResult } from "./write-frame.ts";

export type AnsiFrameStepOptions = Readonly<{
  canvas?: CanvasSize;
  initialState?: GameState;
  seed?: number;
  writer: TextWriter;
}>;

export type AnsiFrameRenderStats = Readonly<{
  enemiesDrawn: number;
  frameIndex: number;
  playerDrawn: boolean;
  terminalCellsDrawn: number;
}>;

export type AnsiRenderedFrame = Readonly<{
  ansiText: string;
  headlessFrame: HeadlessFrame;
  renderStats: AnsiFrameRenderStats;
  state: GameState;
  terminalFrame: TerminalFrame;
  writeResult: WriteFrameResult;
}>;

export type AnsiFrameStepResult = Readonly<{
  frames: ReadonlyArray<AnsiRenderedFrame>;
  state: GameState;
  writeResult: WriteFrameResult;
}>;

export type AnsiFrameStepDriver = Readonly<{
  dispatchInput: (input: string) => void;
  getRenderStats: () => AnsiFrameRenderStats;
  getState: () => GameState;
  loadState: (state: GameState) => void;
  renderFrame: () => AnsiRenderedFrame;
  stepFrames: (frameCount: number) => AnsiFrameStepResult;
}>;

export const createAnsiFrameStepDriver: (
  options: AnsiFrameStepOptions,
) => AnsiFrameStepDriver;
```

The exact file split can stay in one module if the implementation remains small. If result types and driver logic push the file past the package's small-file target, move result types into `ansi-frame-step-result.ts`.

## Behavioural Semantics

`createAnsiFrameStepDriver()` initializes state from `options.initialState` when provided. Otherwise it calls `createHeadlessGame()` with `options.canvas ?? { height: 7, width: 7 }` and `options.seed ?? 1`, matching the current CLI defaults.

`dispatchInput(input)` passes raw terminal text through `normaliseKey()` from `@bruff/game/headless`. A `some` result appends the normalized movement action to the queue. A `none` result is ignored.

`stepFrames(frameCount)` normalizes the count with the same rules as the browser frame-step driver: truncate fractional values and clamp invalid or negative counts to zero. Each requested frame:

1. advances state once with `stepHeadlessGame(state, inputQueue)`;
2. clears the input queue;
3. projects the state with `projectHeadlessFrame(state)`;
4. converts it with `gameFrameToTerminalFrame(frame)`;
5. renders commands with `renderTerminalFrame(terminalFrame)`;
6. encodes commands with `encodeAnsiCommands(commands)`;
7. writes encoded ANSI through the injected `TextWriter`;
8. records the per-frame state, headless frame, terminal frame, ANSI text, stats, and write result.

If no input is queued, `stepHeadlessGame()` returns the same logical state and `frameIndex` does not increment, but the terminal frame is still rendered. This intentionally mirrors the existing browser behaviour in `packages/arcade/e2e/state-assertions.spec.ts`.

`renderFrame()` renders the current state without advancing the logical simulation. It is useful for the initial CLI draw and for render-only assertions.

`loadState(state)` clones the supplied state and clears the input queue. `getState()` returns a clone. Use `structuredClone()` directly in this Node-only package.

`getRenderStats()` returns stats from the latest rendered frame. Before any render, it returns zero-like stats for the current state:

```ts
{
  enemiesDrawn: 0,
  frameIndex: state.frameIndex,
  playerDrawn: false,
  terminalCellsDrawn: 0,
}
```

## Integration With `runBruffCli()`

`runBruffCli()` should create one `AnsiFrameStepDriver` with the injected writer. It should call `renderFrame()` for the initial draw, then register input. The input listener should keep existing quit behaviour. For valid movement input, it should queue the text and call `stepFrames(1)`.

The current writer error rules remain:

- initial render error returns immediately without registering input;
- movement render error releases input and disables raw mode;
- writer errors return typed `WriteFrameResult` values rather than throwing.

This refactor removes duplicate game stepping from `bin/bruff-cli.ts` and makes interactive behaviour use the same deterministic path as direct driver tests.

## Data Shape Changes

No `GameState` changes are required. No new action variants, branded IDs, replay fixture fields, browser globals, or canvas render commands are introduced.

New CLI-local types are product types and discriminated unions around terminal output and writer results. They are readonly public API types with TSDoc annotations when implemented in TypeScript.

## Reuse Map

| Existing file                                           | Reuse                                                                                                                                   |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/arcade/e2e/base-fixtures.ts`                  | Shows the browser test-mode entry point and wait-for-test-API pattern to mirror conceptually.                                           |
| `packages/arcade/e2e/state-assertions.spec.ts`          | Source for `dispatchInput()`, `loadState()`, `stepFrames()`, render-only, FIFO, and blocked-movement scenarios.                         |
| `packages/arcade/e2e/replay-checkpoint.spec.ts`         | Source for loading deterministic state and stepping one frame at a time through fixture frames.                                         |
| `packages/game/lib/effects/frame-step-driver.ts`        | Semantic reference for queue consumption and render-only frame behaviour. CLI cannot import it.                                         |
| `packages/game/lib/effects/test-api/attach-test-api.ts` | Semantic reference for cloning state and exposing a test control surface. CLI cannot import it.                                         |
| `packages/game/lib/headless/index.ts`                   | Allowed public game facade for CLI: `createHeadlessGame`, `normaliseKey`, `projectHeadlessFrame`, `stepHeadlessGame`, and public types. |
| `packages/cli/module/game-frame.ts`                     | Converts `HeadlessFrame` to `TerminalFrame`.                                                                                            |
| `packages/cli/module/render-frame.ts`                   | Converts `TerminalFrame` to `AnsiCommand` values.                                                                                       |
| `packages/cli/module/ansi.ts`                           | Encodes ANSI commands into strings.                                                                                                     |
| `packages/cli/module/write-frame.ts`                    | Provides `TextWriter` and typed writer failure results.                                                                                 |
| `packages/cli/bin/bruff-cli.ts`                         | Existing injected input/output shell to refactor onto the driver.                                                                       |
| `packages/cli/bin/bruff-cli.test.ts`                    | Existing fake input and writer patterns.                                                                                                |

## Tradeoffs

### CLI control surface: exported factory vs. process flag

- **Chosen: exported factory.** Native tests can import it directly, pass fake writers, and avoid spawning a process or parsing CLI flags.
- **Alternative: `--test-mode` CLI flag.** Rejected because it would still need process orchestration, stdout capture, and input timing. It also exposes a user-facing flag for a test-only concern.
- **Alternative: environment variable.** Rejected because it creates hidden mutable process state and is harder to isolate across concurrent native tests.

### Return shape: state only vs. structured terminal frames

- **Chosen: structured terminal result.** CLI tests need to assert game state and ANSI output together. Returning `HeadlessFrame`, `TerminalFrame`, `ansiText`, and `WriteFrameResult` keeps assertions black-box but precise.
- **Alternative: return only `GameState`, like the browser API.** Rejected because tests would have to scrape injected writer history or re-run projections manually.
- **Alternative: return only ANSI text.** Rejected because it makes every test parse escape codes and weakens state-first assertions.

### Writer handling: render pure text vs. always write

- **Chosen: render and write through the injected writer.** The driver records text and writer result, so tests cover the actual shell boundary while staying deterministic.
- **Alternative: pure render only.** Rejected because existing CLI bugs can live at the writer boundary.
- **Alternative: only assert writer output from `runBruffCli()`.** Rejected because it couples deterministic state tests to input listener lifecycle.

### State cloning: structuredClone vs. direct references

- **Chosen: clone on `getState()` and `loadState()`.** This mirrors the browser test API and prevents tests from mutating live state accidentally.
- **Alternative: return references for speed.** Rejected because the state is small and reference leakage would create order-dependent tests.

### File split: one driver module vs. many modules

- **Chosen: start with one driver module plus tests.** The behaviour is cohesive: queue input, step game, render terminal frame, write output.
- **Alternative: split queue, renderer, stats, and writer orchestration immediately.** Rejected as premature unless line count or readability exceeds package guidance.

## Compliance With Package Rules

- `@bruff/cli` imports only Node built-ins, `@bruff/glyph`, and `@bruff/game/headless` from runtime and test source.
- Tests use `node:test` and `node:assert/strict` only.
- Tests use public exports and injected ports; they do not open a real TTY or pseudo-terminal.
- Writer failures are represented as `WriteFrameResult` values.
- ANSI terminal control remains encoded in `module/ansi.ts`.
- `process.stdin`, `process.stdout`, raw mode, and input listeners remain in `bin/bruff-cli.ts`.
- Domain game logic remains in `@bruff/game/headless`; CLI code only composes the public facade.

## Example Native Test Shape

```ts
import * as assert from "node:assert/strict";
import { test } from "node:test";

import { createHeadlessGame } from "@bruff/game/headless";
import { createAnsiFrameStepDriver } from "./ansi-frame-step-driver.ts";
import type { TextWriter } from "./write-frame.ts";

test("steps a loaded terminal game state one ANSI frame", (): void => {
  const writtenTexts: Array<string> = [];
  const writer: TextWriter = {
    write: (text: string): boolean => {
      writtenTexts.push(text);
      return true;
    },
  };
  const state = createHeadlessGame({
    canvas: { height: 7, width: 7 },
    seed: 1,
  });
  const driver = createAnsiFrameStepDriver({ initialState: state, writer });

  driver.dispatchInput("\u001B[C");
  const step = driver.stepFrames(1);

  assert.equal(step.state.frameIndex, 1);
  assert.equal(step.frames.length, 1);
  assert.deepEqual(writtenTexts, [step.frames[0]?.ansiText]);
});
```
