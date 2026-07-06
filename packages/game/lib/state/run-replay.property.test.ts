import { fc, test } from "@fast-check/vitest";
import { describe, expect } from "vitest";

import { CURRENT_STATE_VERSION } from "../core/constants.js";
import type { ReplayFixture } from "./replay-fixture.ts";
import { runReplay } from "./run-replay.js";

const MAX_FRAMES = 20;
const MIN_SEED = 1;
const MAX_SEED = 10_000;
const FIRST_FRAME = 1;

const countInputFrames = (fixture: ReplayFixture): number =>
  new Set(fixture.frames.map((frame) => frame.frame)).size;

const replayInputArb = fc.constantFrom(
  "move-down",
  "move-left",
  "move-right",
  "move-up",
);

const fixtureArb: fc.Arbitrary<ReplayFixture> = fc
  .record({
    inputs: fc.array(replayInputArb, { maxLength: MAX_FRAMES, minLength: 0 }),
    seed: fc.integer({ max: MAX_SEED, min: MIN_SEED }),
  })
  .map(({ inputs, seed }): ReplayFixture => ({
    frames: inputs.map((input, index) => ({
      frame: index + FIRST_FRAME,
      input,
    })),
    initialCanvas: { height: 600, width: 800 },
    seed,
    stateVersion: CURRENT_STATE_VERSION,
    totalFrames: inputs.length,
  }));

describe("runReplay (property-based)", () => {
  test.prop([fixtureArb])(
    "is deterministic across arbitrary seeds and bounded input sequences",
    (fixture) => {
      expect(runReplay(fixture)).toStrictEqual(runReplay(fixture));
    },
  );

  test.prop([fixtureArb])(
    "frameIndex counts frames with replay input",
    (fixture) => {
      const replay = runReplay(fixture);
      expect(replay.type).toBe("ok");
      if (replay.type === "error") {
        return;
      }

      expect(replay.value.frameIndex).toBe(countInputFrames(fixture));
    },
  );
});
