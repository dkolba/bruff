import * as assert from "node:assert/strict";

import { createFakeInput } from "./bruff-cli-test-helpers.ts";
import { runBruffCli } from "./bruff-cli.ts";
import { test } from "node:test";
import type { TextWriter } from "../module/write-frame.ts";

const initialPlayerCursor = "\u001B[4;4H";
const movedPlayerCursor = "\u001B[4;5H";
const ansiClearPrefix = "\u001B[2J";
const ansiForegroundPrefix = "\u001B[38;2;";
const ansiBackgroundPrefix = "\u001B[48;2;";
const ansiResetSuffix = "\u001B[0m";
const controlCShortcut = "\u0003";
const initialFrameWriteIndex = 0;
const movedFrameWriteIndex = 1;
const expectedMovementWriteCount = 2;

test("uses resumed line input when raw mode is unsupported on a tty", (): void => {
  const input = createFakeInput(true, false);
  const writer: TextWriter = {
    write: (): boolean => true,
  };

  assert.deepEqual(runBruffCli({ input, writer }), { type: "ok" });
  assert.deepEqual(input.rawModes(), []);
  assert.equal(input.hasListener(), true);
  assert.equal(input.isPaused(), false);

  input.emit("q");

  assert.deepEqual(input.rawModes(), []);
  assert.equal(input.hasListener(), false);
  assert.equal(input.isPaused(), true);
});

test("keeps terminal input active for ordinary keys", (): void => {
  const input = createFakeInput(true);
  const writer: TextWriter = {
    write: (): boolean => true,
  };

  assert.deepEqual(runBruffCli({ input, writer }), { type: "ok" });
  input.emit("x");

  assert.deepEqual(input.rawModes(), [true]);
  assert.equal(input.hasListener(), true);
  assert.equal(input.isPaused(), false);
});

test("renders the game scene through an injected writer", (): void => {
  const input = createFakeInput(true);
  const writtenTexts: Array<string> = [];
  const writer: TextWriter = {
    write: (text: string): boolean => {
      writtenTexts.push(text);
      return true;
    },
  };

  assert.deepEqual(runBruffCli({ input, writer }), { type: "ok" });
  assert.deepEqual(writtenTexts, [writtenTexts.join("")]);
  assert.equal(writtenTexts.join("").startsWith(ansiClearPrefix), true);
  assert.equal(writtenTexts.join("").includes(initialPlayerCursor), true);
  assert.equal(writtenTexts.join("").includes(ansiForegroundPrefix), true);
  assert.equal(writtenTexts.join("").includes(ansiBackgroundPrefix), true);
  assert.equal(writtenTexts.join("").endsWith(ansiResetSuffix), true);
});

test("normalises terminal arrow input and writes the next game frame", (): void => {
  const input = createFakeInput(true);
  const writtenTexts: Array<string> = [];
  const writer: TextWriter = {
    write: (text: string): boolean => {
      writtenTexts.push(text);
      return writtenTexts.length < expectedMovementWriteCount;
    },
  };

  assert.deepEqual(runBruffCli({ input, writer }), { type: "ok" });
  input.emit("\u001B[C");

  assert.equal(writtenTexts.length, expectedMovementWriteCount);
  assert.equal(
    writtenTexts[initialFrameWriteIndex]?.includes(initialPlayerCursor),
    true,
  );
  assert.equal(
    writtenTexts[movedFrameWriteIndex]?.includes(movedPlayerCursor),
    true,
  );
  assert.deepEqual(
    [input.rawModes(), input.hasListener(), input.isPaused()],
    [[true, false], false, true],
  );
});

test("waits for a quit shortcut before releasing terminal input", (): void => {
  const input = createFakeInput(true);
  const writer: TextWriter = {
    write: (): boolean => true,
  };

  assert.deepEqual(runBruffCli({ input, writer }), { type: "ok" });
  assert.deepEqual(input.rawModes(), [true]);
  assert.equal(input.hasListener(), true);
  assert.equal(input.isPaused(), false);

  input.emit(controlCShortcut);

  assert.deepEqual(input.rawModes(), [true, false]);
  assert.equal(input.hasListener(), false);
  assert.equal(input.isPaused(), true);
});

test("does not wait for input when rendering fails", (): void => {
  const input = createFakeInput(true);
  const writer: TextWriter = {
    write: (): boolean => false,
  };

  assert.deepEqual(runBruffCli({ input, writer }), {
    reason: "write-failed",
    type: "error",
  });
  assert.deepEqual(input.rawModes(), []);
  assert.equal(input.hasListener(), false);
  assert.equal(input.isPaused(), true);
});

test("uses resumed line input when raw mode is unavailable", (): void => {
  const input = createFakeInput(false);
  const writer: TextWriter = {
    write: (): boolean => true,
  };

  assert.deepEqual(runBruffCli({ input, writer }), { type: "ok" });
  assert.deepEqual(input.rawModes(), []);
  assert.equal(input.hasListener(), true);
  assert.equal(input.isPaused(), false);

  input.emit("Q");

  assert.deepEqual(input.rawModes(), []);
  assert.equal(input.hasListener(), false);
  assert.equal(input.isPaused(), true);
});
