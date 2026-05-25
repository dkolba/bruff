---
name: scaffold-entity
description: Scaffold a new game entity type with a branded ID, Readonly shape, and deterministic ID generation
---

# Scaffold Entity

Use when introducing a new game entity (e.g. `Enemy`, `Item`, `Projectile`).

## Rules

- All entity types are `Readonly<{…}>` — no mutable fields.
- Every entity has a branded ID: `Brand<string, "EntityNameId">` — never a plain `string`.
- IDs are deterministically generated via the seeded PRNG stored in state — never `Math.random()`, never `crypto.randomUUID()`.
- IDs are **never reused** within a run; spawn order is tracked for deterministic tie-breaking.
- Board actors use `GridCell` for gameplay position. Existing `xPos` / `yPos` fields are legacy compatibility data and should not be copied into new entity scaffolds unless a migration explicitly requires them.
- Composition over nesting: share sub-shapes via type aliases, not inheritance.

## Steps

1. **Declare the branded ID type** in `packages/game/lib/core/types.ts`:

   ```ts
   import type { Brand } from "@bruff/utils";
   export type EnemyId = Brand<string, "EnemyId">;
   ```

2. **Declare the entity type** as a `Readonly` shape:

   ```ts
   import type { GridCell } from "./types.ts";

   export type Enemy = Readonly<{
     cell: GridCell;
     id: EnemyId;
     spawnOrder: number;
     size: number;
   }>;
   ```

3. **Add a factory function** (pure, no side effects) that accepts PRNG state and returns the entity plus next PRNG state:

```ts
const createEnemy = (
  prng: PrngState,
  spawnOrder: number,
  cell: GridCell,
): { enemy: Enemy; prng: PrngState } => {
  const step = nextId(prng);
  return {
    enemy: {
      cell,
      id: brand<"EnemyId">(step.value),
      spawnOrder,
      size: ENEMY_SIZE,
    },
    prng: step.prng,
  };
};
```

4. **Add the entity collection to `GameState`** in `packages/game/lib/core/types.ts` as `ReadonlyArray<Enemy>`.

5. **Write unit tests** in a co-located `*.test.ts` covering:
   - ID is branded (compile-time, no runtime check needed).
   - Two calls with the same PRNG seed produce the same ID.
   - Consecutive calls produce different IDs.

## Tie-breaking

When multiple entities act simultaneously in a tick, order by:

1. `spawnOrder` ascending (earlier spawn wins)
2. `id` lexicographic ascending as a secondary key
