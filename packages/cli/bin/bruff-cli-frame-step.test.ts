import * as assert from "node:assert/strict";

import { createFakeInput, type FakeInput } from "./bruff-cli-test-helpers.ts";
import { runBruffCli } from "./bruff-cli.ts";
import { test } from "node:test";
import type { TextWriter } from "../module/write-frame.ts";

const initialPlayerCursor = "\u001B[4;4H";
const expectedInitialWriteCount = 1;

type CliProbe = Readonly<{
  input: FakeInput;
  texts: () => ReadonlyArray<string>;
  writer: TextWriter;
}>;

const createCliProbe = (): CliProbe => {
  const writtenTexts: Array<string> = [];

  return {
    input: createFakeInput(true),
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
