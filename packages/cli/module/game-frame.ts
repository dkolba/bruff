/* node:coverage ignore next 10 */
import type {
  HeadlessFrame,
  HeadlessFrameCell,
  HeadlessFrameEntity,
} from "@bruff/game/headless";
import { ASCII } from "@bruff/glyph";

import type {
  TerminalCell,
  TerminalColor,
  TerminalFrame,
} from "./terminal-cell.ts";

const terminalIndexOffset = 1;
const floorBackground = { blue: 24, green: 24, red: 24 };
const foregroundColors: Readonly<Record<HeadlessFrameEntity, TerminalColor>> = {
  enemy: { blue: 80, green: 80, red: 220 },
  player: { blue: 230, green: 230, red: 230 },
};
const glyphs: Readonly<Record<HeadlessFrameEntity, string>> = {
  enemy: ASCII.e,
  player: ASCII.AT,
};

const terminalCellForGameCell = (cell: HeadlessFrameCell): TerminalCell => ({
  backgroundColor: floorBackground,
  foregroundColor: foregroundColors[cell.entity],
  glyph: glyphs[cell.entity],
  position: {
    column: cell.cell.column + terminalIndexOffset,
    row: cell.cell.row + terminalIndexOffset,
  },
});

/**
 * Convert DOM-free game frame cells into positioned terminal cells.
 */
export const gameFrameToTerminalFrame = (
  frame: HeadlessFrame,
): TerminalFrame => ({
  cells: frame.cells.map((cell) => terminalCellForGameCell(cell)),
});
