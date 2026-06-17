import * as assert from "node:assert/strict";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

import type { TextWriter } from "../module/write-frame.ts";
import { isCliEntryPoint, runBruffCliWithProcess } from "./bruff-cli.ts";
import { createFakeProcessInput } from "./bruff-cli-test-helpers.ts";

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
