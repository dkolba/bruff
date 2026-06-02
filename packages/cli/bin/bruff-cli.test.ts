import * as assert from "node:assert/strict";

import {
  createFakeProcessInput,
  ignoreInput,
} from "./bruff-cli-test-helpers.ts";
import { createTextInput } from "./bruff-cli.ts";
import { test } from "node:test";

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

test("does not set process raw mode for non-tty input", (): void => {
  const processInput = createFakeProcessInput(false);
  const textInput = createTextInput(processInput);

  assert.equal(textInput.setRawMode?.(true), textInput);
  assert.deepEqual(processInput.rawModes(), []);
});
