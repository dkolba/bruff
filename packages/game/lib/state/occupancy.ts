import type { Enemy, GameState, GridCell } from "../core/types.ts";
import { cellsEqual } from "./grid.js";

/**
 * Checks whether any enemy occupies a cell.
 *
 * @param cell - Cell to query
 * @param enemies - Enemy list to inspect
 * @returns Whether an enemy currently occupies the cell
 */
export const isCellOccupiedByEnemy = (
  cell: GridCell,
  enemies: ReadonlyArray<Enemy>,
): boolean =>
  enemies.some((enemy) =>
    enemy.cell === undefined ? false : cellsEqual(enemy.cell, cell),
  );

/**
 * Checks whether the player or an enemy occupies a cell.
 *
 * @param cell - Cell to query
 * @param state - State snapshot to inspect
 * @returns Whether any actor currently occupies the cell
 */
export const isCellOccupiedByActor = (
  cell: GridCell,
  state: GameState,
): boolean =>
  (state.player.cell === undefined
    ? false
    : cellsEqual(state.player.cell, cell)) ||
  isCellOccupiedByEnemy(cell, state.enemies);
