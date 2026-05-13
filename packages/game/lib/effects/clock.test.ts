import {
  advanceManualClock,
  manualClock,
  readClock,
  wallClock,
} from "./clock.js";
import { describe, expect, it, vi } from "vitest";

const MANUAL_CLOCK_START = 12;
const MANUAL_CLOCK_DELTA = 5;
const MANUAL_CLOCK_END = 17;
const WALL_CLOCK_NOW = 123;

describe("clock", () => {
  it("reads manual clock values", (): void => {
    expect(readClock(manualClock(MANUAL_CLOCK_START))).toBe(MANUAL_CLOCK_START);
  });

  it("advances manual clock values", (): void => {
    const clock = advanceManualClock(
      manualClock(MANUAL_CLOCK_START),
      MANUAL_CLOCK_DELTA,
    );

    expect(readClock(clock)).toBe(MANUAL_CLOCK_END);
  });

  it("reads from performance for wall clock", (): void => {
    const nowSpy = vi.spyOn(performance, "now").mockReturnValue(WALL_CLOCK_NOW);

    expect(readClock(wallClock())).toBe(WALL_CLOCK_NOW);

    nowSpy.mockRestore();
  });
});
