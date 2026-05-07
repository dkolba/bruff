import { describe, expect, it } from "vitest";
import { error, isError, isOk, ok } from "./result.js";

const SAMPLE_VALUE = 42;
const SAMPLE_REASON = "not-found";

describe("ok", () => {
  it("wraps a value in the success variant", () => {
    expect(ok(SAMPLE_VALUE)).toEqual({ type: "ok", value: SAMPLE_VALUE });
  });

  it("preserves the value reference", () => {
    const payload = { id: "abc" };
    const result = ok(payload);
    if (result.type === "ok") {
      expect(result.value).toBe(payload);
    }
  });
});

describe("error", () => {
  it("wraps a reason in the failure variant", () => {
    expect(error(SAMPLE_REASON)).toEqual({
      error: SAMPLE_REASON,
      type: "error",
    });
  });

  it("preserves the reason reference", () => {
    const reason = { code: "E_BAD" };
    const result = error(reason);
    if (result.type === "error") {
      expect(result.error).toBe(reason);
    }
  });
});

describe("isOk", () => {
  it("returns true for ok results", () => {
    expect(isOk(ok(SAMPLE_VALUE))).toBe(true);
  });

  it("returns false for error results", () => {
    expect(isOk(error(SAMPLE_REASON))).toBe(false);
  });
});

describe("isError", () => {
  it("returns true for error results", () => {
    expect(isError(error(SAMPLE_REASON))).toBe(true);
  });

  it("returns false for ok results", () => {
    expect(isError(ok(SAMPLE_VALUE))).toBe(false);
  });
});
