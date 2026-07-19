import type { Brand, PrngState } from "@bruff/utils";

import type { InputAction } from "./actions.ts";

/**
Branded identifier for {@link Enemy} entities.
Generated deterministically by the seeded PRNG — never construct directly.
*/
export type EnemyId = Brand<string, "EnemyId">;

/**
Branded identifier for the {@link Player} entity.
Generated deterministically by the seeded PRNG — never construct directly.
*/
export type PlayerId = Brand<string, "PlayerId">;

/** A discrete board cell used by gameplay movement and occupancy. */
export type GridCell = Readonly<{
  column: number;
  row: number;
}>;

/** Stable tactical board dimensions measured in cells. */
export type Board = Readonly<{
  columns: number;
  rows: number;
}>;

/** A single enemy unit on the game board. */
export type Enemy = Readonly<{
  cell: GridCell;
  id: EnemyId;
  size: number;
  spawnOrder: number;
}>;

/** The player-controlled entity. */
export type Player = Readonly<{
  cell: GridCell;
  id: PlayerId;
  size: number;
}>;

/** Canvas dimensions in pixels. */
export type CanvasSize = Readonly<{
  height: number;
  width: number;
}>;

/** Complete immutable snapshot of all game data for one tick. */
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
