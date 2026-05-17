---
name: scaffold-reducer
description: Scaffold a pure state reducer following the (state, action) => state pattern used in packages/game
---

# Scaffold Reducer

Use when adding a new state transition to the game simulation.

## Pattern

Every state transition is a pure function:

```ts
const myReducer = (state: GameState, action: MyAction): GameState => {
  switch (action.type) {
    case "CASE_A":
      return { ...state /* … */ };
    case "CASE_B":
      return { ...state /* … */ };
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
};
```

## Rules

- **No mutation** — always return a new object via spread or structural sharing.
- **No side effects** — no logging, no DOM, no network, no randomness (pass PRNG seed through state if needed).
- **No classes, no `this`**.
- Co-locate the file in `packages/game/lib/state/` as `<verb>-<noun>.ts` (e.g. `update-player.ts`, `update-enemies.ts`).
- Export as a named or default function — follow the existing file's convention.

## Steps

1. Create `packages/game/lib/state/<verb>-<noun>.ts` with the reducer body.
2. Create `packages/game/lib/state/<verb>-<noun>.test.ts` with:
   - At least one test per `case` branch.
3. Import `GameState` from `../core/types.ts` using `import type`.
4. Wire the reducer into `packages/game/lib/state/advance-game-state.ts` if it participates in the main tick.

## Composing into the pipeline

The root deterministic step in `advance-game-state.ts` chains reducers:

```
input normalisation → updatePlayer → updateEnemies → … → frameIndex increment
```

Add new reducers to that chain inside `advanceGameState`.
