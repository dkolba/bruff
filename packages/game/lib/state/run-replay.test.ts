import { describe, expect, it } from "vitest";
import canonicalFixture from "../../tests/fixtures/canonical-replay.json";
import canonicalSnapshot from "../../tests/snapshots/canonical-replay.json";
import { parseReplayFixture } from "./replay-fixture.js";
import { runReplay } from "./run-replay.js";

const ZERO = 0;
const ONE_FRAME = 1;

describe("runReplay", () => {
  it("does not advance frameIndex for replay frames without input", () => {
    const fixture = parseReplayFixture({
      ...canonicalFixture,
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
