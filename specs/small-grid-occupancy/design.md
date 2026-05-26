# Small Grid Occupancy Design

## Layer Assignment

| Module                                                  | Layer   | Purpose                                                                   |
| ------------------------------------------------------- | ------- | ------------------------------------------------------------------------- |
| `packages/game/lib/core/constants.ts`                   | core    | Own board dimensions, current state version, and render cell constants.   |
| `packages/game/lib/core/types.ts`                       | core    | Define `Board`, `GridCell`, and grid-based actor/state shapes.            |
| `packages/game/lib/state/grid.ts`                       | state   | Pure board topology helpers: deltas, bounds checks, and cell equality.    |
| `packages/game/lib/state/occupancy.ts`                  | state   | Pure actor occupancy queries for player and enemy movement.               |
| `packages/game/lib/state/update-player.ts`              | state   | Apply accepted one-cell player movement and blocked movement rules.       |
| `packages/game/lib/state/move-enemy-toward-player.ts`   | state   | Pick a deterministic one-cell greedy enemy destination.                   |
| `packages/game/lib/state/update-enemies.ts`             | state   | Resolve sequential enemy movement by `spawnOrder` and reserved cells.     |
| `packages/game/lib/state/create-initial-state.ts`       | state   | Create non-overlapping initial grid state at version 3.                   |
| `packages/game/lib/state/replay-fixture.ts`             | state   | Accept the bumped replay state version for fixtures.                      |
| `packages/game/lib/state/run-replay.ts`                 | state   | Continue replaying normalized movement inputs through `advanceGameState`. |
| `packages/game/lib/render/project-render-commands.ts`   | render  | Convert grid cells into pixel rectangles for player and enemies.          |
| `packages/game/lib/render/render-stats.ts`              | render  | Keep state-derived render stats unchanged.                                |
| `packages/game/lib/effects/execute-render-command.ts`   | effects | Continue executing projected pixel rectangles only.                       |
| `packages/game/lib/effects/test-api/attach-test-api.ts` | effects | Continue cloning and loading `GameState` through the existing test API.   |

No input or DOM module changes are required. Existing `InputAction` variants remain the public movement vocabulary.

## Public API Surface

```ts
// packages/game/lib/core/constants.ts
export const BOARD_COLUMNS = 7;
export const BOARD_ROWS = 7;
export const CURRENT_STATE_VERSION = 3;
```

```ts
// packages/game/lib/core/types.ts
export type GridCell = Readonly<{
  column: number;
  row: number;
}>;

export type Board = Readonly<{
  columns: number;
  rows: number;
}>;

export type Enemy = Readonly<{
  cell: GridCell;
  id: EnemyId;
  size: number;
  spawnOrder: number;
}>;

export type Player = Readonly<{
  cell: GridCell;
  id: PlayerId;
  size: number;
}>;

export type GameState = Readonly<{
  board: Board;
  canvas: CanvasSize;
  enemies: ReadonlyArray<Enemy>;
  input: ReadonlyArray<InputAction>;
  player: Player;
  playerMoved: boolean;
  frameIndex: number;
  prng: PrngState;
  seed: number;
  stateVersion: number;
}>;
```

`cell` is the gameplay source of truth. Pixel coordinates and rectangle dimensions are derived in the render layer from `state.board` and `state.canvas`. Actor `xPos` / `yPos` fields are removed from `Player` and `Enemy`; pixel coordinates remain only on `RenderCommand` values and raw browser input events.

```ts
// packages/game/lib/state/grid.ts
export const cellForAction: (cell: GridCell, action: InputAction) => GridCell;
export const cellsEqual: (left: GridCell, right: GridCell) => boolean;
export const isCellInsideBoard: (cell: GridCell, board: Board) => boolean;
```

```ts
// packages/game/lib/state/occupancy.ts
export const isCellOccupiedByEnemy: (
  cell: GridCell,
  enemies: ReadonlyArray<Enemy>,
) => boolean;

export const isCellOccupiedByActor: (
  cell: GridCell,
  state: GameState,
) => boolean;
```

```ts
// packages/game/lib/state/move-enemy-toward-player.ts
export const nextEnemyCellTowardPlayer: (
  enemy: Enemy,
  player: Player,
) => GridCell;
```

