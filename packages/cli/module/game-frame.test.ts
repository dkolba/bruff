import * as assert from "node:assert/strict";

import { ASCII } from "@bruff/glyph";
import { gameFrameToTerminalFrame } from "./game-frame.ts";
import type { HeadlessFrame } from "@bruff/game/headless";
import { test } from "node:test";

const testFrame: HeadlessFrame = {
  board: { columns: 7, rows: 7 },
  cells: [
    { cell: { column: 2, row: 1 }, entity: "player" },
    { cell: { column: 4, row: 3 }, entity: "enemy" },
  ],
  frameIndex: 3,
};

test("converts headless player and enemy cells into terminal cells", (): void => {
  assert.deepEqual(gameFrameToTerminalFrame(testFrame), {
    cells: [
      {
        backgroundColor: { blue: 24, green: 24, red: 24 },
        foregroundColor: { blue: 230, green: 230, red: 230 },
        glyph: ASCII.AT,
        position: { column: 3, row: 2 },
      },
      {
        backgroundColor: { blue: 24, green: 24, red: 24 },
        foregroundColor: { blue: 80, green: 80, red: 220 },
        glyph: ASCII.e,
        position: { column: 5, row: 4 },
      },
    ],
  });
});
