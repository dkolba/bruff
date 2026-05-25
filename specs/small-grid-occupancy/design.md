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
| `packages/game/lib/state/create-initial-state.ts`       | state   | Create non-overlapping initial grid state at version 2.                   |
| `packages/game/lib/state/migrations.ts`                 | state   | Migrate persisted version 1 state into version 2 grid state.              |
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
export const CURRENT_STATE_VERSION = 2;
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
  spawnOrder: number;
}>;

export type Player = Readonly<{
  cell: GridCell;
  id: PlayerId;
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

`cell` is the gameplay source of truth. Pixel coordinates and rectangle dimensions are derived in the render layer from `state.board` and `state.canvas`.

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

`nextEnemyCellTowardPlayer` returns the enemy's current cell when the enemy already shares the player cell in migrated or test-loaded data. Normal state transitions prevent that overlap.

```ts
// packages/game/lib/state/migrations.ts
export const migrateV1toV2: (state: GameStateV1) => GameState;
```

`GameStateV1` stays local to the migration module. Persisted state migration is pure and tested with representative version 1 data.

## Data Shape Changes

`GameState` gains `board`.

`Player` changes from pixel position plus size:

```ts
{
  (id, size, xPos, yPos);
}
```

to grid position:

```ts
{
  (cell, id);
}
```

`Enemy` changes from pixel position plus size:

```ts
{
  (id, size, spawnOrder, xPos, yPos);
}
```

to grid position:

```ts
{
  (cell, id, spawnOrder);
}
```

`stateVersion` increments from `1` to `2`. Replay fixtures and final-state snapshots are updated to version 2. Version 1 replay fixtures are not silently accepted as version 2 fixtures; persisted version 1 `GameState` values are migrated through `migrateV1toV2`.

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

- **Chosen: replace actor pixel fields with `cell`.** This makes occupancy unambiguous and keeps gameplay state independent from canvas size.
- **Alternative: keep `xPos` and `yPos` and snap them to grid multiples.** Rejected because pixel coordinates would remain the apparent source of truth, making occupancy checks depend on render geometry and canvas dimensions.
- **Alternative: store both `cell` and pixel fields.** Rejected because duplicated position data can drift and creates illegal states that the type model should avoid.

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

- **Chosen: add a pure `migrateV1toV2` and bump replay fixtures to version 2.** This follows the local migration workflow and keeps replay failures explicit.
- **Alternative: update `GameState` without a migration.** Rejected because version 1 snapshots and test-loaded states would silently change meaning.
- **Alternative: keep accepting version 1 replay fixtures directly.** Rejected because fixture inputs would replay under different movement semantics while claiming the old state version.

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
- `packages/game/tests/fixtures/canonical-replay.json` — fixture to update to version 2 semantics.
- `packages/game/tests/snapshots/canonical-replay.json` — final-state baseline to update after replay changes.

## Test Strategy

- Unit tests for `grid.ts` cover cell equality, movement deltas, and board bounds.
- Unit tests for `occupancy.ts` cover enemy occupancy, player occupancy, and actor occupancy.
- Unit tests for `update-player.ts` cover empty destination, board-edge block, enemy-cell block, and `playerMoved` values.
- Unit tests for `move-enemy-toward-player.ts` cover horizontal priority, vertical priority, tie priority, and already-overlapping defensive input.
- Unit tests for `update-enemies.ts` cover player blocking, enemy blocking, same-destination priority, no fallback pathing, and `spawnOrder` ordering.
- Property tests assert every actor remains inside board bounds after arbitrary movement sequences.
- Property tests assert all occupied cells are unique after arbitrary movement sequences.
- Migration tests cover representative version 1 pixel positions mapping to version 2 cells.
- Replay tests update the canonical fixture to include one blocked player move and one blocked enemy move.
- Render projection tests assert grid cells produce deterministic pixel rectangles.

## Acceptance

- Player and enemy gameplay positions are represented as grid cells in `GameState`.
- The board is a stable `7x7` topology independent of canvas dimensions.
- No state transition can produce overlapping player/enemy cells from a valid non-overlapping state.
- Blocked player moves do not advance enemy movement.
- Enemies move one deterministic orthogonal cell by `spawnOrder` and stay put when blocked.
- Render commands derive pixel rectangles from grid cells and canvas size.
- Replay fixture parsing, replay snapshots, and state migration use `stateVersion: 2`.
- `pnpm run ok` passes after implementation.
