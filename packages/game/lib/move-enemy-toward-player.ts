import type { CanvasSize, Enemy, Player } from "../types/game-state-type.js";
import { ENEMY_SIZE, ENEMY_SPEED, ZERO } from "./constants.js";
import clamp from "./helpers/clamp.js";

export const moveEnemyTowardPlayer = (
  enemy: Enemy,
  player: Player,
  canvas: CanvasSize,
) => {
  const dx = player.xPos - enemy.xPos;
  const dy = player.yPos - enemy.yPos;
  const distribution = Math.hypot(dx, dy);

  if (distribution === ZERO) {
    return { ...enemy };
  }

  const moveX = (dx / distribution) * ENEMY_SPEED;
  const moveY = (dy / distribution) * ENEMY_SPEED;

  return {
    ...enemy,
    xPos: clamp(enemy.xPos + moveX, ZERO, canvas.width - ENEMY_SIZE),
    yPos: clamp(enemy.yPos + moveY, ZERO, canvas.height - ENEMY_SIZE),
  };
};
