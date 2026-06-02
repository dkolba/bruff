# Frame-by-Frame ANSI Render Test - Tasks

Each task is independently executable. Tests are listed before implementation where practical so the work follows TDD.

## Driver API

- [x] T1 - Add failing native driver creation tests in `packages/cli/module/ansi-frame-step-driver.test.ts` for default seed/canvas creation, explicit initial state loading, cloned `getState()`, and cloned `loadState()`.
- [x] T2 - Implement `createAnsiFrameStepDriver()` state initialization, `getState()`, and `loadState()` in `packages/cli/module/ansi-frame-step-driver.ts`.
- [x] T3 - Export `createAnsiFrameStepDriver` and related public types from `packages/cli/index.ts`.

## Input Queue And Frame Stepping

- [x] T4 - Add failing native tests in `packages/cli/module/ansi-frame-step-driver.test.ts` for ignored input, arrow input, WASD input, FIFO queued input, and queue clearing after `loadState()`.
- [x] T5 - Implement `dispatchInput()` and input queue handling in `packages/cli/module/ansi-frame-step-driver.ts` using `normaliseKey()` from `@bruff/game/headless`.
- [x] T6 - Add failing native tests in `packages/cli/module/ansi-frame-step-driver.test.ts` for `stepFrames(0)`, render-only frames, movement frames, multi-frame calls, and frame count normalization.
- [x] T7 - Implement `stepFrames()` in `packages/cli/module/ansi-frame-step-driver.ts` using `stepHeadlessGame()` from `@bruff/game/headless`.

## ANSI Rendering Results

- [x] T8 - Add failing native tests in `packages/cli/module/ansi-frame-step-driver.test.ts` proving each stepped frame returns `HeadlessFrame`, `TerminalFrame`, encoded ANSI text, render stats, and the final cloned state.
- [x] T9 - Implement frame projection and result collection in `packages/cli/module/ansi-frame-step-driver.ts` using `projectHeadlessFrame()`, `gameFrameToTerminalFrame()`, `renderTerminalFrame()`, and `encodeAnsiCommands()`.
- [x] T10 - Add failing native tests in `packages/cli/module/ansi-frame-step-driver.test.ts` proving `renderFrame()` renders without advancing `frameIndex`.
- [x] T11 - Implement `renderFrame()` and latest render stats in `packages/cli/module/ansi-frame-step-driver.ts`.

## Writer Boundary

- [x] T12 - Add failing native tests in `packages/cli/module/ansi-frame-step-driver.test.ts` for successful writer output, `false` writer results, and thrown writer errors.
- [x] T13 - Implement writer integration in `packages/cli/module/ansi-frame-step-driver.ts` so every frame records a typed `WriteFrameResult`.
- [x] T14 - Refactor `packages/cli/module/write-frame.ts` only if needed so ANSI text encoding can be reused without duplicate command encoding.

## Interactive CLI Wiring

- [x] T15 - Add failing native tests in `packages/cli/bin/bruff-cli.test.ts` proving `runBruffCli()` writes the initial frame through the driver path and redraws one frame after valid movement input.
- [x] T16 - Refactor `runBruffCli()` in `packages/cli/bin/bruff-cli.ts` to create and use `createAnsiFrameStepDriver()`.
- [x] T17 - Add or update native tests in `packages/cli/bin/bruff-cli.test.ts` proving quit shortcuts do not step or render, invalid input does not advance `frameIndex`, and movement writer failure releases input.
- [x] T18 - Preserve raw-mode setup and teardown in `packages/cli/bin/bruff-cli.ts` while delegating movement redraws to the driver.

## Documentation And Gates

- [x] T19 - Document the frame-step terminal testing workflow in `packages/cli/README.md`.
- [x] T20 - Run `pnpm --filter @bruff/cli run format` and update changed formatting.
- [x] T21 - Run `pnpm --filter @bruff/cli run lint`.
- [x] T22 - Run `pnpm --filter @bruff/cli run typecheck`.
- [x] T23 - Run `pnpm --filter @bruff/cli run test`.
- [x] T24 - Update `specs/frame-by-frame-ansi-render-test/spec.md` with a `Verification` section after implementation completes.
