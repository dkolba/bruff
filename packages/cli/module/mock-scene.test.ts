import * as assert from "node:assert/strict";

import { ASCII, RUNIC } from "@bruff/glyph";

import { createMockTerminalFrame } from "./mock-scene.ts";
import type { TerminalColor } from "./terminal-cell.ts";
import { test } from "node:test";

const colorKey = (color: TerminalColor): string =>
  `${color.red},${color.green},${color.blue}`;

const countDistinctColors = (colors: ReadonlyArray<TerminalColor>): number =>
  new Set(colors.map((color) => colorKey(color))).size;

const distinctColorKeys = (
  colors: ReadonlyArray<TerminalColor>,
): ReadonlyArray<string> => [
  ...new Set(colors.map((color) => colorKey(color))),
];

const expectedBackgroundColorKeys = ["24,24,24", "40,40,40", "72,28,20"];

const expectedForegroundColorKeys = [
  "230,230,230",
  "150,150,150",
  "255,210,64",
  "255,90,80",
  "120,120,180",
];

test("creates a deterministic scene using glyph catalog characters", (): void => {
  const frame = createMockTerminalFrame();

  assert.deepEqual(
    frame.cells.map((cell) => cell.glyph),
    [ASCII.AT, ASCII.HASH, ASCII.DOLLAR, ASCII.CARET, RUNIC.FEHU],
  );
});

test("creates a scene with multiple foreground and background colors", (): void => {
  const frame = createMockTerminalFrame();

  assert.deepEqual(
    distinctColorKeys(frame.cells.map((cell) => cell.foregroundColor)),
    expectedForegroundColorKeys,
  );
  assert.deepEqual(
    distinctColorKeys(frame.cells.map((cell) => cell.backgroundColor)),
    expectedBackgroundColorKeys,
  );
  assert.equal(
    countDistinctColors(frame.cells.map((cell) => cell.foregroundColor)),
    frame.cells.length,
  );
});
