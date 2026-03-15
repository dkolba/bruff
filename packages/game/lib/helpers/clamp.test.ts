import { describe, expect, it } from "vitest";
import clamp from "./clamp.js";

const MIN_RANGE = 0;
const MAX_RANGE = 10;
const MID_VALUE = 5;
const BELOW_MIN = -5;
const ABOVE_MAX = 15;
const NEGATIVE_MIN = -10;

describe("clamp", () => {
  it("should return the value when it is within the range", () => {
    expect(clamp(MID_VALUE, MIN_RANGE, MAX_RANGE)).toBe(MID_VALUE);
  });

  it("should return the minimum when value is below minimum", () => {
    expect(clamp(BELOW_MIN, MIN_RANGE, MAX_RANGE)).toBe(MIN_RANGE);
  });

  it("should return the maximum when value is above maximum", () => {
    expect(clamp(ABOVE_MAX, MIN_RANGE, MAX_RANGE)).toBe(MAX_RANGE);
  });

  it("should handle equal min and max", () => {
    expect(clamp(MID_VALUE, MAX_RANGE, MAX_RANGE)).toBe(MAX_RANGE);
  });

  it("should handle negative ranges", () => {
    expect(clamp(BELOW_MIN, NEGATIVE_MIN, MIN_RANGE)).toBe(BELOW_MIN);
  });
});
