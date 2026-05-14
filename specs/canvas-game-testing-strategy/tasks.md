# Tasks — Canvas Game Testing Strategy (Revisited)

Each task is independently executable: it must compile, lint, and pass tests on its own. Implementation tasks and tests are intentionally split.

## Layer 1 — Test-mode flag

- [x] T1 — Add `__BRUFF_TEST_MODE__` declaration to `packages/game/types/global.d.ts` (create if missing).
- [x] T2 — Add `define: { __BRUFF_TEST_MODE__: ... }` replacement to `packages/arcade/vite.config.ts`.
- [x] T3 — Implement `isTestMode()` in `packages/game/lib/effects/test-mode.ts`.
- [x] T4 — Add unit tests for `isTestMode` in `packages/game/lib/effects/test-mode.test.ts`.

## Layer 2 — Time and stepping control

- [x] T5 — Add a `Clock` ADT and `readClock` in `packages/game/lib/effects/clock.ts`.
- [x] T6 — Add unit tests for `Clock` in `packages/game/lib/effects/clock.test.ts`.
- [x] T7 — Refactor `packages/game/lib/effects/loop.ts` to read time through the clock abstraction.
- [x] T8 — Ensure background animation receives clock-derived time, not raw RAF callback time.

## Layer 3 — State shape for replay stability

- [x] T9 — Confirm `GameState` includes stable replay fields (`stateVersion`, deterministic seed/PRNG state, monotonic frame index).
- [x] T10 — Add missing fields (if absent) in `packages/game/lib/core/types.ts` and `packages/game/lib/state/create-initial-state.ts`.
- [x] T11 — Add/update tests in `packages/game/lib/state/create-initial-state.test.ts` for all replay-critical fields.
- [x] T12 — Ensure frame index increments exactly once per logical tick in `packages/game/lib/effects/loop.ts`.
- [x] T13 — Add loop tests proving monotonic `frameIndex` growth over multiple ticks.

## Layer 4 — Render stats and snapshot freeze points

- [x] T14 — Add `RenderStats` type (`packages/game/lib/render/render-stats.ts` or equivalent path in current layout).
- [x] T15 — Update render pipeline to return latest `RenderStats`.
- [x] T16 — Add render tests asserting `RenderStats` consistency with state.
- [x] T17 — Store latest render stats in loop shell state for test API reads.

## Layer 5 — Frame-step driver

- [x] T18 — Implement `createFrameStepDriver` in `packages/game/lib/effects/frame-step-driver.ts`.
- [x] T19 — Wire loop startup to choose RAF mode vs deterministic frame-step mode via `isTestMode()`.
- [x] T20 — Add tests for `stepFrames(0)`, `stepFrames(n)`, and input ordering behavior.

## Layer 6 — Browser test API

- [x] T21 — Define `BruffTestApi` type in `packages/game/lib/effects/test-api-types.ts`.
- [x] T22 — Implement `attachTestApi(driver)` in `packages/game/lib/effects/test-api.ts` and assign `window.__bruffTestApi` in test mode.
- [x] T23 — Implement `freezeForSnapshot()` semantics: pause simulation and resolve after next paint.
- [x] T24 — Wire API attachment from `packages/game/lib/effects/loop.ts` only when test mode is enabled.
- [x] T25 — Expose per-instance test API through `packages/game-element/module/game-element.ts`.
- [x] T26 — Add unit tests for API attachment, teardown, and production-mode non-exposure.

## Layer 7 — Replay fixtures and snapshots

- [x] T27 — Define `ReplayFixture` and `ReplayError` in `packages/game/lib/state/replay-fixture.ts`.
- [x] T28 — Implement `parseReplayFixture(raw)` returning `Result<ReplayFixture, ReplayError>`.
- [x] T29 — Add fixture parser tests (valid, missing field, invalid version, out-of-range frame).
- [x] T30 — Implement pure `runReplay(fixture)` in `packages/game/lib/state/run-replay.ts`.
- [x] T31 — Add determinism tests: same fixture, same final state across repeated runs.
- [x] T32 — Add JSON fixture(s) under `packages/game/tests/fixtures/`.
- [x] T33 — Add snapshot golden(s) under `packages/game/tests/snapshots/`.
- [x] T34 — Add file-snapshot tests validating replay output against committed goldens.

## Layer 8 — Property-based coverage

- [x] T35 — Add property test: replay determinism across arbitrary seeds and bounded input sequences.
- [x] T36 — Add property test: `frameIndex` never decreases across deterministic stepping.

## Layer 9 — Playwright suite reorganization

- [x] T37 — Add `gotoTestMode(page)` helper in `packages/arcade/e2e/base-fixtures.ts`.
- [x] T38 — Remove `slowMo: 500` from `packages/arcade/playwright.config.ts`.
- [x] T39 — Create `packages/arcade/e2e/state-assertions.spec.ts` with API-driven assertions.
- [x] T40 — Create `packages/arcade/e2e/accessibility.spec.ts` for axe checks (dark + light).
- [x] T41 — Add static HUD element in `packages/arcade/index.html` for DOM-only visual snapshot.
- [x] T42 — Add `packages/arcade/e2e/hud-visual.spec.ts` with HUD screenshot assertions.
- [x] T43 — Add `packages/arcade/e2e/replay-checkpoint.spec.ts` with fixture load + `freezeForSnapshot()` + single canvas screenshot.
- [x] T44 — Remove/retire assertions in legacy `packages/arcade/e2e/bruff-game.spec.ts` once replacements are in place.
- [x] T45 — Update `packages/arcade/README.md` with new E2E file layout and `?test=1` workflow.

## Layer 10 — Production-bundle safety

- [x] T46 — Add a bundle-clean check ensuring production assets do not contain `__bruffTestApi`.
- [x] T47 — Wire bundle-clean check into the arcade package quality gate.

## Layer 11 — Documentation

- [x] T48 — Update `packages/game/README.md` with testing pyramid (unit, property, replay, E2E).
- [x] T49 — Document replay fixture shape and snapshot locations in `packages/game/README.md`.
- [x] T50 — Keep `spec.md` and `design.md` synchronized with implementation scope as tasks close.

## Verification gate (must pass before merge)

- [x] V1 — `pnpm run format`
- [x] V2 — `pnpm run lint`
- [x] V3 — `pnpm run typecheck`
- [x] V4 — `pnpm run test`
- [x] V5 — `pnpm run build`
