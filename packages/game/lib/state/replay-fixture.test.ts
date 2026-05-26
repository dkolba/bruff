import { describe, expect, it } from "vitest";
import { CURRENT_STATE_VERSION } from "../core/constants.js";
import { parseReplayFixture } from "./replay-fixture.js";

const validFixture = {
  frames: [{ frame: 1, input: "move-right" }],
  initialCanvas: { height: 600, width: 800 },
  seed: 1,
  stateVersion: CURRENT_STATE_VERSION,
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
});

describe("parseReplayFixture fixture shape validation", () => {
  it("rejects a non-object fixture", () => {
    expect(parseReplayFixture("fixture")).toEqual({
      error: { reason: "fixture must be an object", type: "invalidFixture" },
      type: "error",
    });
  });

  it("rejects a null fixture", () => {
    expect(parseReplayFixture(null)).toEqual({
      error: { reason: "fixture must be an object", type: "invalidFixture" },
      type: "error",
    });
  });
});

describe("parseReplayFixture numeric field validation", () => {
  it("rejects a non-integer state version", () => {
    expect(parseReplayFixture({ ...validFixture, stateVersion: 1.5 })).toEqual({
      error: {
        reason: "stateVersion must be an integer",
        type: "invalidFixture",
      },
      type: "error",
    });
  });

  it("rejects an invalid state version", () => {
    expect(parseReplayFixture({ ...validFixture, stateVersion: 1 })).toEqual({
      error: {
        expected: CURRENT_STATE_VERSION,
        got: 1,
        type: "stateVersionMismatch",
      },
      type: "error",
    });
  });

  it("rejects a non-finite seed", () => {
    expect(parseReplayFixture({ ...validFixture, seed: Infinity })).toEqual({
      error: { reason: "seed must be an integer", type: "invalidFixture" },
      type: "error",
    });
  });

  it("rejects a non-integer total frame count", () => {
    expect(parseReplayFixture({ ...validFixture, totalFrames: 1.5 })).toEqual({
      error: {
        reason: "totalFrames must be a non-negative integer",
        type: "invalidFixture",
      },
      type: "error",
    });
  });

  it("rejects a negative total frame count", () => {
    expect(parseReplayFixture({ ...validFixture, totalFrames: -1 })).toEqual({
      error: {
        reason: "totalFrames must be a non-negative integer",
        type: "invalidFixture",
      },
      type: "error",
    });
  });
});

describe("parseReplayFixture initial canvas validation", () => {
  it("rejects a non-object initial canvas", () => {
    expect(
      parseReplayFixture({ ...validFixture, initialCanvas: "canvas" }),
    ).toEqual({
      error: {
        reason: "initialCanvas must be an object",
        type: "invalidFixture",
      },
      type: "error",
    });
  });

  it("rejects a non-numeric initial canvas height", () => {
    expect(
      parseReplayFixture({
        ...validFixture,
        initialCanvas: { height: "600", width: 800 },
      }),
    ).toEqual({
      error: {
        reason: "initialCanvas height and width must be numbers",
        type: "invalidFixture",
      },
      type: "error",
    });
  });

  it("rejects a non-numeric initial canvas width", () => {
    expect(
      parseReplayFixture({
        ...validFixture,
        initialCanvas: { height: 600, width: "800" },
      }),
    ).toEqual({
      error: {
        reason: "initialCanvas height and width must be numbers",
        type: "invalidFixture",
      },
      type: "error",
    });
  });
});

describe("parseReplayFixture frame-list validation", () => {
  it("rejects non-array frames", () => {
    expect(parseReplayFixture({ ...validFixture, frames: "frames" })).toEqual({
      error: { reason: "frames must be an array", type: "invalidFixture" },
      type: "error",
    });
  });

  it("rejects non-object frame entries", () => {
    expect(parseReplayFixture({ ...validFixture, frames: ["frame"] })).toEqual({
      error: {
        reason: "frame entries must be objects",
        type: "invalidFixture",
      },
      type: "error",
    });
  });
});

describe("parseReplayFixture frame entry validation", () => {
  it("rejects non-integer frame numbers", () => {
    expect(
      parseReplayFixture({
        ...validFixture,
        frames: [{ frame: 1.5, input: "move-right" }],
      }),
    ).toEqual({
      error: { reason: "frame must be an integer", type: "invalidFixture" },
      type: "error",
    });
  });

  it("rejects non-string frame inputs", () => {
    expect(
      parseReplayFixture({
        ...validFixture,
        frames: [{ frame: 1, input: 1 }],
      }),
    ).toEqual({
      error: { reason: "input must be a string", type: "invalidFixture" },
      type: "error",
    });
  });

  it("keeps the first frame parsing error", () => {
    expect(
      parseReplayFixture({
        ...validFixture,
        frames: [
          { frame: "1", input: "move-right" },
          { frame: 1, input: "move-down" },
        ],
      }),
    ).toEqual({
      error: { reason: "frame must be an integer", type: "invalidFixture" },
      type: "error",
    });
  });
});

describe("parseReplayFixture frame range validation", () => {
  it("rejects an out-of-range frame", () => {
    expect(parseReplayFixture({ ...validFixture, totalFrames: 0 })).toEqual({
      error: { frame: 1, total: 0, type: "frameOutOfRange" },
      type: "error",
    });
  });
});
