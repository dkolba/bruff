import type { CanvasSize, Enemy, GridCell, Player } from "../core/types.js";
import { ENEMY_SIZE, ENEMY_SPEED, ONE, ZERO } from "../core/constants.js";
import { clamp } from "@bruff/utils";

const fallbackCell: GridCell = { column: ZERO, row: ZERO };

const signedStep = (distance: number): number => Math.sign(distance) * ONE;

/**
 * Chooses the next orthogonal grid cell for an enemy moving toward the player.
 *
 * @param enemy - Enemy that is choosing a destination
 * @param player - Player to move toward
 * @returns Candidate destination cell
 */
export const nextEnemyCellTowardPlayer = (
  enemy: Enemy,
  player: Player,
): GridCell => {
  const enemyCell = enemy.cell ?? fallbackCell;
  if (player.cell === undefined) {
    return enemyCell;
  }

  const columnDistance = player.cell.column - enemyCell.column;
  const rowDistance = player.cell.row - enemyCell.row;

  if (columnDistance === ZERO && rowDistance === ZERO) {
    return enemyCell;
  }

  return Math.abs(columnDistance) >= Math.abs(rowDistance)
    ? { ...enemyCell, column: enemyCell.column + signedStep(columnDistance) }
    : { ...enemyCell, row: enemyCell.row + signedStep(rowDistance) };
};

/**
 * Moves an enemy one step toward the player, clamped within canvas bounds.
 *
 * @param enemy - The enemy entity to move
 * @param player - The player entity to move toward
 * @param canvas - The canvas dimensions used for boundary clamping
 * @returns A new enemy object with updated position
 */
export const moveEnemyTowardPlayer = (
  enemy: Enemy,
  player: Player,
  canvas: CanvasSize,
): Enemy => {
  const dx = player.xPos - enemy.xPos;
  const dy = player.yPos - enemy.yPos;
  const distribution = Math.hypot(dx, dy);

  // Hitting negative zero "-0" would be a meaningless test
  /* c8 ignore next */
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
