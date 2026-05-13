# Tasks — Canvas Game Testing Strategy (Revisited)

Each task is independently executable: it must compile, lint, and pass tests on its own. Implementation tasks and tests are intentionally split.

## Layer 1 — Test-mode flag

- [ ] T1 — Add `__BRUFF_TEST_MODE__` declaration to `packages/game/types/global.d.ts` (create if missing).
- [ ] T2 — Add `define: { __BRUFF_TEST_MODE__: ... }` replacement to `packages/arcade/vite.config.ts`.
- [ ] T3 — Implement `isTestMode()` in `packages/game/lib/effects/test-mode.ts`.
- [ ] T4 — Add unit tests for `isTestMode` in `packages/game/lib/effects/test-mode.test.ts`.

## Layer 2 — Time and stepping control

- [ ] T5 — Add a `Clock` ADT and `readClock` in `packages/game/lib/effects/clock.ts`.
- [ ] T6 — Add unit tests for `Clock` in `packages/game/lib/effects/clock.test.ts`.
- [ ] T7 — Refactor `packages/game/lib/effects/loop.ts` to read time through the clock abstraction.
- [ ] T8 — Ensure background animation receives clock-derived time, not raw RAF callback time.

## Layer 3 — State shape for replay stability

- [ ] T9 — Confirm `GameState` includes stable replay fields (`stateVersion`, deterministic seed/PRNG state, monotonic frame index).
- [ ] T10 — Add missing fields (if absent) in `packages/game/lib/core/types.ts` and `packages/game/lib/state/create-initial-state.ts`.
- [ ] T11 — Add/update tests in `packages/game/lib/state/create-initial-state.test.ts` for all replay-critical fields.
- [ ] T12 — Ensure frame index increments exactly once per logical tick in `packages/game/lib/effects/loop.ts`.
- [ ] T13 — Add loop tests proving monotonic `frameIndex` growth over multiple ticks.

## Layer 4 — Render stats and snapshot freeze points

- [ ] T14 — Add `RenderStats` type (`packages/game/lib/render/render-stats.ts` or equivalent path in current layout).
- [ ] T15 — Update render pipeline to return latest `RenderStats`.
- [ ] T16 — Add render tests asserting `RenderStats` consistency with state.
- [ ] T17 — Store latest render stats in loop shell state for test API reads.

## Layer 5 — Frame-step driver

- [ ] T18 — Implement `createFrameStepDriver` in `packages/game/lib/effects/frame-step-driver.ts`.
- [ ] T19 — Wire loop startup to choose RAF mode vs deterministic frame-step mode via `isTestMode()`.
- [ ] T20 — Add tests for `stepFrames(0)`, `stepFrames(n)`, and input ordering behavior.

## Layer 6 — Browser test API

- [ ] T21 — Define `BruffTestApi` type in `packages/game/lib/effects/test-api-types.ts`.
- [ ] T22 — Implement `attachTestApi(driver)` in `packages/game/lib/effects/test-api.ts` and assign `window.__bruffTestApi` in test mode.
- [ ] T23 — Implement `freezeForSnapshot()` semantics: pause simulation and resolve after next paint.
- [ ] T24 — Wire API attachment from `packages/game/lib/effects/loop.ts` only when test mode is enabled.
- [ ] T25 — Expose per-instance test API through `packages/game-element/module/game-element.ts`.
- [ ] T26 — Add unit tests for API attachment, teardown, and production-mode non-exposure.

## Layer 7 — Replay fixtures and snapshots

- [ ] T27 — Define `ReplayFixture` and `ReplayError` in `packages/game/lib/state/replay-fixture.ts`.
- [ ] T28 — Implement `parseReplayFixture(raw)` returning `Result<ReplayFixture, ReplayError>`.
- [ ] T29 — Add fixture parser tests (valid, missing field, invalid version, out-of-range frame).
- [ ] T30 — Implement pure `runReplay(fixture)` in `packages/game/lib/state/run-replay.ts`.
- [ ] T31 — Add determinism tests: same fixture, same final state across repeated runs.
- [ ] T32 — Add JSON fixture(s) under `packages/game/tests/fixtures/`.
- [ ] T33 — Add snapshot golden(s) under `packages/game/tests/snapshots/`.
- [ ] T34 — Add file-snapshot tests validating replay output against committed goldens.

## Layer 8 — Property-based coverage

- [ ] T35 — Add property test: replay determinism across arbitrary seeds and bounded input sequences.
- [ ] T36 — Add property test: `frameIndex` never decreases across deterministic stepping.

## Layer 9 — Playwright suite reorganization

- [ ] T37 — Add `gotoTestMode(page)` helper in `packages/arcade/e2e/base-fixtures.ts`.
- [ ] T38 — Remove `slowMo: 500` from `packages/arcade/playwright.config.ts`.
- [ ] T39 — Create `packages/arcade/e2e/state-assertions.spec.ts` with API-driven assertions.
- [ ] T40 — Create `packages/arcade/e2e/accessibility.spec.ts` for axe checks (dark + light).
- [ ] T41 — Add static HUD element in `packages/arcade/index.html` for DOM-only visual snapshot.
- [ ] T42 — Add `packages/arcade/e2e/hud-visual.spec.ts` with HUD screenshot assertions.
- [ ] T43 — Add `packages/arcade/e2e/replay-checkpoint.spec.ts` with fixture load + `freezeForSnapshot()` + single canvas screenshot.
- [ ] T44 — Remove/retire assertions in legacy `packages/arcade/e2e/bruff-game.spec.ts` once replacements are in place.
- [ ] T45 — Update `packages/arcade/README.md` with new E2E file layout and `?test=1` workflow.

## Layer 10 — Production-bundle safety

- [ ] T46 — Add a bundle-clean check ensuring production assets do not contain `__bruffTestApi`.
- [ ] T47 — Wire bundle-clean check into the arcade package quality gate.

## Layer 11 — Documentation

- [ ] T48 — Update `packages/game/README.md` with testing pyramid (unit, property, replay, E2E).
- [ ] T49 — Document replay fixture shape and snapshot locations in `packages/game/README.md`.
- [ ] T50 — Keep `spec.md` and `design.md` synchronized with implementation scope as tasks close.

## Verification gate (must pass before merge)

- [ ] V1 — `pnpm run format`
- [ ] V2 — `pnpm run lint`
- [ ] V3 — `pnpm run typecheck`
- [ ] V4 — `pnpm run test`
- [ ] V5 — `pnpm run build`
