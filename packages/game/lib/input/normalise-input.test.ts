import { isNone } from "@bruff/utils";
import { describe, expect, it } from "vitest";

import { normaliseKey } from "./normalise-input.js";

const KNOWN_KEYS = [
  { expected: "move-up", input: "ArrowUp" },
  { expected: "move-up", input: "\u001B[A" },
  { expected: "move-up", input: "arrowup" },
  { expected: "move-up", input: "w" },
  { expected: "move-up", input: "W" },
  { expected: "move-up", input: "north" },
  { expected: "move-down", input: "ArrowDown" },
  { expected: "move-down", input: "\u001B[B" },
  { expected: "move-down", input: "s" },
  { expected: "move-down", input: "south" },
  { expected: "move-left", input: "ArrowLeft" },
  { expected: "move-left", input: "\u001B[D" },
  { expected: "move-left", input: "a" },
  { expected: "move-left", input: "west" },
  { expected: "move-right", input: "ArrowRight" },
  { expected: "move-right", input: "\u001B[C" },
  { expected: "move-right", input: "d" },
  { expected: "move-right", input: "east" },
];

const UNKNOWN_KEYS = ["x", "Enter", "Space", "", "ArrowLefty", "shift"];

describe("normaliseKey", () => {
  it.each(KNOWN_KEYS)(
    "normalises $input to $expected",
    ({ expected, input }) => {
      expect(normaliseKey(input)).toEqual({
        type: "some",
        value: { type: expected },
      });
    },
  );

  it.each(UNKNOWN_KEYS)("returns none for unknown key %s", (key) => {
    expect(isNone(normaliseKey(key))).toBe(true);
  });
});
