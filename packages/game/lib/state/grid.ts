import type { Board, GridCell } from "../core/types.ts";
import { ONE, ZERO } from "../core/constants.js";
import type { InputAction } from "../core/actions.ts";

/**
 * Computes the adjacent cell targeted by a movement action.
 *
 * @param cell - Starting cell
 * @param action - Movement action to apply
 * @returns The candidate destination cell
 */
export const cellForAction = (
  cell: GridCell,
  action: InputAction,
): GridCell => {
  switch (action.type) {
    case "move-down": {
      return { ...cell, row: cell.row + ONE };
    }
    case "move-left": {
      return { ...cell, column: cell.column - ONE };
    }
    case "move-right": {
      return { ...cell, column: cell.column + ONE };
    }
    case "move-up": {
      return { ...cell, row: cell.row - ONE };
    }
    /* c8 ignore start -- unreachable per action union exhaustiveness */
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
    /* c8 ignore stop */
  }
};

/**
 * Compares two board cells.
 *
 * @param left - First cell
 * @param right - Second cell
 * @returns Whether both cells name the same board coordinate
 */
export const cellsEqual = (left: GridCell, right: GridCell): boolean =>
  left.column === right.column && left.row === right.row;

/**
 * Checks whether a cell is inside a board.
 *
 * @param cell - Cell to check
 * @param board - Board dimensions
 * @returns Whether the cell is inside the board
 */
export const isCellInsideBoard = (cell: GridCell, board: Board): boolean =>
  cell.column >= ZERO &&
  cell.row >= ZERO &&
  cell.column < board.columns &&
  cell.row < board.rows;
