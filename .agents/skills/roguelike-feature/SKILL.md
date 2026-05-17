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
- New foreground visual output → `packages/game/lib/render/project-render-commands.ts` as `RenderCommand` projection
- Canvas / DOM side effect → `packages/game/lib/effects/`, with foreground Canvas command execution in `packages/game/lib/effects/execute-render-command.ts`
- Deterministic browser control, clocks, RAF/test stepping → `packages/game/lib/effects/`
- Logging or diagnostics side effect → `packages/game/lib/effects/` or the entry point, using `log()` from `@bruff/utils`
- Reusable, domain-agnostic helper → `packages/utils/`

## 2 — Define action types

If the feature introduces new events, extend the relevant discriminated union in `packages/game/lib/core/actions.ts`:

```ts
type GameAction =
  | { type: "MOVE_PLAYER"; direction: Direction }
  | { type: "YOUR_NEW_ACTION" /* typed payload */ };
```

Use `InputAction` for normalised input, `GameAction` for simulation events, `SystemEvent` for engine-level signals, and `RenderCommand` for draw instructions produced by the render projection.

## 3 — Implement as a pure state transition (TDD)

- Scaffold a stub → write a failing test → implement (C-1).
- Signature: `(state: GameState, action: YourAction) => GameState`
- No side effects. No imports from `effects/` or any browser API.
- Test with explicit inputs and outputs — no mocking.

## 4 — Wire up in the shell

Add the new action to the pure step path (`packages/game/lib/state/advance-game-state.ts`) or the relevant reducer. The shell (`effects/loop.ts` and `effects/frame-step-driver.ts`) dispatches inputs and renders; it must contain no business logic itself.

For visual output, add foreground draw data in `projectRenderCommands(state)` and Canvas execution in `executeRenderCommand(context, command)`. Keep animated background concerns in the shell unless the feature explicitly migrates them to commands.

If the feature affects browser tests, expose it through the existing `window.__bruffTestApi` surface only when `__BRUFF_TEST_MODE__` and `?test=1` / `data-test-mode="true"` are active.

Shell diagnostics must emit through the logging event bus with `log()` from `@bruff/utils`. Do not add direct `console.*` calls.

## 5 — Gate check

```sh
pnpm run ok
```
