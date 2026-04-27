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
    case "CASE_A": return { ...state, /* … */ };
    case "CASE_B": return { ...state, /* … */ };
    default: {
      const _exhaustive: never = action;
      throw new Error(`Unhandled action: ${JSON.stringify(_exhaustive)}`);
    }
  }
};
```

## Rules

- **No mutation** — always return a new object via spread or structural sharing.
- **No side effects** — no logging, no DOM, no network, no randomness (pass PRNG seed through state if needed).
- **No classes, no `this`**.
- Co-locate the file in `packages/game/lib/` as `<verb>-<noun>.ts` (e.g. `update-player.ts`, `update-enemies.ts`).
- Export as a named or default function — follow the existing file's convention.

## Steps

1. Create `packages/game/lib/<verb>-<noun>.ts` with the reducer body.
2. Create `packages/game/lib/<verb>-<noun>.test.ts` with:
   - At least one test per `case` branch.
   - One test for the `default` (unreachable) branch using `as never` in the test only.
3. Import `GameState` from `../types/game-state-type.ts` using `import type`.
4. Wire the reducer into the game loop in `packages/game/lib/loop.ts` if applicable.

## Composing into the pipeline

The root pipeline in `loop.ts` chains reducers via the generator:

```
input normalisation → updatePlayer → updateEnemies → … → render
```

Add new reducers to that chain inside `createGameLoop`.
