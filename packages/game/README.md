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

`GameState` carries replay-critical fields and a fixed `7x7` tactical board:

```ts
type GameState = Readonly<{
  stateVersion: number;
  seed: number;
  frameIndex: number;
  board: { columns: 7; rows: 7 };
  player: { cell: GridCell };
  enemies: ReadonlyArray<{ cell: GridCell; spawnOrder: number }>;
  // canvas, input, playerMoved, prng
}>;
```

Player and enemy gameplay positions are grid cells. Movement inputs propose one orthogonal cell; moves outside the board or into an occupied enemy cell are blocked. Enemies move only after an accepted player move, resolve in ascending `spawnOrder`, and stay still when the proposed cell is occupied by the player, an enemy at turn start, or an earlier enemy destination. Render commands derive full-cell rectangles from `board` and `canvas`, so gameplay state stays independent of pixel dimensions.

`frameIndex` increments once per logical tick with queued input. Render-only frames with no queued input redraw the canvas without advancing enemies or `frameIndex`. `seed` and `prng` make entity identity and future random choices reproducible.

## Testing Pyramid

- Unit tests live beside pure modules as `*.test.ts`.
- Property tests use `@fast-check/vitest` for reducer and replay invariants.
- Replay tests load JSON fixtures from `tests/fixtures/` and compare final state with committed JSON snapshots in `tests/snapshots/`.
- Browser E2E tests live in `@bruff/arcade` and drive the loop through `window.__bruffTestApi` in `?test=1` mode.

Replay fixture shape:

```json
{
  "stateVersion": 3,
  "seed": 1,
  "initialCanvas": { "height": 600, "width": 800 },
  "frames": [{ "frame": 1, "input": "move-right" }],
  "totalFrames": 1
}
```

`frames` are applied before the matching replay frame. Replay frames with no input are render-only and do not increment `frameIndex`. Fixture inputs use normalized action names: `move-up`, `move-down`, `move-left`, and `move-right`. Version 3 fixtures replay against grid-only actor state; old replay versions are rejected rather than migrated at runtime.

## Commands

```sh
pnpm run test
pnpm run lint
pnpm run typecheck
pnpm run build
```
