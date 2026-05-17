---
name: scaffold-prng
description: Implement or extend the in-house seeded PRNG stored in GameState — zero external dependencies, fully deterministic
---

# Scaffold PRNG

Use when adding randomness to the game, or when setting up the PRNG for the first time.

**Rule:** All randomness flows through the seeded PRNG stored in `GameState`. `Math.random()` and `crypto.randomUUID()` are forbidden everywhere.

---

## Current API

The in-house PRNG lives in `packages/utils/module/fp/prng.ts` and is exported from `@bruff/utils`.

```ts
export const createPrng = (seed: number): PrngState => ({
  accumulator: seed,
  type: "prng-state",
});
export const nextId = (prng: PrngState): { prng: PrngState; value: string };
```

---

## Add PRNG to GameState

In `packages/game/lib/core/types.ts`:

```ts
import type { PrngState } from "@bruff/utils"; // or local import

export type GameState = Readonly<{
  stateVersion: number;
  seed: number;
  prng: PrngState;
  frameIndex: number;
  /* … other fields … */
}>;
```

In `createInitialState`, accept or derive a deterministic seed:

```ts
import { createPrng } from "@bruff/utils";

const createInitialState = (canvas: CanvasSize, seed = 1): GameState => ({
  stateVersion: 1,
  seed,
  prng: createPrng(seed),
  frameIndex: 0,
  /* … */
});
```

---

## Generating Branded IDs

Build entity IDs on top of `nextId`:

```ts
const drawId = <Tag extends string>(
  prng: PrngState,
): { id: Brand<string, Tag>; prng: PrngState } => {
  const step = nextId(prng);
  return { id: brand<Tag>(step.value), prng: step.prng };
};
```

Usage in an entity factory:

```ts
const step = drawId<"EnemyId">(state.prng);
return { ...state, prng: step.prng /* use step.id */ };
```

---

## Property-Based Tests (required)

```ts
import { test, fc } from "@fast-check/vitest";
import { expect } from "vitest";
import { createPrng, nextNumber } from "@bruff/utils";

test.prop([fc.integer()])(
  "produces identical sequences for the same seed",
  (seed) => {
    const run = (s: number) => {
      const first = nextNumber(createPrng(s));
      const second = nextNumber(first.prng);
      return [first.value, second.value];
    };

    expect(run(seed)).toStrictEqual(run(seed));
  },
);

test.prop([fc.integer()])("produces values in [0, 1)", (seed) => {
  const { value } = nextNumber(createPrng(seed));

  expect(value).toBeGreaterThanOrEqual(0);
  expect(value).toBeLessThan(1);
});
```

---

## Prohibited

- `Math.random()` anywhere in the codebase
- `crypto.randomUUID()` or `crypto.getRandomValues()`
- External PRNG libraries (zero runtime deps rule)
- Storing raw numbers as IDs without a Brand type
