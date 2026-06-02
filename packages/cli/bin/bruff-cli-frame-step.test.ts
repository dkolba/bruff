import * as assert from "node:assert/strict";

import {
  runBruffCli,
  type TextInput,
  type TextInputChunk,
} from "./bruff-cli.ts";
import { test } from "node:test";
import type { TextWriter } from "../module/write-frame.ts";

const initialPlayerCursor = "\u001B[4;4H";
const expectedInitialWriteCount = 1;

type FakeInput = TextInput &
  Readonly<{
    emit: (chunk: TextInputChunk) => void;
    hasListener: () => boolean;
    rawModes: () => ReadonlyArray<boolean>;
  }>;

type CliProbe = Readonly<{
  input: FakeInput;
  texts: () => ReadonlyArray<string>;
  writer: TextWriter;
}>;

const ignoreInput = (chunk: TextInputChunk): void => {
  chunk.toString();
};

const createFakeInput = (): FakeInput => {
  const rawModeLog: Array<boolean> = [];
  let dataListener: (chunk: TextInputChunk) => void = ignoreInput;

  const input: FakeInput = {
    emit: (chunk: TextInputChunk): void => {
      dataListener(chunk);
    },
    hasListener: (): boolean => dataListener !== ignoreInput,
    isTTY: true,
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
    pause: (): TextInput => input,
    rawModes: (): ReadonlyArray<boolean> => rawModeLog,
    resume: (): TextInput => input,
    setRawMode: (enabled: boolean): TextInput => {
      rawModeLog.push(enabled);
      return input;
    },
  };

  return input;
};

const createCliProbe = (): CliProbe => {
  const writtenTexts: Array<string> = [];

  return {
    input: createFakeInput(),
    texts: (): ReadonlyArray<string> => writtenTexts,
    writer: {
      write: (text: string): boolean => {
        writtenTexts.push(text);
        return true;
      },
    },
  };
};

test("does not redraw after quit shortcuts", (): void => {
  const probe = createCliProbe();

  assert.deepEqual(runBruffCli(probe), { type: "ok" });
  probe.input.emit("q");

  assert.equal(probe.texts().length, expectedInitialWriteCount);
  assert.deepEqual(probe.input.rawModes(), [true, false]);
  assert.equal(probe.input.hasListener(), false);
});

test("does not advance or redraw after invalid input", (): void => {
  const probe = createCliProbe();

  assert.deepEqual(runBruffCli(probe), { type: "ok" });
  probe.input.emit("?");
  const [initialText] = probe.texts();

  assert.equal(probe.texts().length, expectedInitialWriteCount);
  assert.equal(initialText?.includes(initialPlayerCursor), true);
  assert.equal(probe.input.hasListener(), true);
});
