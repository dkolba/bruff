import type { Board, GridCell } from "../core/types.ts";
import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  ONE,
  TWO,
  ZERO,
} from "../core/constants.js";
import { cellForAction, cellsEqual, isCellInsideBoard } from "./grid.js";
import { describe, expect, it } from "vitest";
import type { InputAction } from "../core/actions.ts";

const TEST_BOARD: Board = { columns: BOARD_COLUMNS, rows: BOARD_ROWS };
const CENTER_CELL: GridCell = { column: TWO + ONE, row: TWO + ONE };

type MovementCase = Readonly<{
  action: InputAction;
  expected: GridCell;
  name: string;
}>;

const MOVEMENT_CASES: ReadonlyArray<MovementCase> = [
  {
    action: { type: "move-down" },
    expected: { column: CENTER_CELL.column, row: CENTER_CELL.row + ONE },
    name: "down",
  },
  {
    action: { type: "move-left" },
    expected: { column: CENTER_CELL.column - ONE, row: CENTER_CELL.row },
    name: "left",
  },
  {
    action: { type: "move-right" },
    expected: { column: CENTER_CELL.column + ONE, row: CENTER_CELL.row },
    name: "right",
  },
  {
    action: { type: "move-up" },
    expected: { column: CENTER_CELL.column, row: CENTER_CELL.row - ONE },
    name: "up",
  },
];

describe("cellForAction", () => {
  it.each(MOVEMENT_CASES)("moves one cell $name", ({ action, expected }) => {
    expect(cellForAction(CENTER_CELL, action)).toStrictEqual(expected);
  });
});

describe("cellsEqual", () => {
  it("returns true for matching coordinates", () => {
    expect(cellsEqual(CENTER_CELL, { ...CENTER_CELL })).toBe(true);
  });

  it("returns false for different coordinates", () => {
    expect(
      cellsEqual(CENTER_CELL, { column: CENTER_CELL.column, row: ZERO }),
    ).toBe(false);
  });
});

describe("isCellInsideBoard", () => {
  it("returns true for cells inside the board", () => {
    expect(isCellInsideBoard({ column: ZERO, row: ZERO }, TEST_BOARD)).toBe(
      true,
    );
  });

  it("returns false for cells outside the board", () => {
    expect(
      isCellInsideBoard({ column: TEST_BOARD.columns, row: ZERO }, TEST_BOARD),
    ).toBe(false);
  });
});
