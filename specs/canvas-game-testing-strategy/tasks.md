# Tasks — Canvas Game Testing Strategy

Each task is independently executable: it must compile, lint, and pass tests on its own. Implementation tasks and their tests are split (per S-16). Tasks reference exact files.

## Layer 1 — Test-mode flag

- [ ] T1 — Add `__BRUFF_TEST_MODE__` declaration to `packages/game/types/global.d.ts` (create file)
- [ ] T2 — Add `define: { __BRUFF_TEST_MODE__: ... }` replacement to `packages/arcade/vite.config.ts` (default `false`, `true` when `process.env.VITE_TEST_MODE === "1"`)
- [ ] T3 — Implement `isTestMode()` in `packages/game/lib/effects/test-mode.ts`
- [ ] T4 — Add unit tests for `isTestMode` in `packages/game/lib/effects/test-mode.test.ts` (mock `window.location.search` via `vi.stubGlobal`)

## Layer 2 — Time-as-input refactor

- [ ] T5 — Add `Clock` type, `wallClock`, `manualClock`, `advanceManualClock` constructors to `packages/game/lib/effects/clock.ts`
- [ ] T6 — Implement `readClock` (the only `performance.now()` reader) in `packages/game/lib/effects/clock.ts`
- [ ] T7 — Add unit tests for `Clock` constructors and `advanceManualClock` in `packages/game/lib/effects/clock.test.ts`
- [ ] T8 — Refactor `packages/game/lib/loop.ts` so the inner `renderFrame` receives `time` from `readClock(clock)` instead of the raw RAF argument
- [ ] T9 — Update `packages/game/lib/loop.ts` call to `radiatingBarsBackgroundAnimation` to take its `time` argument from the injected `Clock`

## Layer 3 — GameState shape extension

- [ ] T10 — Extend `GameState` in `packages/game/types/game-state-type.ts` with `stateVersion: number`, `seed: number`, `frameIndex: number` (all `Readonly`, including the existing fields)
- [ ] T11 — Update `packages/game/lib/create-initial-state.ts` to populate `stateVersion: 1`, `seed: 0`, `frameIndex: 0`
- [ ] T12 — Update `packages/game/lib/create-initial-state.test.ts` to assert the three new fields
- [ ] T13 — Increment `frameIndex` in `createGameLoop` inside `packages/game/lib/loop.ts` once per yielded state
- [ ] T14 — Add unit test in `packages/game/lib/loop.test.ts` (create file) covering `frameIndex` monotonic increase across three iterations

## Layer 4 — Render stats

- [ ] T15 — Add `RenderStats` type to `packages/game/lib/render/render-stats.ts`
- [ ] T16 — Change `render` in `packages/game/lib/render.ts` to return `RenderStats`
- [ ] T17 — Update `packages/game/lib/render.test.ts` to assert returned `RenderStats` matches state (player drawn, enemy count)
- [ ] T18 — Update the `render(currentGameState, context)` call in `packages/game/lib/loop.ts` to capture the latest `RenderStats` in a module-scoped `let` (the only allowed mutable shell binding)

## Layer 5 — Frame-step driver

- [ ] T19 — Implement `createFrameStepDriver` factory in `packages/game/lib/effects/frame-step-driver.ts`. It accepts the generator and returns `{ stepFrames, getCurrentState, dispatchInput }` closures over a `ManualClock`
- [ ] T20 — Wire `loop.ts` to choose between `createFrameStepDriver` and the existing RAF tail based on `isTestMode()`
- [ ] T21 — Add unit tests for `createFrameStepDriver` in `packages/game/lib/effects/frame-step-driver.test.ts` covering: `stepFrames(0)` is a no-op; `stepFrames(3)` advances `frameIndex` by exactly 3; `dispatchInput("arrowup")` followed by `stepFrames(1)` moves the player

## Layer 6 — Test API

- [ ] T22 — Define `BruffTestApi` type in `packages/game/lib/effects/test-api-types.ts`
- [ ] T23 — Implement `attachTestApi(driver)` that builds the `BruffTestApi` object and assigns `window.__bruffTestApi` in `packages/game/lib/effects/test-api.ts`
- [ ] T24 — Implement `freezeForSnapshot()` to set a paused flag and resolve after a single `requestAnimationFrame` paint
- [ ] T25 — Wire `attachTestApi` from `loop.ts` so it runs only when `isTestMode()` is true
- [ ] T26 — Add `testApi` getter to `packages/game-element/module/game-element.ts` returning the per-instance driver
- [ ] T27 — Add unit tests for `attachTestApi` in `packages/game/lib/effects/test-api.test.ts` using `happy-dom` to provide a `window` (or stub `globalThis.window`)

