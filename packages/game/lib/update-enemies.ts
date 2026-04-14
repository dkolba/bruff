import type { GameState } from "../types/game-state-type.ts";
import { moveEnemyTowardPlayer } from "./move-enemy-toward-player.js";

/**
 * Updates all enemies in the game state by moving each one toward the player.
 *
 * @param state - The current game state
 * @returns A new game state with all enemy positions updated
 */
export const updateEnemies = (state: GameState) => {
  const { player, enemies, canvas } = state;

  const updatedEnemies = enemies.map((enemy) =>
    moveEnemyTowardPlayer(enemy, player, canvas),
  );

  return {
    ...state,
    enemies: updatedEnemies,
  };
};
