---
name: write-game-tests
description: Write the three required test levels for game logic — unit, property-based, and deterministic replay/snapshot
---

# Write Game Tests

Use when writing tests for `packages/game`. Three levels are required depending on what is being tested.

---

## Deterministic Test Primitives

Use the current test harness vocabulary:

- `advanceGameState(state, inputs)` is the pure logical step. Empty `inputs` returns the same state; queued input advances exactly one logical tick, applies player input first, then the tick action.
- `frameIndex` counts logical ticks, not rendered frames. Render-only `stepFrames(n)` calls with no queued input must not move enemies or increment `frameIndex`.
- Gameplay movement is grid-based. State tests should assert actor `cell` and board occupancy invariants; actor `xPos` / `yPos` exist only for version 1 compatibility and render fallback cases.
- `createFrameStepDriver` / `stepFrames(n)` exercise the effects-layer driver with a `manualClock`; they may render and advance animation time even when state does not tick.
- `projectRenderCommands(state)` is the pure foreground draw plan. It should be tested with literal `GameState` values and exact `ReadonlyArray<RenderCommand>` expectations.
- `executeRenderCommand` / `executeRenderCommands` are effects-layer Canvas executors. They are tested with the browser provider and a real `CanvasRenderingContext2D` spy, not from pure render tests.
- `window.__bruffTestApi` is browser-facing only and is tested through effects tests or Playwright, never from pure state tests.

---

## Level 1 — Unit Tests (always required for pure functions)

Co-locate as `*.test.ts` next to the source file. Run via Vitest.

Rules:

- Test pure functions only — no DOM, no Canvas, no network. Pure render tests assert `RenderCommand` and `RenderStats` data rather than Canvas calls.
- One test per logical branch / state transition.
- Assert the complete return value in one snapshot-style assertion where possible (per T-6).

```ts
import { describe, expect, it } from "vitest";
import type { GameState } from "../core/types.ts";
import updatePlayer from "./update-player.js";

describe("updatePlayer", () => {
  it("moves north when input is arrowup", () => {
    const state: GameState = /* … */;
    expect(updatePlayer(state, { type: "move-up" })).toStrictEqual({
      ...state,
      player: { ...state.player, cell: { column: 3, row: 2 } },
      playerMoved: true,
    });
  });
});
```

---

## Level 2 — Property-Based Tests (required for PRNG, replay runners, and state transitions)

Use Vitest + @fast-check/vitest.

Properties to test:

- **PRNG**: same seed → same sequence of values.
- **Reducers**: applying inverse actions returns to original state (where applicable).
- **State transitions**: `frameIndex` never decreases, increments only for logical ticks with input, actors stay inside `board`, and no two actors occupy the same cell after valid transitions.
- **Replay runners**: output is deterministic given the same seed and fixture; replay frames without input are render-only and do not increment `frameIndex`.

```ts
import { test, fc } from "@fast-check/vitest";
import { expect } from "vitest";

test.prop([fc.integer()])(
  "PRNG produces same sequence for same seed",
  (seed) => {
    const seq1 = runPrng(seed, 10);
    const seq2 = runPrng(seed, 10);

    expect(seq1).toStrictEqual(seq2);
  },
);
```

---

## Level 3 — Snapshot / Replay Tests (required for full run determinism)

Capture a full deterministic run and assert the final state (or a hash of it) matches a stored snapshot.

Pattern:

1. Fix a `seed` in a replay fixture.
2. Feed scripted frame/input pairs through `runReplay(fixture)`.
3. Assert the resulting `GameState` matches a committed JSON snapshot.
4. Fixtures live in `packages/game/tests/fixtures/`; snapshots live in `packages/game/tests/snapshots/`.

```ts
import { expect, it } from "vitest";
import fixtureJson from "../../tests/fixtures/canonical-replay.json";
import snapshotJson from "../../tests/snapshots/canonical-replay.json";
import { parseReplayFixture } from "./replay-fixture.js";
import { runReplay } from "./run-replay.js";

it("produces deterministic output for fixed seed and input sequence", () => {
  const fixture = parseReplayFixture(fixtureJson);
  expect(fixture.type).toBe("ok");
  if (fixture.type === "error") {
    return;
  }

  expect(runReplay(fixture.value)).toStrictEqual({
    type: "ok",
    value: snapshotJson,
  });
});
```

---

## Checklist

- [ ] Every new pure function has a Level 1 unit test.
- [ ] Every PRNG consumer, replay runner, or deterministic step path has a Level 2 property test.
- [ ] Any new full-run integration path has a Level 3 replay snapshot.
- [ ] Render projection tests cover command shape, command order, zero-entity cases, and deterministic output for the same state.
- [ ] Render executor tests cover every `RenderCommand` branch and command ordering.
- [ ] Frame-driver tests cover both render-only frames and input-driven logical ticks.
- [ ] Test API tests prove `getState()` / `getRenderStats()` return clones, `dispatchInput()` normalises raw input, and attachment is gated by `__BRUFF_TEST_MODE__`.
- [ ] Arcade visual checks use `await expect(locator).toHaveScreenshot("name.png")` with an `@snapshot` test title tag; never leave raw `locator.screenshot()` captures unasserted. Update Arcade E2E screenshot baselines with `pnpm run --filter @bruff/arcade test:e2e:update-snapshots`.
- [ ] No DOM or Canvas access inside pure `core/`, `state/`, `input/`, or `render/` tests; effects tests may use browser APIs deliberately.
- [ ] No `Math.random()`, `Date.now()`, or raw `performance.now()` inside any test (seed and clock everything).