## Layer 7 — Replay harness

- [ ] T28 — Add `Result<T, E>` and `ok`/`err` helpers to `packages/utils` if not already present (check first; reuse if it is)
- [ ] T29 — Define `ReplayFixture` and `ReplayError` types in `packages/game/lib/state/replay-fixture.ts`
- [ ] T30 — Implement `parseReplayFixture(raw)` returning `Result<ReplayFixture, ReplayError>` in the same file
- [ ] T31 — Add unit tests for `parseReplayFixture` in `packages/game/lib/state/replay-fixture.test.ts` covering valid fixture, missing field, version mismatch
- [ ] T32 — Implement `runReplay(fixture)` (pure) in `packages/game/lib/state/run-replay.ts`
- [ ] T33 — Add unit tests for `runReplay` in `packages/game/lib/state/run-replay.test.ts` asserting determinism (same fixture → equal final state across two calls)
- [ ] T34 — Create `packages/game/tests/snapshots/move-up-60-frames.json` by running `runReplay` once and committing the output as the golden snapshot
- [ ] T35 — Add a snapshot test in `packages/game/lib/state/run-replay.snapshot.test.ts` that runs the fixture and asserts the result matches `tests/snapshots/move-up-60-frames.json` via `toMatchFileSnapshot`

## Layer 8 — Property-based tests

- [ ] T36 — Add `fast-check` as a dev dependency in `packages/game/package.json`
- [ ] T37 — Add property test `runReplay is deterministic for any seed and input sequence` in `packages/game/lib/state/run-replay.property.test.ts`
- [ ] T38 — Add property test `frameIndex never decreases across stepFrames(n) for any positive n` in `packages/game/lib/effects/frame-step-driver.property.test.ts`

## Layer 9 — Playwright reorganization

- [ ] T39 — Add a `gotoTestMode(page)` helper to `packages/arcade/e2e/base-fixtures.ts` that navigates to `/?test=1` and waits for `window.__bruffTestApi`
- [ ] T40 — Remove `slowMo: 500` from `packages/arcade/playwright.config.ts`
- [ ] T41 — Create `packages/arcade/e2e/state-assertions.spec.ts` covering: element mounts, `getState()` returns the initial state, `dispatchInput("arrowup") + stepFrames(1)` moves the player by exactly `PLAYER_SPEED`
- [ ] T42 — Create `packages/arcade/e2e/accessibility.spec.ts` containing only the axe checks (dark + light), removing them from the legacy spec
- [ ] T43 — Add a static HUD `<div id="hud">` containing the version label to `packages/arcade/index.html` (replaces the empty `<h1>`)
- [ ] T44 — Create `packages/arcade/e2e/hud-visual.spec.ts` with a single `await expect(page.locator("#hud")).toHaveScreenshot()` per scheme
- [ ] T45 — Copy `packages/game/tests/snapshots/move-up-60-frames.json` to `packages/arcade/e2e/fixtures/move-up-60-frames.json` and create `packages/arcade/e2e/replay-checkpoint.spec.ts` that loads the fixture, calls `stepFrames(fixture.totalFrames)`, calls `freezeForSnapshot()`, then asserts `await expect(page.locator("bruff-game canvas")).toHaveScreenshot()` (one stable canvas screenshot)
- [ ] T46 — Delete `packages/arcade/e2e/bruff-game.spec.ts` once T41/T42/T44/T45 cover its assertions
- [ ] T47 — Update `packages/arcade/README.md` to document the new spec file layout and the `?test=1` flag

## Layer 10 — Production-bundle safety

- [ ] T48 — Add a build-output check task to `packages/arcade/package.json` (`test:bundle-clean`) that runs after `vite build` and `grep -L "__bruffTestApi" site/assets/*.js` to assert the test API is absent
- [ ] T49 — Wire `test:bundle-clean` into `pnpm run ok` for the arcade package

## Layer 11 — Documentation

- [ ] T50 — Add a `Testing strategy` section to `packages/game/README.md` summarising the three test levels and linking to `specs/canvas-game-testing-strategy/spec.md`
- [ ] T51 — Add a short `Replay fixtures` heading to `packages/game/README.md` describing the JSON shape and where snapshots live