`nextEnemyCellTowardPlayer` returns the enemy's current cell if a caller supplies an already-overlapping state. Normal state construction and movement prevent that overlap.

## Data Shape Changes

`GameState.board` is required.

`Player` changes from transitional grid plus pixel position:

```ts
{
  (cell, id, size);
}
```

`Enemy` changes from transitional grid plus pixel position:

```ts
{
  (cell, id, size, spawnOrder);
}
```

`stateVersion` increments from `2` to `3`. Replay fixtures and final-state snapshots are updated to version 3. Version 1 and version 2 replay fixtures are not silently accepted as version 3 fixtures. No runtime migration is provided for old `GameState` values because the compatibility window is intentionally closed.

## Movement Rules

Player movement:

1. Translate the movement `InputAction` into one adjacent `GridCell`.
2. Reject the move if the destination is outside `state.board`.
3. Reject the move if any enemy occupies the destination.
4. Set `playerMoved: true` only when the player cell changes.
5. Leave `playerMoved` unchanged for blocked movement so an earlier accepted input in the same queue still counts.
6. Leave `playerMoved` unchanged for `tick`.

Enemy movement:

1. Enemies resolve in ascending `spawnOrder`.
2. Each enemy proposes one greedy orthogonal step toward the player's current cell.
3. The primary axis is the axis with the greater absolute distance.
4. Ties choose horizontal movement first.
5. If the proposed cell is outside the board, occupied by the player, occupied by any enemy at turn start, or already reserved by an earlier enemy in the same turn, the enemy stays in place.
6. Enemies do not pathfind around blockers and do not choose a fallback axis.

Turn advancement:

- `advanceGameState(state, inputs)` still returns `state` unchanged when `inputs` is empty.
- `advanceGameState` resets `playerMoved` to `false` at the start of each input-bearing logical tick.
- Queued inputs are processed in order.
- `updateEnemies` advances on `tick` only when `state.playerMoved === true`.
- A blocked player input does not advance enemies.
- `frameIndex` increments only when at least one input was processed, matching the current logical tick contract.

## Data Flow

```
effects input sources
  |
  | normalise-input.ts
  v
InputAction queue
  |
  | advanceGameState(state, inputs)
  v
state/update-player.ts
  |
  | uses grid.ts + occupancy.ts
  v
state/update-enemies.ts
  |
  | uses move-enemy-toward-player.ts + occupancy.ts
  v
GameState with actor cells
  |
  | projectRenderCommands(state)
  v
RenderCommand fill-rect values with derived pixels
  |
  | executeRenderCommands(...)
  v
Canvas foreground draw
```

Import direction stays valid: `effects/` imports render and state, `render/` imports core, `state/` imports core, and `core/` imports no game layer.

## Render Geometry

The renderer derives cell rectangles from canvas and board dimensions.

- `cellWidth = canvas.width / board.columns`
- `cellHeight = canvas.height / board.rows`
- `xPos = cell.column * cellWidth`
- `yPos = cell.row * cellHeight`
- `width = cellWidth`
- `height = cellHeight`

The first pass uses full-cell rectangles. Gaps, outlines, animation, and sprites are out of scope.

## Tradeoffs

### State Shape

- **Chosen: make `board` and actor `cell` required and remove actor `xPos` / `yPos`.** This closes the compatibility window and makes impossible the accidental use of pixel actor state for gameplay.
- **Alternative: keep `xPos` and `yPos` and snap them to grid multiples.** Rejected because pixel coordinates would remain the apparent source of truth, making occupancy checks depend on render geometry and canvas dimensions.
- **Alternative: keep optional `board` / `cell` and legacy fallbacks.** Rejected because the compatibility window already served its migration purpose and now makes future movement code harder to reason about.

### Board Size

- **Chosen: `7x7`.** It is small enough for dense broughlike decisions while giving three enemies enough room to create blocks without immediately trapping the player.
- **Alternative: `5x5`.** Rejected for the first pass because the existing three-enemy start can become cramped before combat or escape rules exist.
- **Alternative: derive board size from canvas dimensions.** Rejected because replay and tests need a stable topology independent of viewport size.

### Enemy Movement

