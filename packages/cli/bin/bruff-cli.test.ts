import * as assert from "node:assert/strict";

import {
  runBruffCli,
  type TextInput,
  type TextInputChunk,
} from "./bruff-cli.ts";
import { test } from "node:test";
import type { TextWriter } from "../module/write-frame.ts";

const ansiCursorPrefix = "\u001B[2;3H";
const ansiClearPrefix = "\u001B[2J";
const ansiForegroundPrefix = "\u001B[38;2;";
const ansiBackgroundPrefix = "\u001B[48;2;";
const ansiResetSuffix = "\u001B[0m";
const controlCShortcut = "\u0003";
const expectedSingleWrite = 1;

type FakeInput = TextInput &
  Readonly<{
    emit: (chunk: TextInputChunk) => void;
    hasListener: () => boolean;
    isPaused: () => boolean;
    rawModes: () => ReadonlyArray<boolean>;
  }>;

const ignoreInput = (chunk: TextInputChunk): void => {
  chunk.toString();
};

const createFakeInput = (isTTY: boolean): FakeInput => {
  const rawModeLog: Array<boolean> = [];
  let dataListener: (chunk: TextInputChunk) => void = ignoreInput;
  let paused = true;

  const input: FakeInput = {
    emit: (chunk: TextInputChunk): void => {
      dataListener(chunk);
    },
    hasListener: (): boolean => dataListener !== ignoreInput,
    isPaused: (): boolean => paused,
    isTTY,
    off: (
      _eventName: "data",
      listener: (chunk: TextInputChunk) => void,
    ): TextInput => {
      if (dataListener === listener) {
        dataListener = ignoreInput;
      }

      return input;
    },
    on: (
      _eventName: "data",
      listener: (chunk: TextInputChunk) => void,
    ): TextInput => {
      dataListener = listener;
      return input;
    },
    pause: (): TextInput => {
      paused = true;
      return input;
    },
    rawModes: (): ReadonlyArray<boolean> => rawModeLog,
    resume: (): TextInput => {
      paused = false;
      return input;
    },
    setRawMode: (enabled: boolean): TextInput => {
      rawModeLog.push(enabled);
      return input;
    },
  };

  return input;
};

test("renders the mock scene through an injected writer", (): void => {
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
  assert.equal(writtenTexts.join("").includes(ansiCursorPrefix), true);
  assert.equal(writtenTexts.join("").includes(ansiForegroundPrefix), true);
  assert.equal(writtenTexts.join("").includes(ansiBackgroundPrefix), true);
  assert.equal(writtenTexts.join("").endsWith(ansiResetSuffix), true);
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

  input.emit("q");

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

test("writes the scene once while waiting for input", (): void => {
  const input = createFakeInput(true);
  const writtenTexts: Array<string> = [];
  const writer: TextWriter = {
    write: (text: string): boolean => {
      writtenTexts.push(text);
      return true;
    },
  };

  assert.deepEqual(runBruffCli({ input, writer }), { type: "ok" });
  input.emit(controlCShortcut);

  assert.equal(writtenTexts.length, expectedSingleWrite);
});
