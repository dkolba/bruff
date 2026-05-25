import type { Enemy, GridCell, Player } from "../core/types.js";
import { ONE, ZERO } from "../core/constants.js";

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
  const columnDistance = player.cell.column - enemy.cell.column;
  const rowDistance = player.cell.row - enemy.cell.row;

  if (columnDistance === ZERO && rowDistance === ZERO) {
    return enemy.cell;
  }

  return Math.abs(columnDistance) >= Math.abs(rowDistance)
    ? { ...enemy.cell, column: enemy.cell.column + signedStep(columnDistance) }
    : { ...enemy.cell, row: enemy.cell.row + signedStep(rowDistance) };
};
