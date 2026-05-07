---
name: roguelike-feature
description: Step-by-step workflow for implementing a new game feature in the roguelike architecture (layer assignment → discriminated union → pure function → test → shell wiring)
---

# Implementing a New Game Feature

Follow these steps in order. Each step must compile and pass tests before moving to the next.

## 1 — Assign to a layer

Identify which layer(s) the feature touches:

- Pure game logic → `packages/game/lib/state/`
- New input handling → `packages/game/lib/input/`
- New visual output → `packages/game/lib/render/`
- Canvas / DOM side effect → `packages/game/lib/effects/`
- Reusable, domain-agnostic helper → `packages/utils/`

## 2 — Define action types

If the feature introduces new events, extend the relevant discriminated union in `state/`:

```ts
type GameAction =
  | { type: "MOVE_PLAYER"; direction: Direction }
  | { type: "YOUR_NEW_ACTION"; /* typed payload */ };
```

Use `InputAction` for normalised input, `GameAction` for simulation events, `SystemEvent` for engine-level signals, `RenderCommand` for draw instructions.

## 3 — Implement as a pure state transition (TDD)

- Scaffold a stub → write a failing test → implement (C-1).
- Signature: `(state: GameState, action: YourAction) => GameState`
- No side effects. No imports from `effects/` or any browser API.
- Test with explicit inputs and outputs — no mocking.

## 4 — Wire up in the shell

Add the new action to the root pipeline inside `effects/` or `loop.ts`. The shell dispatches to pure functions; it must contain no business logic itself.

## 5 — Gate check

```sh
pnpm run ok
```
