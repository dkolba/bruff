import * as assert from "node:assert/strict";

import { renderTerminalFrame } from "./render-frame.ts";
import type { TerminalFrame } from "./terminal-cell.ts";
import { test } from "node:test";

test("renders cursor, colors, and glyph commands for each cell", (): void => {
  const frame: TerminalFrame = {
    cells: [
      {
        backgroundColor: { blue: 30, green: 20, red: 10 },
        foregroundColor: { blue: 3, green: 2, red: 1 },
        glyph: "@",
        position: { column: 4, row: 2 },
      },
    ],
  };

  assert.deepEqual(renderTerminalFrame(frame), [
    { type: "clear-screen" },
    { position: { column: 4, row: 2 }, type: "cursor-move" },
    { color: { blue: 3, green: 2, red: 1 }, type: "set-foreground" },
    { color: { blue: 30, green: 20, red: 10 }, type: "set-background" },
    { glyph: "@", type: "write-glyph" },
    { position: { column: 1, row: 4 }, type: "cursor-move" },
    { type: "reset-style" },
  ]);
});

test("renders cells in frame order with one final reset", (): void => {
  const frame: TerminalFrame = {
    cells: [
      {
        backgroundColor: { blue: 6, green: 5, red: 4 },
        foregroundColor: { blue: 3, green: 2, red: 1 },
        glyph: "#",
        position: { column: 1, row: 1 },
      },
      {
        backgroundColor: { blue: 12, green: 11, red: 10 },
        foregroundColor: { blue: 9, green: 8, red: 7 },
        glyph: "$",
        position: { column: 2, row: 1 },
      },
    ],
  };

  assert.deepEqual(renderTerminalFrame(frame), [
    { type: "clear-screen" },
    { position: { column: 1, row: 1 }, type: "cursor-move" },
    { color: { blue: 3, green: 2, red: 1 }, type: "set-foreground" },
    { color: { blue: 6, green: 5, red: 4 }, type: "set-background" },
    { glyph: "#", type: "write-glyph" },
    { position: { column: 2, row: 1 }, type: "cursor-move" },
    { color: { blue: 9, green: 8, red: 7 }, type: "set-foreground" },
    { color: { blue: 12, green: 11, red: 10 }, type: "set-background" },
    { glyph: "$", type: "write-glyph" },
    { position: { column: 1, row: 3 }, type: "cursor-move" },
    { type: "reset-style" },
  ]);
});

test("renders an empty frame as a style reset", (): void => {
  assert.deepEqual(renderTerminalFrame({ cells: [] }), [
    { type: "clear-screen" },
    { position: { column: 1, row: 1 }, type: "cursor-move" },
    { type: "reset-style" },
  ]);
});
