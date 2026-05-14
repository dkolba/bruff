# @bruff/game

A TypeScript game package that registers `<bruff-game>` and runs a deterministic 2D canvas roguelike loop. The shell owns browser effects; state transitions are pure functions over immutable `GameState`.

```ts
import "@bruff/game";
```

## Architecture

Code is split by layer:

- `lib/core/` — immutable domain types and action unions.
- `lib/state/` — pure reducers, initial state, replay fixtures, and replay runners.
- `lib/input/` — raw input normalization into `InputAction`.
- `lib/render/` — pure render-adjacent data such as `RenderStats`.
- `lib/effects/` — DOM, Canvas, time, logging, RAF, and test API wiring.

`GameState` carries replay-critical fields:

```ts
type GameState = Readonly<{
  stateVersion: number;
  seed: number;
  frameIndex: number;
  // canvas, player, enemies, input, playerMoved, prng
}>;
```

`frameIndex` increments once per logical tick. Render-only frames with no queued input redraw the canvas without advancing enemies or `frameIndex`. `seed` and `prng` make entity identity and future random choices reproducible.

## Testing Pyramid

- Unit tests live beside pure modules as `*.test.ts`.
- Property tests use `@fast-check/vitest` for reducer and replay invariants.
- Replay tests load JSON fixtures from `tests/fixtures/` and compare final state with committed JSON snapshots in `tests/snapshots/`.
- Browser E2E tests live in `@bruff/arcade` and drive the loop through `window.__bruffTestApi` in `?test=1` mode.

Replay fixture shape:

```json
{
  "stateVersion": 1,
  "seed": 1,
  "initialCanvas": { "height": 600, "width": 800 },
  "frames": [{ "frame": 1, "input": "move-right" }],
  "totalFrames": 1
}
```

`frames` are applied before the matching replay frame. Replay frames with no input are render-only and do not increment `frameIndex`. Fixture inputs use normalized action names: `move-up`, `move-down`, `move-left`, and `move-right`.

## Commands

```sh
pnpm run test
pnpm run lint
pnpm run typecheck
pnpm run build
```
