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
import updatePlayer from "./update-player.js";
import type { GameState } from "../types/game-state-type.ts";

describe("updatePlayer", () => {
  it("moves north when input is arrowup", () => {
    const state: GameState = /* … */;
    expect(updatePlayer({ ...state, input: ["arrowup"] })).toStrictEqual({
      ...state,
      input: [],
      player: { ...state.player, yPos: state.player.yPos - PLAYER_SPEED },
      playerMoved: true,
    });
  });
});
```

---

## Level 2 — Property-Based Tests (required for PRNG, generators, state transitions)

Use Vitest + fast-check (or a homegrown property helper if fast-check is not a dev dependency).

Properties to test:
- **PRNG**: same seed → same sequence of values.
- **Reducers**: applying inverse actions returns to original state (where applicable).
- **State transitions**: `stateVersion` monotonically increases.
- **Generators**: output is deterministic given the same seed.

```ts
import * as fc from "fast-check";
import { it, expect } from "vitest";

it("PRNG produces same sequence for same seed", () => {
  fc.assert(
    fc.property(fc.integer(), (seed) => {
      const seq1 = runPrng(seed, 10);
      const seq2 = runPrng(seed, 10);
      expect(seq1).toStrictEqual(seq2);
    }),
  );
});
```

---

## Level 3 — Snapshot / Replay Tests (required for full run determinism)

Capture a full deterministic run and assert the final state (or a hash of it) matches a stored snapshot.

Pattern:
1. Fix a seed in `Config`.
2. Feed a scripted sequence of `InputAction` values into the game loop.
3. Assert the resulting `GameState` matches a stored snapshot.
4. Stored snapshots live in `packages/game/tests/snapshots/`.

```ts
import { expect, it } from "vitest";
import { runDeterministicGame } from "../tests/helpers/run-deterministic-game.js";

it("produces deterministic output for fixed seed and input sequence", () => {
  const finalState = runDeterministicGame({
    seed: 42,
    inputs: ["arrowup", "arrowright", "arrowdown"],
  });
  expect(finalState).toMatchSnapshot();
});
```

---

## Checklist

- [ ] Every new pure function has a Level 1 unit test.
- [ ] Every PRNG consumer or generator function has a Level 2 property test.
- [ ] Any new full-run integration path has a Level 3 replay snapshot.
- [ ] No DOM or Canvas access inside any test.
- [ ] No `Math.random()` or `Date.now()` inside any test (seed everything).
