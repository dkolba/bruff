import type { Brand } from "@bruff/utils";

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

export type Enemy = {
  xPos: number;
  yPos: number;
  size: number;
};

export type Player = {
  size: number;
  yPos: number;
  xPos: number;
};

export type CanvasSize = {
  width: number;
  height: number;
};

export type GameState = {
  input: string[];
  canvas: CanvasSize;
  player: Player;
  enemies: Enemy[];
  playerMoved: boolean;
};
