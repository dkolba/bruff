---
name: scaffold-prng
description: Implement or extend the in-house seeded PRNG stored in GameState — zero external dependencies, fully deterministic
---

# Scaffold PRNG

Use when adding randomness to the game, or when setting up the PRNG for the first time.

**Rule:** All randomness flows through the seeded PRNG stored in `GameState`. `Math.random()` and `crypto.randomUUID()` are forbidden everywhere.

---

## Recommended Algorithm: Mulberry32

Simple, fast, excellent distribution, 32-bit seed. Implement in `packages/utils/src/prng.ts` (or `packages/game/lib/core/prng.ts` if not reused elsewhere).

```ts
import type { Brand } from "@bruff/utils";

/** Opaque PRNG state — treat as an immutable seed token. */
export type PrngState = Brand<number, "PrngState">;

/** Seed a new PRNG from a plain number. */
export const seedPrng = (seed: number): PrngState =>
  seed as PrngState; // safe: Brand is a compile-time marker only

/**
 * Advance the PRNG by one step.
 * Returns [0, 1) float + the next state. Never mutates.
 */
export const nextPrng = (prng: PrngState): [number, PrngState] => {
  let t = (prng as number) + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  return [value, t as PrngState];
};
```

---

## Add PRNG to GameState

In `packages/game/types/game-state-type.ts`:

```ts
import type { PrngState } from "@bruff/utils"; // or local import

export type GameState = Readonly<{
  stateVersion: number;
  prng: PrngState;
  /* … other fields … */
}>;
```

In `createInitialState`, seed from `Config.seed`:

```ts
import { seedPrng } from "@bruff/utils";

const createInitialState = (config: Config): GameState => ({
  stateVersion: 1,
  prng: seedPrng(config.seed),
  /* … */
});
```

---

## Generating Branded IDs

Build `generateId` on top of `nextPrng`:

```ts
export const generateId = <Tag extends string>(
  prng: PrngState,
): [Brand<string, Tag>, PrngState] => {
  const [a, p1] = nextPrng(prng);
  const [b, p2] = nextPrng(p1);
  const id = `${(a * 0xffffffff) >>> 0}-${(b * 0xffffffff) >>> 0}` as Brand<string, Tag>;
  return [id, p2];
};
```

Usage in an entity factory:

```ts
const [id, nextPrng] = generateId<"EnemyId">(state.prng);
return [{ id, /* … */ }, { ...state, prng: nextPrng }];
```

---

## Property-Based Tests (required)

```ts
import * as fc from "fast-check";
import { it, expect } from "vitest";
import { seedPrng, nextPrng } from "@bruff/utils";

it("produces identical sequences for the same seed", () => {
  fc.assert(
    fc.property(fc.integer(), (seed) => {
      const run = (s: number) => {
        const [v1, p1] = nextPrng(seedPrng(s));
        const [v2] = nextPrng(p1);
        return [v1, v2];
      };
      expect(run(seed)).toStrictEqual(run(seed));
    }),
  );
});

it("produces values in [0, 1)", () => {
  fc.assert(
    fc.property(fc.integer(), (seed) => {
      const [v] = nextPrng(seedPrng(seed));
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }),
  );
});
```

---

## Prohibited

- `Math.random()` anywhere in the codebase
- `crypto.randomUUID()` or `crypto.getRandomValues()`
- External PRNG libraries (zero runtime deps rule)
- Storing raw numbers as IDs without a Brand type
