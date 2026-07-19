/** Truecolor terminal color channel values. */
export type TerminalColor = Readonly<{
  /** Blue channel from 0 to 255. */
  blue: number;
  /** Green channel from 0 to 255. */
  green: number;
  /** Red channel from 0 to 255. */
  red: number;
}>;

/** One-based terminal cursor position. */
export type TerminalPosition = Readonly<{
  /** One-based terminal column. */
  column: number;
  /** One-based terminal row. */
  row: number;
}>;

/** A single positioned text cell in a terminal frame. */
export type TerminalCell = Readonly<{
  /** Cell background color. */
  backgroundColor: TerminalColor;
  /** Cell foreground color. */
  foregroundColor: TerminalColor;
  /** Text glyph written at the cell position. */
  glyph: string;
  /** Cell cursor position. */
  position: TerminalPosition;
}>;

/** A complete terminal frame expressed as positioned cells. */
export type TerminalFrame = Readonly<{
  /** Cells to render. */
  cells: ReadonlyArray<TerminalCell>;
}>;
