/* node:coverage ignore next 2 */
import type { AnsiCommand } from "./ansi.ts";
import type { TerminalCell, TerminalFrame } from "./terminal-cell.ts";

const emptyFrameCursorRow = 1;
const firstTerminalColumn = 1;
const promptRowPadding = 2;

const getPromptPosition = (frame: TerminalFrame): TerminalCell["position"] => ({
  column: firstTerminalColumn,
  row: Math.max(
    emptyFrameCursorRow,
    ...frame.cells.map((cell) => cell.position.row + promptRowPadding),
  ),
});

const renderTerminalCell = (cell: TerminalCell): ReadonlyArray<AnsiCommand> => [
  { position: cell.position, type: "cursor-move" },
  { color: cell.foregroundColor, type: "set-foreground" },
  { color: cell.backgroundColor, type: "set-background" },
  { glyph: cell.glyph, type: "write-glyph" },
];

/**
Convert a terminal frame into ANSI commands.
*/
export const renderTerminalFrame = (
  frame: TerminalFrame,
): ReadonlyArray<AnsiCommand> => [
  { type: "clear-screen" },
  ...frame.cells.flatMap((cell) => renderTerminalCell(cell)),
  { position: getPromptPosition(frame), type: "cursor-move" },
  { type: "reset-style" },
];
