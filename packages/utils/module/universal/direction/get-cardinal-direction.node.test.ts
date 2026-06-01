import { describe, expect, it } from "vitest";
import { getCardinalDirection } from "./get-cardinal-direction.js";

const ZERO = 0;
const ONE = 1;
const NEGATIVE_ONE = -1;
const MINUS_POINT_ONE = -0.1;

describe("getCardinalDirection", () => {
  it("should return EAST for positive dx", () => {
    expect(getCardinalDirection(ONE, ZERO)).toBe("EAST");
  });

  it("should return WEST for negative dx", () => {
    expect(getCardinalDirection(NEGATIVE_ONE, ZERO)).toBe("WEST");
  });

  it("should return SOUTH for positive dy", () => {
    expect(getCardinalDirection(ZERO, ONE)).toBe("SOUTH");
  });

  it("should return NORTH for negative dy", () => {
    expect(getCardinalDirection(ZERO, NEGATIVE_ONE)).toBe("NORTH");
  });

  it("should return NORTHEAST for positive dx and negative dy", () => {
    expect(getCardinalDirection(ONE, NEGATIVE_ONE)).toBe("NORTHEAST");
  });

  it("should return NORTHWEST for negative dx and negative dy", () => {
    expect(getCardinalDirection(NEGATIVE_ONE, NEGATIVE_ONE)).toBe("NORTHWEST");
  });

  it("should return SOUTHEAST for positive dx and dy", () => {
    expect(getCardinalDirection(ONE, ONE)).toBe("SOUTHEAST");
  });

  it("should return SOUTHWEST for negative dx and positive dy", () => {
    expect(getCardinalDirection(NEGATIVE_ONE, ONE)).toBe("SOUTHWEST");
  });

  it("should handle rounding up using Math.round", () => {
    expect(getCardinalDirection(ONE, MINUS_POINT_ONE)).toBe("EAST");
  });

  it("should handle rounding down using Math.round", () => {
    expect(getCardinalDirection(ONE, MINUS_POINT_ONE)).toBe("EAST");
  });
});
