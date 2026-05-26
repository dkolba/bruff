import * as assert from "node:assert/strict";

import {
  createTextInput,
  isCliEntryPoint,
  type ProcessTextInput,
  runBruffCli,
  runBruffCliWithProcess,
  type TextInput,
  type TextInputChunk,
} from "./bruff-cli.ts";
import { pathToFileURL } from "node:url";
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

type FakeProcessInput = ProcessTextInput &
  Readonly<{
    eventLog: () => ReadonlyArray<string>;
    rawModes: () => ReadonlyArray<boolean>;
  }>;

const ignoreInput = (chunk: TextInputChunk): void => {
  chunk.toString();
};

const createFakeInput = (isTTY: boolean, supportsRawMode = true): FakeInput => {
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
    setRawMode: supportsRawMode
      ? (enabled: boolean): TextInput => {
          rawModeLog.push(enabled);
          return input;
        }
      : undefined,
  };

  return input;
};

const createFakeProcessInput = (
  isTTY: boolean | undefined,
  supportsRawMode = true,
): FakeProcessInput => {
  const eventLog: Array<string> = [];
  const rawModeLog: Array<boolean> = [];

  const processInput: FakeProcessInput = {
    eventLog: (): ReadonlyArray<string> => eventLog,
    isTTY,
    off: (eventName: "data"): unknown => {
      eventLog.push(`off:${eventName}`);
      return undefined;
    },
    on: (eventName: "data"): unknown => {
      eventLog.push(`on:${eventName}`);
      return undefined;
    },
    pause: (): unknown => {
      eventLog.push("pause");
      return undefined;
    },
    rawModes: (): ReadonlyArray<boolean> => rawModeLog,
    resume: (): unknown => {
      eventLog.push("resume");
      return undefined;
    },
    setRawMode: supportsRawMode
      ? (enabled: boolean): unknown => {
          rawModeLog.push(enabled);
          return undefined;
        }
      : undefined,
  };

  return processInput;
};

test("wraps process-like input behind the text input port", (): void => {
  const processInput = createFakeProcessInput(true);
  const textInput = createTextInput(processInput);

  assert.equal(textInput.resume(), textInput);
  assert.equal(textInput.on("data", ignoreInput), textInput);
  assert.equal(textInput.setRawMode?.(true), textInput);
  assert.equal(textInput.off("data", ignoreInput), textInput);
  assert.equal(textInput.pause(), textInput);
  assert.deepEqual(processInput.rawModes(), [true]);
  assert.deepEqual(processInput.eventLog(), [
    "resume",
    "on:data",
    "off:data",
    "pause",
  ]);
});

test("skips adapted process raw mode when it is unavailable", (): void => {
  const lineInput = createFakeProcessInput(false);
  const missingRawInput = createFakeProcessInput(true, false);

  createTextInput(lineInput).setRawMode?.(true);
  createTextInput(missingRawInput).setRawMode?.(true);

  assert.deepEqual(lineInput.rawModes(), []);
  assert.deepEqual(missingRawInput.rawModes(), []);
});

test("detects whether the CLI module is the process entrypoint", (): void => {
  const entryPath = "/tmp/bruff-cli.ts";
  const moduleUrl = pathToFileURL(entryPath).href;

  assert.equal(isCliEntryPoint(["node", entryPath], moduleUrl), true);
  assert.equal(isCliEntryPoint(["node", "/tmp/other.ts"], moduleUrl), false);
  assert.equal(isCliEntryPoint(["node"], moduleUrl), false);
});

test("renders through process-like ports", (): void => {
  const input = createFakeProcessInput(true);
  const writer: TextWriter = {
    write: (): boolean => true,
  };

  assert.deepEqual(runBruffCliWithProcess({ input, writer }), { type: "ok" });
  assert.deepEqual(input.rawModes(), [true]);
  assert.deepEqual(input.eventLog(), ["resume", "on:data"]);
});

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
