import { describe, expect, it } from "vitest";
import {
  error,
  flatMapResult,
  isError,
  isOk,
  mapError,
  mapResult,
  ok,
  type Result,
  unwrapOr,
} from "./result.js";

const SAMPLE_VALUE = 42;
const SAMPLE_REASON = "not-found";
const FALLBACK_VALUE = 7;
const TWO = 2;
const ONE = 1;
const double = (value: number): number => value * TWO;
const addOne = (value: number): number => value + ONE;
const identity = <T>(value: T): T => value;

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

describe("mapResult", () => {
  it("transforms the ok value", () => {
    const result: Result<number, string> = ok(SAMPLE_VALUE);
    expect(mapResult(double)(result)).toEqual(ok(SAMPLE_VALUE * TWO));
  });

  it("passes error results through unchanged", () => {
    const result: Result<number, string> = error(SAMPLE_REASON);
    expect(mapResult(double)(result)).toEqual(error(SAMPLE_REASON));
  });

  it("respects the functor identity law", () => {
    const result: Result<number, string> = ok(SAMPLE_VALUE);
    expect(mapResult(identity)(result)).toEqual(result);
  });

  it("respects the functor composition law", () => {
    const result: Result<number, string> = ok(SAMPLE_VALUE);
    const composed = mapResult((value: number) => double(addOne(value)))(
      result,
    );
    const sequenced = mapResult(double)(mapResult(addOne)(result));
    expect(composed).toEqual(sequenced);
  });
});

describe("flatMapResult", () => {
  it("threads ok values into the continuation", () => {
    const next = (value: number): Result<number, string> => ok(double(value));
    expect(flatMapResult(next)(ok(SAMPLE_VALUE))).toEqual(
      ok(SAMPLE_VALUE * TWO),
    );
  });

  it("short-circuits on error", () => {
    const next = (value: number): Result<number, string> => ok(double(value));
    const result: Result<number, string> = error(SAMPLE_REASON);
    expect(flatMapResult(next)(result)).toEqual(error(SAMPLE_REASON));
  });

  it("propagates an error returned by the continuation", () => {
    const next = (value: number): Result<number, string> =>
      error(`downstream-${String(value)}`);
    expect(flatMapResult(next)(ok(SAMPLE_VALUE))).toEqual(
      error(`downstream-${String(SAMPLE_VALUE)}`),
    );
  });
});

describe("mapError", () => {
  it("transforms the error reason", () => {
    const result: Result<number, string> = error(SAMPLE_REASON);
    expect(mapError((reason: string) => reason.toUpperCase())(result)).toEqual(
      error("NOT-FOUND"),
    );
  });

  it("passes ok results through unchanged", () => {
    const result: Result<number, string> = ok(SAMPLE_VALUE);
    expect(mapError((reason: string) => reason.toUpperCase())(result)).toEqual(
      ok(SAMPLE_VALUE),
    );
  });
});

describe("unwrapOr", () => {
  it("returns the ok value when present", () => {
    expect(unwrapOr(FALLBACK_VALUE)(ok(SAMPLE_VALUE))).toBe(SAMPLE_VALUE);
  });

  it("returns the fallback for error results", () => {
    const result: Result<number, string> = error(SAMPLE_REASON);
    expect(unwrapOr(FALLBACK_VALUE)(result)).toBe(FALLBACK_VALUE);
  });
});
