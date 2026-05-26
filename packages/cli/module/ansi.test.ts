import * as assert from "node:assert/strict";

import { encodeAnsiCommand, encodeAnsiCommands } from "./ansi.ts";
import { test } from "node:test";

test("encodes screen clearing", (): void => {
  assert.equal(encodeAnsiCommand({ type: "clear-screen" }), "\u001B[2J");
});

test("encodes cursor movement with row and column", (): void => {
  assert.equal(
    encodeAnsiCommand({
      position: { column: 7, row: 3 },
      type: "cursor-move",
    }),
    "\u001B[3;7H",
  );
});

test("encodes truecolor foreground colors", (): void => {
  assert.equal(
    encodeAnsiCommand({
      color: { blue: 56, green: 34, red: 12 },
      type: "set-foreground",
    }),
    "\u001B[38;2;12;34;56m",
  );
});

test("encodes truecolor background colors", (): void => {
  assert.equal(
    encodeAnsiCommand({
      color: { blue: 220, green: 160, red: 40 },
      type: "set-background",
    }),
    "\u001B[48;2;40;160;220m",
  );
});

test("encodes glyph writes without modifying the glyph", (): void => {
  assert.equal(
    encodeAnsiCommand({
      glyph: "ᚠ",
      type: "write-glyph",
    }),
    "ᚠ",
  );
});

test("encodes style reset", (): void => {
  assert.equal(encodeAnsiCommand({ type: "reset-style" }), "\u001B[0m");
});

test("encodes command sequences in order", (): void => {
  assert.equal(
    encodeAnsiCommands([
      { type: "clear-screen" },
      { position: { column: 2, row: 1 }, type: "cursor-move" },
      { color: { blue: 3, green: 2, red: 1 }, type: "set-foreground" },
      { glyph: "@", type: "write-glyph" },
      { type: "reset-style" },
    ]),
    "\u001B[2J\u001B[1;2H\u001B[38;2;1;2;3m@\u001B[0m",
  );
});
