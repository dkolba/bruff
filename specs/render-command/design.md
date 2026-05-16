# RenderCommand — Design

## Layer Assignment

| Module                                                | Layer   | Purpose                                                                      |
| ----------------------------------------------------- | ------- | ---------------------------------------------------------------------------- |
| `packages/game/lib/core/actions.ts`                   | core    | Keeps the existing `RenderCommand` discriminated union.                      |
| `packages/game/lib/render/project-render-commands.ts` | render  | Pure projection from `GameState` to ordered foreground commands.             |
| `packages/game/lib/render/render-stats.ts`            | render  | Keeps `RenderStats` and adds a pure `renderStatsForState` helper.            |
| `packages/game/lib/effects/execute-render-command.ts` | effects | Executes `RenderCommand` values against a live Canvas context.               |
| `packages/game/lib/effects/render.ts`                 | effects | Adapter: project commands, execute them, return stats.                       |
| `packages/game/lib/effects/frame-step-driver.ts`      | effects | Continues to call background rendering before the foreground render adapter. |

No `GameState` migration is required. The existing `RenderCommand` union remains in `core/actions.ts` so the action taxonomy stays centralized per A-15.

## Public API Surface

```ts
// packages/game/lib/render/project-render-commands.ts
import type { RenderCommand } from "../core/actions.ts";
import type { GameState } from "../core/types.ts";

export const projectRenderCommands: (
  state: GameState,
) => ReadonlyArray<RenderCommand>;
```

The projector emits:

1. one blue `fill-rect` command for `state.player`;
2. one red `fill-rect` command per enemy, in `state.enemies` order.

It does not emit `clear` in this phase because the existing shell-rendered background is still the whole-canvas redraw path.

```ts
// packages/game/lib/render/render-stats.ts
import type { GameState } from "../core/types.ts";

export type RenderStats = Readonly<{
  enemiesDrawn: number;
  frameIndex: number;
  playerDrawn: boolean;
}>;

export const initialRenderStats: () => RenderStats;
export const renderStatsForState: (state: GameState) => RenderStats;
```

```ts
// packages/game/lib/effects/execute-render-command.ts
import type { RenderCommand } from "../core/actions.ts";

export const executeRenderCommand: (
  context: CanvasRenderingContext2D,
  command: RenderCommand,
) => void;

export const executeRenderCommands: (
  context: CanvasRenderingContext2D,
  commands: ReadonlyArray<RenderCommand>,
) => void;
```

`executeRenderCommand` uses an exhaustive `switch` over `command.type`. `clear` calls `context.clearRect(0, 0, context.canvas.width, context.canvas.height)`. `fill-rect` assigns `context.fillStyle = command.color` and then calls `context.fillRect(...)`.

```ts
// packages/game/lib/effects/render.ts
const render: (
  state: GameState,
  context: CanvasRenderingContext2D,
) => RenderStats;
```

The adapter keeps its current call signature so `FrameStepDriverDependencies.renderGame` and existing tests do not need a public API change.

## Data Flow

```
effects/frame-step-driver.ts
  |
  | renderBackground(readClock(clock))
  v
effects/render.ts
  |
  | projectRenderCommands(state)
  v
render/project-render-commands.ts  ---> ReadonlyArray<RenderCommand>
  |
  | executeRenderCommands(context, commands)
  v
effects/execute-render-command.ts  ---> CanvasRenderingContext2D effects
  |
  | renderStatsForState(state)
  v
render/render-stats.ts             ---> RenderStats
```

Import direction remains valid: `effects/` imports `render/` and `core/`; `render/` imports only `core/`; `core/` imports nothing.

## Tradeoffs

### Projector Scope

- **Chosen: foreground commands only.** This keeps the change narrow and preserves the current animated background order. The shell still draws the background, then executes player/enemy commands.
- **Alternative: emit `clear` first from the projector.** Rejected for this phase because `effects/frame-step-driver.ts` currently draws the background before `renderGame`; executing `clear` inside `renderGame` would wipe the background.
- **Alternative: convert the radiating-bars background to commands now.** Rejected as a separate rendering problem involving transforms, color animation, and time input. It would widen the scope beyond introducing `RenderCommand` for current game entities.

### Stats Source

- **Chosen: derive `RenderStats` from `GameState`.** The stats currently mean "what the game attempted to draw", not "how many canvas calls succeeded". State-derived stats are deterministic, pure, and match the existing test API.
- **Alternative: derive stats by counting commands.** Rejected because generic `fill-rect` commands do not encode whether a rectangle represents a player, an enemy, a future projectile, or UI.

### Executor Shape

- **Chosen: small command executor functions in `effects/`.** Canvas side effects are isolated and directly testable with a browser-provider context spy.
- **Alternative: keep direct `fillRect` calls in `effects/render.ts`.** Rejected because it leaves entity-specific drawing logic in the shell and prevents pure render-layer tests from asserting the draw plan.

## Reuse Map

- `packages/game/lib/core/actions.ts` — existing `RenderCommand` union.
- `packages/game/lib/core/types.ts` — `GameState`, `Player`, `Enemy`, and canvas data consumed by the projector.
- `packages/game/lib/render/render-stats.ts` — existing stats type and initial stats helper.
- `packages/game/lib/effects/render.ts` — current effectful adapter to refactor.
- `packages/game/lib/effects/frame-step-driver.ts` — current render call site and background ordering.
- `packages/game/lib/effects/render.test.ts` — existing behaviour test to preserve while moving details behind commands.
- `packages/arcade/e2e/state-assertions.spec.ts` — render-stat E2E coverage that must remain green.
- `packages/arcade/e2e/replay-checkpoint.spec.ts` — frozen canvas checkpoint coverage that must remain green.

## Test Strategy

- Pure unit tests for `projectRenderCommands` live in `packages/game/lib/render/project-render-commands.test.ts`; they use literal `GameState` values and never touch DOM or Canvas.
- Pure unit tests for `renderStatsForState` live in `packages/game/lib/render/render-stats.test.ts`.
- Browser-provider tests for `executeRenderCommand(s)` live in `packages/game/lib/effects/execute-render-command.test.ts`; they spy on a real `CanvasRenderingContext2D`.
- The executor keeps an exhaustive `default` branch for future `RenderCommand` variants and excludes only that unreachable guard from V8 coverage so the 100% coverage gate remains meaningful.
- Existing `packages/game/lib/effects/render.test.ts` is updated to verify the adapter still draws the current player/enemy rectangles and returns the same stats.
- Existing arcade E2E tests cover the browser-facing test API and frozen checkpoint after the refactor.

## Acceptance

- `@bruff/game` render-layer tests can validate the draw plan without `document`, `window`, `customElements`, or `CanvasRenderingContext2D`.
- `@bruff/game` effects tests are the only tests that inspect Canvas method calls for foreground entity rendering.
- No source outside `effects/` calls `CanvasRenderingContext2D` methods.
- The `render/` directory is no longer only `RenderStats`; it owns the pure command projection.
- `CI=true pnpm --filter @bruff/game run format`, `lint`, `typecheck`, and `test` pass.
- `CI=true pnpm --filter @bruff/arcade run test` passes for available local browsers, with the full matrix left to CI when local WebKit/Firefox binaries are unavailable.
