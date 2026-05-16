# RenderCommand

## Goal

Introduce an active `RenderCommand` rendering pipeline for the canvas game. The pure `render/` layer will project a `GameState` snapshot into deterministic drawing commands, and the `effects/` layer will be the only place that executes those commands against a live `CanvasRenderingContext2D`. The visible game should keep the same player, enemy, background, test-mode, replay, and E2E behaviour while removing direct game-entity drawing logic from the effects adapter.

## User-visible behaviour

- The `<bruff-game>` canvas still renders the blue player square and red enemy squares in the same positions and sizes for the same `GameState`.
- Enemy draw order remains the existing array order, preserving deterministic overlap behaviour.
- The animated background continues to render before foreground game entities.
- Test mode still exposes `window.__bruffTestApi.getRenderStats()` with the same `RenderStats` shape and values.
- `freezeForSnapshot()` still produces a stable canvas frame at replay checkpoints.
- Existing state-first Playwright tests continue to assert state and render stats through `window.__bruffTestApi`.

## Out of scope

- Adding new visible primitives beyond the current foreground rectangles.
- Replacing the radiating-bars background with `RenderCommand`s.
- Changing `GameState`, replay fixture, or snapshot file shape.
- Adding a retained scene graph, render cache, z-index model, sprite atlas, camera, or tile-map renderer.
- Full-canvas visual regression expansion beyond the existing frozen checkpoint path.
- Changing the public browser test API.

## Open questions (resolved)

- **Q: Does this create a new `RenderCommand` type or use the existing one?**
  A: Use the existing `RenderCommand` union in `packages/game/lib/core/actions.ts`. This work operationalizes it by adding projection and execution modules.
- **Q: Should the pure projector emit the existing `clear` command immediately?**
  A: No. The current animated background is still drawn by the shell before foreground entities. Emitting and executing `clear` after the background would erase it. The executor handles `clear` because the type already allows it, but the first projector emits only foreground `fill-rect` commands. Commandifying the background is a follow-up.
- **Q: Where does the projector live?**
  A: `packages/game/lib/render/project-render-commands.ts`. It is pure, DOM-free, and imports only `core/` types.
- **Q: Where does Canvas execution live?**
  A: `packages/game/lib/effects/execute-render-command.ts`. Calling `context.fillRect`, `context.clearRect`, or assigning `context.fillStyle` is a Canvas side effect and stays in `effects/`.
- **Q: Should `RenderStats` be derived from commands or from state?**
  A: Derive stats from the same `GameState` snapshot used to create commands. This preserves the current shape and avoids inferring semantic meaning from generic drawing commands.

## Edge cases

- A state with zero enemies produces exactly one foreground `fill-rect` command for the player and reports `enemiesDrawn: 0`.
- Multiple enemies at the same position preserve array order in the command list.
- Negative or out-of-bounds coordinates are not corrected by rendering; reducers own movement and clamping.
- `executeRenderCommand` receives a `clear` command and clears the full canvas using the context's canvas dimensions.
- `executeRenderCommand` receives a `fill-rect` command and sets `fillStyle` before drawing the rectangle.
- Adding a new `RenderCommand` variant later fails typecheck until the executor's exhaustive switch handles it.
- `render()` remains an effects-layer adapter and must not be imported by `core/`, `state/`, `input/`, or `render/` pure modules.
- Existing E2E render-stat assertions remain stable in test mode after the refactor.

## Verification

- The blue player square and red enemy squares are projected by `packages/game/lib/render/project-render-commands.test.ts` and executed through `packages/game/lib/effects/render.test.ts`.
- Enemy draw order is verified by `project-render-commands.test.ts` and `render.test.ts`, both asserting player-first then enemies in array order.
- The animated background remains outside `RenderCommand` and continues to be covered by `packages/arcade/e2e/replay-checkpoint.spec.ts`.
- `RenderStats` shape and values are covered by `packages/game/lib/render/render-stats.test.ts`, `packages/game/lib/effects/render.test.ts`, and `packages/arcade/e2e/state-assertions.spec.ts`.
- `freezeForSnapshot()` stability is covered by `packages/arcade/e2e/replay-checkpoint.spec.ts`.
- State-first Playwright test API behaviour is covered by `packages/arcade/e2e/state-assertions.spec.ts`.
- Zero-enemy projection and stats are covered by `project-render-commands.test.ts` and `render-stats.test.ts`.
- Same-state deterministic projection is covered by `project-render-commands.test.ts`.
- `clear`, `fill-rect`, command order, and executor exhaustiveness are covered by `packages/game/lib/effects/execute-render-command.test.ts` plus `CI=true pnpm --filter @bruff/game run typecheck`.
- Package gates run for this work: `CI=true pnpm --filter @bruff/game run format`, `lint`, `typecheck`, `test`; `CI=true pnpm --filter @bruff/arcade run test`; and root `npm run ok`.
