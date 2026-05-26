import { ASCII, RUNIC } from "@bruff/glyph";

import type { TerminalFrame } from "./terminal-cell.ts";

/**
 * Create the deterministic mock frame used by the terminal renderer spike.
 */
export const createMockTerminalFrame = (): TerminalFrame => ({
  cells: [
    {
      backgroundColor: { blue: 24, green: 24, red: 24 },
      foregroundColor: { blue: 230, green: 230, red: 230 },
      glyph: ASCII.AT,
      position: { column: 3, row: 2 },
    },
    {
      backgroundColor: { blue: 40, green: 40, red: 40 },
      foregroundColor: { blue: 150, green: 150, red: 150 },
      glyph: ASCII.HASH,
      position: { column: 4, row: 2 },
    },
    {
      backgroundColor: { blue: 24, green: 24, red: 24 },
      foregroundColor: { blue: 64, green: 210, red: 255 },
      glyph: ASCII.DOLLAR,
      position: { column: 5, row: 2 },
    },
    {
      backgroundColor: { blue: 20, green: 28, red: 72 },
      foregroundColor: { blue: 80, green: 90, red: 255 },
      glyph: ASCII.CARET,
      position: { column: 3, row: 3 },
    },
    {
      backgroundColor: { blue: 24, green: 24, red: 24 },
      foregroundColor: { blue: 180, green: 120, red: 120 },
      glyph: RUNIC.FEHU,
      position: { column: 5, row: 3 },
    },
  ],
});
