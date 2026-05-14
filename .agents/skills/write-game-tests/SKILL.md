---
name: write-game-tests
description: Write the three required test levels for game logic — unit, property-based, and deterministic replay/snapshot
---

# Write Game Tests

Use when writing tests for `packages/game`. Three levels are required depending on what is being tested.

---

## Level 1 — Unit Tests (always required for pure functions)

Co-locate as `*.test.ts` next to the source file. Run via Vitest.

Rules:

- Test pure functions only — no DOM, no Canvas, no network.
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
      player: { ...state.player, yPos: state.player.yPos - PLAYER_SPEED },
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
- **State transitions**: `frameIndex` never decreases across deterministic stepping.
- **Replay runners**: output is deterministic given the same seed and fixture.

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
  if (fixture.type === "error") return;

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
- [ ] No DOM or Canvas access inside any test.
- [ ] No `Math.random()`, `Date.now()`, or raw `performance.now()` inside any test (seed and clock everything).
