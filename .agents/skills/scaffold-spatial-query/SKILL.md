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

For the tactical board, encode a `GridCell` into a string key or a compact
number:

```ts
// String key (simple, readable)
import type { GridCell } from "../core/types.ts";

const gridKey = (cell: GridCell): string => `${cell.column},${cell.row}`;

// Bit-packed number key (faster for large grids — requires bounded coords)
const gridKey = (cell: GridCell): number =>
  (cell.column << 16) | (cell.row & 0xffff);
```

Pick string keys by default; switch to number keys only if profiling shows a hot path.

---

## Collision Map Example

```ts
import type { Enemy, GameState, GridCell } from "../core/types.ts";

type CollisionMap = ReadonlyMap<string, Enemy>;

const buildCollisionMap = (state: GameState): CollisionMap =>
  new Map(
    state.enemies.flatMap((enemy) =>
      enemy.cell === undefined ? [] : [[gridKey(enemy.cell), enemy]],
    ),
  );

const isOccupied = (map: CollisionMap, cell: GridCell): boolean =>
  map.has(gridKey(cell));
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

const chunkKey = (cell: GridCell): ChunkKey =>
  `${Math.floor(cell.column / CHUNK_SIZE)},${Math.floor(cell.row / CHUNK_SIZE)}`;

const buildChunkedGrid = (state: GameState): ChunkedGrid =>
  state.entities.reduce<Map<ChunkKey, Chunk>>((chunks, entity) => {
    const key = chunkKey(entity.cell);
    const chunk = new Map(chunks.get(key) ?? []);
    const nextChunk = new Map([...chunk, [gridKey(entity.cell), entity]]);
    return new Map([...chunks, [key, nextChunk]]);
  }, new Map());
```

---

## Query Functions

```ts
const queryAt = (map: CollisionMap, cell: GridCell): Enemy | undefined =>
  map.get(gridKey(cell));

const queryNeighbours = (
  map: CollisionMap,
  cell: GridCell,
): ReadonlyArray<Enemy> => {
  const offsets = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  return offsets.flatMap(([dx, dy]) => {
    const e = queryAt(map, {
      column: cell.column + (dx ?? 0),
      row: cell.row + (dy ?? 0),
    });
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
    const state = /* GameState with one enemy at { column: 3, row: 5 } */;
    const map = buildCollisionMap(state);
    expect(isOccupied(map, { column: 3, row: 5 })).toBe(true);
    expect(isOccupied(map, { column: 0, row: 0 })).toBe(false);
  });

  it("returns undefined for empty cell", () => {
    const map = buildCollisionMap(/* empty state */);
    expect(queryAt(map, { column: 10, row: 10 })).toBeUndefined();
  });
});
```

---

## Prohibited

- Storing spatial indices in `GameState` (they are derived, not canonical)
- Mutating an existing Map (always construct fresh from state)
- Accessing `GameState` inside query functions — pass the pre-built map instead
- Storing derived spatial data in replay fixtures or snapshots; derive it from `GameState` during each deterministic tick.
