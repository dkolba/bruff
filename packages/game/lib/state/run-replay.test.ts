import { describe, expect, it } from "vitest";

import canonicalFixture from "../../tests/fixtures/canonical-replay.json";
import canonicalSnapshot from "../../tests/snapshots/canonical-replay.json";
import { parseReplayFixture } from "./replay-fixture.js";
import type { ReplayFixture } from "./replay-fixture.ts";
import { runReplay } from "./run-replay.js";

const ZERO = 0;
const ONE_FRAME = 1;
const TWO_FRAMES = 2;
const INVALID_INPUT = "dash";

describe("runReplay", () => {
  it("does not advance frameIndex for replay frames without input", () => {
    const fixture = parseReplayFixture({
      ...canonicalFixture,
      frames: [],
      totalFrames: ONE_FRAME,
    });
    expect(fixture.type).toBe("ok");
    if (fixture.type === "error") {
      return;
    }

    const replay = runReplay(fixture.value);

    expect(replay.type).toBe("ok");
    if (replay.type === "error") {
      return;
    }
    expect(replay.value.frameIndex).toBe(ZERO);
  });

  it("produces the same final state across repeated runs", () => {
    const fixture = parseReplayFixture(canonicalFixture);
    expect(fixture.type).toBe("ok");
    if (fixture.type === "error") {
      return;
    }

    expect(runReplay(fixture.value)).toStrictEqual(runReplay(fixture.value));
  });

  it("matches the committed canonical replay snapshot", () => {
    const fixture = parseReplayFixture(canonicalFixture);
    expect(fixture.type).toBe("ok");
    if (fixture.type === "error") {
      return;
    }

    expect(runReplay(fixture.value)).toStrictEqual({
      type: "ok",
      value: canonicalSnapshot,
    });
  });
});

describe("runReplay invalid input handling", () => {
  it("returns an invalidFixture error for unknown replay input", () => {
    const fixture: ReplayFixture = {
      frames: [{ frame: ONE_FRAME, input: INVALID_INPUT }],
      initialCanvas: canonicalFixture.initialCanvas,
      seed: canonicalFixture.seed,
      stateVersion: canonicalFixture.stateVersion,
      totalFrames: ONE_FRAME,
    };

    expect(runReplay(fixture)).toStrictEqual({
      error: {
        reason: `unknown replay input: ${INVALID_INPUT}`,
        type: "invalidFixture",
      },
      type: "error",
    });
  });

  it("keeps the first replay input error across later inputs and frames", () => {
    const fixture: ReplayFixture = {
      frames: [
        { frame: ONE_FRAME, input: INVALID_INPUT },
        { frame: ONE_FRAME, input: "move-right" },
        { frame: TWO_FRAMES, input: "move-down" },
      ],
      initialCanvas: canonicalFixture.initialCanvas,
      seed: canonicalFixture.seed,
      stateVersion: canonicalFixture.stateVersion,
      totalFrames: TWO_FRAMES,
    };

    expect(runReplay(fixture)).toStrictEqual({
      error: {
        reason: `unknown replay input: ${INVALID_INPUT}`,
        type: "invalidFixture",
      },
      type: "error",
    });
  });
});
