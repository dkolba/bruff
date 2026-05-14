import { describe, expect, it } from "vitest";
import { parseReplayFixture } from "./replay-fixture.js";

const validFixture = {
  frames: [{ frame: 1, input: "move-right" }],
  initialCanvas: { height: 600, width: 800 },
  seed: 1,
  stateVersion: 1,
  totalFrames: 1,
};

describe("parseReplayFixture", () => {
  it("parses a valid fixture", () => {
    expect(parseReplayFixture(validFixture)).toStrictEqual({
      type: "ok",
      value: validFixture,
    });
  });

  it("rejects a missing field", () => {
    expect(parseReplayFixture({ ...validFixture, seed: undefined })).toEqual({
      error: { reason: "seed must be an integer", type: "invalidFixture" },
      type: "error",
    });
  });

  it("rejects an invalid state version", () => {
    expect(parseReplayFixture({ ...validFixture, stateVersion: 2 })).toEqual({
      error: { expected: 1, got: 2, type: "stateVersionMismatch" },
      type: "error",
    });
  });

  it("rejects an out-of-range frame", () => {
    expect(parseReplayFixture({ ...validFixture, totalFrames: 0 })).toEqual({
      error: { frame: 1, total: 0, type: "frameOutOfRange" },
      type: "error",
    });
  });
});
