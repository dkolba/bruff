import type { Brand, PrngState } from "@bruff/utils";

/**
 * Branded identifier for {@link Enemy} entities.
 * Generated deterministically by the seeded PRNG — never construct directly.
 */
export type EnemyId = Brand<string, "EnemyId">;

/**
 * Branded identifier for the {@link Player} entity.
 * Generated deterministically by the seeded PRNG — never construct directly.
 */
export type PlayerId = Brand<string, "PlayerId">;

/** A single enemy unit on the game board. */
export type Enemy = Readonly<{
  id: EnemyId;
  size: number;
  spawnOrder: number;
  xPos: number;
  yPos: number;
}>;

/** The player-controlled entity. */
export type Player = Readonly<{
  id: PlayerId;
  size: number;
  xPos: number;
  yPos: number;
}>;

/** Canvas dimensions in pixels. */
export type CanvasSize = Readonly<{
  height: number;
  width: number;
}>;

/** Complete immutable snapshot of all game data for one tick. */
export type GameState = Readonly<{
  canvas: CanvasSize;
  enemies: ReadonlyArray<Enemy>;
  input: string[];
  player: Player;
  playerMoved: boolean;
  prng: PrngState;
  stateVersion: number;
}>;