- **Chosen: one greedy orthogonal step with no fallback pathing.** The rule is deterministic, legible, and makes blockers matter.
- **Alternative: shortest-path movement around occupied cells.** Rejected because it adds pathfinding complexity before the game has combat, rewards, or varied enemy rules.
- **Alternative: simultaneous enemy proposals.** Rejected because sequential `spawnOrder` resolution already exists and gives deterministic priority without introducing tie-breaker state.

### Blocked Player Movement

- **Chosen: blocked player inputs do not advance enemies.** This preserves no-free-wait pressure without making accidental wall bumps or occupied-cell bumps function as hidden wait actions.
- **Alternative: every input advances enemies.** Rejected because blocked moves would become a risky wait verb and would need a broader tactical spec.
- **Alternative: blocked moves advance only frame index.** Rejected because it would create logical ticks with no state movement and complicate replay interpretation without gameplay value.

### Migration

- **Chosen: remove runtime state migration and bump replay fixtures to version 3.** This makes old state rejection explicit and keeps the domain model grid-only.
- **Alternative: add `migrateV2toV3`.** Rejected because the user explicitly requested dropping the compatibility window and old/gridless loaded-state support.
- **Alternative: keep accepting version 2 replay fixtures directly.** Rejected because fixture final states would no longer share the same actor shape.

## Reuse Map

- `packages/game/lib/core/actions.ts` — existing `InputAction` and `GameAction` movement variants.
- `packages/game/lib/core/types.ts` — current `Enemy`, `Player`, `CanvasSize`, and `GameState` declarations to evolve.
- `packages/game/lib/core/constants.ts` — existing numeric constants and entity size constants to replace or retire.
- `packages/game/lib/state/create-initial-state.ts` — deterministic ID creation and fixed initial actor placement pattern.
- `packages/game/lib/state/update-player.ts` — current player reducer and `playerMoved` flag ownership.
- `packages/game/lib/state/update-enemies.ts` — current tick-only enemy reducer.
- `packages/game/lib/state/move-enemy-toward-player.ts` — current chase helper to replace with grid-cell chase.
- `packages/game/lib/state/advance-game-state.ts` — current action ordering and frame-index increment path.
- `packages/game/lib/state/replay-fixture.ts` — current replay version parsing and typed errors.
- `packages/game/lib/state/run-replay.ts` — deterministic replay driver.
- `packages/game/lib/render/project-render-commands.ts` — existing pure render projection.
- `packages/game/lib/effects/execute-render-command.ts` — existing Canvas executor for projected rectangles.
- `packages/game/tests/fixtures/canonical-replay.json` — fixture to update to version 3 semantics.
- `packages/game/tests/snapshots/canonical-replay.json` — final-state baseline to update after replay changes.

## Test Strategy

- Unit tests for `grid.ts` cover cell equality, movement deltas, and board bounds.
- Unit tests for `occupancy.ts` cover enemy occupancy, player occupancy, and actor occupancy.
- Unit tests for `update-player.ts` cover empty destination, board-edge block, enemy-cell block, and `playerMoved` values.
- Unit tests for `move-enemy-toward-player.ts` cover horizontal priority, vertical priority, tie priority, and already-overlapping defensive input.
- Unit tests for `update-enemies.ts` cover player blocking, enemy blocking, same-destination priority, no fallback pathing, and `spawnOrder` ordering.
- Property tests assert every actor remains inside board bounds after arbitrary movement sequences.
- Property tests assert all occupied cells are unique after arbitrary movement sequences.
- Replay fixture tests reject old state versions instead of migrating old pixel-position states.
- Replay tests update the canonical fixture to include one blocked player move and one blocked enemy move.
- Render projection tests assert grid cells produce deterministic pixel rectangles.

## Acceptance

- Player and enemy gameplay positions are represented as grid cells in `GameState`.
- The board is a stable `7x7` topology independent of canvas dimensions.
- No state transition can produce overlapping player/enemy cells from a valid non-overlapping state.
- Blocked player moves do not advance enemy movement.
- Enemies move one deterministic orthogonal cell by `spawnOrder` and stay put when blocked.
- Render commands derive pixel rectangles from grid cells and canvas size.
- Replay fixture parsing and replay snapshots use `stateVersion: 3`.
- `pnpm run ok` passes after implementation.
