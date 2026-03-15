import type { GameState } from "../types/game-state-type.ts";
import { moveEnemyTowardPlayer } from "./move-enemy-toward-player.js";

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
