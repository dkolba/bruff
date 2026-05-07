import { describe, expect, it } from "vitest";
import { isNone, isSome, none, some } from "./option.js";

const SAMPLE_VALUE = 42;

describe("some", () => {
  it("wraps a value in the present variant", () => {
    expect(some(SAMPLE_VALUE)).toEqual({
      type: "some",
      value: SAMPLE_VALUE,
    });
  });

  it("preserves the value reference", () => {
    const payload = { id: "abc" };
    const option = some(payload);
    if (option.type === "some") {
      expect(option.value).toBe(payload);
    }
  });
});

describe("none", () => {
  it("is the absent variant", () => {
    expect(none).toEqual({ type: "none" });
  });
});

describe("isSome", () => {
  it("returns true for some options", () => {
    expect(isSome(some(SAMPLE_VALUE))).toBe(true);
  });

  it("returns false for the none singleton", () => {
    expect(isSome(none)).toBe(false);
  });
});

describe("isNone", () => {
  it("returns true for the none singleton", () => {
    expect(isNone(none)).toBe(true);
  });

  it("returns false for some options", () => {
    expect(isNone(some(SAMPLE_VALUE))).toBe(false);
  });
});
