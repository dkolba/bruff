import * as assert from "node:assert/strict";
import { test } from "node:test";

import type { TerminalFrame } from "./terminal-cell.ts";
import { type TextWriter, writeTerminalFrame } from "./write-frame.ts";

const frame: TerminalFrame = {
  cells: [
    {
      backgroundColor: { blue: 6, green: 5, red: 4 },
      foregroundColor: { blue: 3, green: 2, red: 1 },
      glyph: "@",
      position: { column: 2, row: 1 },
    },
  ],
};

test("writes encoded frame text to the injected writer", (): void => {
  const writtenTexts: Array<string> = [];
  const writer: TextWriter = {
    write: (text: string): boolean => {
      writtenTexts.push(text);
      return true;
    },
  };

  assert.deepEqual(writeTerminalFrame(writer, frame), { type: "ok" });
  assert.deepEqual(writtenTexts, [
    "\u001B[2J\u001B[1;2H\u001B[38;2;1;2;3m\u001B[48;2;4;5;6m@\u001B[3;1H\u001B[0m",
  ]);
});

test("returns a write-failed error when the writer returns false", (): void => {
  const writer: TextWriter = {
    write: (): boolean => false,
  };

  assert.deepEqual(writeTerminalFrame(writer, frame), {
    reason: "write-failed",
    type: "error",
  });
});

test("returns a write-threw error when the writer throws", (): void => {
  const writer: TextWriter = {
    write: (): boolean => {
      throw new Error("writer failed");
    },
  };

  assert.deepEqual(writeTerminalFrame(writer, frame), {
    reason: "write-threw",
    type: "error",
  });
});
