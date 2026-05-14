# Canvas Game Testing Strategy

## Goal

## Revisit notes (May 13, 2026)

After re-auditing the repository, this strategy still stands, but a few assumptions needed adjustment:

- Some architectural groundwork is present (layered folders and deterministic state primitives), but the browser-test harness is still missing.
- Existing replay coverage is limited to a narrow canonical sequence and does not yet provide fixture-driven snapshots across multiple scenarios.
- The current Playwright suite still relies on keypress smoke assertions and should migrate toward explicit state assertions.

This revision keeps the original intent, restores missing execution detail in tasks, and treats most capabilities as **to be implemented unless explicitly proven complete**.

Establish a layered, deterministic testing strategy for the bruff roguelike so the always-in-motion HTML5 canvas stops being a source of test flake. Pixel diffs across browsers, viewports, GPUs, and animation phases are unworkable as a primary signal; we replace them with state-based assertions over a controlled simulation, keep visual checks for the small number of regions that are genuinely static, and codify how the three test levels (unit, property-based, replay) relate to the existing Playwright E2E suite.

## User-visible behaviour

- A test-mode flag (`?test=1` query parameter on the arcade page, or `data-test-mode="true"` attribute on `<bruff-game>`) gates everything below. The flag is opt-in; production users never see the test surface.
- When test mode is active, `window.__bruffTestApi` is exposed with a stable, typed surface:
  - `getState(): GameState` — structured clone of the current state.
  - `loadState(state: GameState): void` — replace the running state.
  - `stepFrames(n: number): GameState` — advance the simulation `n` ticks synchronously and return the resulting state.
  - `dispatchInput(input: string): void` — push a normalized input into the queue without going through DOM events.
  - `freezeForSnapshot(): void` — pause the simulation, halt any animated background, and yield until the next paint so a screenshot of stable pixels is possible.
  - `getRenderStats(): RenderStats` — counters captured during the last render (player drawn, enemy count drawn, frame index).
- When test mode is active, the render loop does not call `requestAnimationFrame`; it ticks only when `stepFrames` is invoked. Wall-clock time and `performance.now()` are not read inside the simulation.
- A seeded PRNG lives inside `GameState` (per architecture rule A-20). The seed is configurable via the test API and via a `data-seed` attribute on `<bruff-game>`.
- Replay fixtures (`{ seed, frames: [{ frame, input }] }`) drive a deterministic run. The same fixture produces byte-identical final state across machines and browsers.
- Playwright tests assert on state, not pixels, by default. The current `slowMo: 500` + key-mash spec is removed.
- Two narrow visual checks are kept: (a) a static HUD region rendered in DOM (not canvas) and (b) a single canvas screenshot taken after `freezeForSnapshot()` at a known replay checkpoint.
- Accessibility (`@axe-core/playwright`) and the dark/light scheme matrix are preserved.

## Out of scope

- Full-canvas visual regression of gameplay frames.
- Multiplayer / desync detection.
- Audio testing.
- Debug overlays (hitboxes, AI state, navigation meshes) — listed in the user's notes (#9) but deferred until the game has entities worth visualizing.
- Render-call instrumentation by monkey-patching `CanvasRenderingContext2D` — deferred to a follow-up; simpler in-engine `RenderStats` covers current needs.
- TAS-style record-and-replay tooling for human capture sessions; we ship the replay format and harness, not a recorder UI.
- Performance budgets and load tests.
- Migrating existing flat `lib/` files into the layered `core/state/input/render/effects` directory layout (this is its own SDTE feature; the testing work assumes the layered layout will exist eventually but does not require it as a precondition).

## Open questions (resolved)

- **Q: Should the test API live on `window` or on the custom element instance?** Resolved: both. The element exposes a `testApi` getter when test mode is on, and a thin `window.__bruffTestApi` shim points at the first `<bruff-game>` on the page so Playwright code stays terse. The element-level surface is the source of truth.
- **Q: Where do replay snapshots live, given they must be reproducible across CI runners?** Resolved: serialized `GameState` JSON in `packages/game/tests/snapshots/<replay-name>.json`. Snapshot equality is structural, not byte-identical text — Vitest's `toMatchFileSnapshot` handles whitespace/key-order normalization.
- **Q: How is time fed into the loop without breaking the existing background animation?** Resolved: the radiating-bars background takes `time` as an argument today; we route that argument through a `Clock` value that is either `WallClock` (production) or `ManualClock` (test). The simulation loop stops reading time directly.
- **Q: Does the seeded PRNG block this work?** Resolved: no. The current enemies move deterministically (no randomness), so we can ship the test API, frame-step driver, and replay harness first, then add the seeded PRNG as a separate task. Replay fixtures include a `seed` field from day one so they don't need a format change later.
- **Q: Do we keep coverage instrumentation?** Resolved: yes. `vite-plugin-istanbul` and the `.nyc_output` flow stay; the new state-based Playwright tests will still execute instrumented code paths, so the 80% threshold remains meaningful.

## Edge cases

- **Test mode in production bundle.** The test API must be tree-shaken from the production build. The `define`-replaced `__BRUFF_TEST_MODE__` flag is the gate; verify the production bundle does not contain the string `__bruffTestApi`.
- **Multiple `<bruff-game>` elements on a page.** The arcade currently mounts one. The element-level `testApi` getter is per-instance; the `window.__bruffTestApi` shim points at `document.querySelector("bruff-game")`. Multi-instance is unsupported and documented.
- **Canvas resize between `loadState` and `stepFrames`.** `loadState` overwrites `state.canvas`; the resize observer must not clobber it on the next frame. The clamp inside `updatePlayer` is the safety net.
- **`freezeForSnapshot()` while no frame has rendered yet.** Calling it before the first tick must still produce a paint of the initial state; we force one render synchronously before resolving.
- **Input dispatched during a `stepFrames` call.** Inputs queued via `dispatchInput` between ticks are picked up on the next tick, FIFO. We do not interleave dispatch and step.
- **Replay fixture for an outdated `stateVersion`.** The replay harness asserts `fixture.stateVersion === state.stateVersion` at load time and reports a typed mismatch (no `throw`). Migrating old fixtures is out of scope for this feature and tracked under `migrate-state`.
- **Headless WebKit timing differences.** Removing `slowMo` and RAF means timing jitter is no longer a factor; tests await `stepFrames` returning, not `waitForTimeout`.
- **Touch input observable in test mode.** Touch handling stays wired but is bypassed by `dispatchInput`. Tests do not need to synthesize `TouchEvent`s.
- **Axe runs against a moving canvas.** Axe tests already only inspect the DOM tree; the canvas's contents do not affect them. We keep them as-is.

## Verification

- Test mode is gated by `__BRUFF_TEST_MODE__`, `?test=1`, and `data-test-mode="true"` and is covered by `packages/game/lib/effects/test-mode.test.ts`.
- Deterministic stepping, monotonic `frameIndex`, manual clock behavior, render stats, API attachment, and replay fixtures are covered by the new game package unit/property/replay tests.
- Playwright now uses state-first E2E specs, dark/light axe checks, a static HUD screenshot path, and a frozen replay checkpoint path.
- Production bundle safety is covered by `packages/arcade/scripts/check-bundle-clean.mjs`, wired through `pnpm --filter @bruff/arcade run build:site`.
- Final verification command run: `CI=true pnpm run ok`.
