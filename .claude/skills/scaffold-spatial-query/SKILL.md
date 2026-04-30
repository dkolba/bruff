---
name: scaffold-spatial-query
description: Add a new pure functional spatial index (collision map, grid, lookup) recomputed from GameState each tick
---

# Scaffold Spatial Query

Use when adding collision detection, field-of-view, pathfinding, or any other
positional query to the game.

**Rule:** No persistent spatial structures. Every index is rebuilt from `GameState`
at the start of each tick as a pure function. This guarantees determinism.

---

## Pattern

```
GameState → buildXxxMap(state) → ReadonlyMap<Key, Value>
                                  ↓
                           queryAt / queryNeighbours / isOccupied
```

All functions live in `packages/game/lib/state/` (depends on `core/` + `state/` only).

---

## Key Encoding

For a 2D grid, encode `(x, y)` into a string key or a compact number:

```ts
// String key (simple, readable)
const gridKey = (x: number, y: number): string => `${x},${y}`;

// Bit-packed number key (faster for large grids — requires bounded coords)
const gridKey = (x: number, y: number): number => (x << 16) | (y & 0xffff);
```

Pick string keys by default; switch to number keys only if profiling shows a hot path.

---

## Collision Map Example

```ts
import type { GameState } from "../../types/game-state-type.ts";
import type { Enemy } from "../../types/entity-types.ts";

type CollisionMap = ReadonlyMap<string, Enemy>;

const buildCollisionMap = (state: GameState): CollisionMap =>
  new Map(
    state.enemies.map(e => [`${Math.floor(e.xPos)},${Math.floor(e.yPos)}`, e]),
  );

const isOccupied = (map: CollisionMap, x: number, y: number): boolean =>
  map.has(`${x},${y}`);
```

Note: `new Map(...)` constructed from an iterable is not mutation — it's allocation.
The returned `Map` is treated as immutable (`ReadonlyMap`).

---

## Chunked Grids (for large maps)

When the map is large, split into fixed-size chunks to avoid rebuilding the full grid
every tick:

```ts
const CHUNK_SIZE = 16;

type ChunkKey = string; // `${chunkX},${chunkY}`
type Chunk = ReadonlyMap<string, Entity>;
type ChunkedGrid = ReadonlyMap<ChunkKey, Chunk>;

const chunkKey = (x: number, y: number): ChunkKey =>
  `${Math.floor(x / CHUNK_SIZE)},${Math.floor(y / CHUNK_SIZE)}`;

const buildChunkedGrid = (state: GameState): ChunkedGrid => {
  const chunks = new Map<ChunkKey, Map<string, Entity>>();
  for (const entity of state.entities) {
    const ck = chunkKey(entity.xPos, entity.yPos);
    const chunk = chunks.get(ck) ?? new Map();
    chunk.set(`${entity.xPos},${entity.yPos}`, entity);
    chunks.set(ck, chunk);
  }
  return chunks as ChunkedGrid;
};
```

---

## Query Functions

```ts
const queryAt = (map: CollisionMap, x: number, y: number): Enemy | undefined =>
  map.get(`${x},${y}`);

const queryNeighbours = (
  map: CollisionMap,
  x: number,
  y: number,
): ReadonlyArray<Enemy> => {
  const offsets = [[-1,0],[1,0],[0,-1],[0,1]];
  return offsets.flatMap(([dx, dy]) => {
    const e = queryAt(map, x + (dx ?? 0), y + (dy ?? 0));
    return e ? [e] : [];
  });
};
```

---

## Unit Tests (required)

```ts
import { describe, expect, it } from "vitest";
import { buildCollisionMap, isOccupied, queryAt } from "./collision-map.js";

describe("buildCollisionMap", () => {
  it("maps enemy positions to entities", () => {
    const state = /* GameState with one enemy at (3, 5) */;
    const map = buildCollisionMap(state);
    expect(isOccupied(map, 3, 5)).toBe(true);
    expect(isOccupied(map, 0, 0)).toBe(false);
  });

  it("returns undefined for empty cell", () => {
    const map = buildCollisionMap(/* empty state */);
    expect(queryAt(map, 10, 10)).toBeUndefined();
  });
});
```

---

## Prohibited

- Storing spatial indices in `GameState` (they are derived, not canonical)
- Mutating an existing Map (always construct fresh from state)
- Accessing `GameState` inside query functions — pass the pre-built map instead
