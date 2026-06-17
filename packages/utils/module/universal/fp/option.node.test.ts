import { describe, expect, it } from "vitest";

import {
  flatMapOption,
  isNone,
  isSome,
  mapOption,
  none,
  type Option,
  some,
  toResult,
} from "./option.ts";
import { error, ok } from "./result.ts";

const SAMPLE_VALUE = 42;
const SAMPLE_REASON = "missing";
const TWO = 2;
const ONE = 1;
const double = (value: number): number => value * TWO;
const addOne = (value: number): number => value + ONE;
const identity = <T>(value: T): T => value;
const nextSomeDoubled = (value: number): Option<number> => some(double(value));
const nextNoneOnSample = (value: number): Option<number> =>
  value === SAMPLE_VALUE ? none : some(value);

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

describe("mapOption", () => {
  it("transforms the value inside some", () => {
    expect(mapOption(double)(some(SAMPLE_VALUE))).toEqual(
      some(SAMPLE_VALUE * TWO),
    );
  });

  it("passes none through unchanged", () => {
    const option: Option<number> = none;
    expect(mapOption(double)(option)).toEqual(none);
  });

  it("respects the functor identity law", () => {
    const option = some(SAMPLE_VALUE);
    expect(mapOption(identity)(option)).toEqual(option);
  });

  it("respects the functor composition law", () => {
    const option = some(SAMPLE_VALUE);
    const composed = mapOption((value: number) => double(addOne(value)))(
      option,
    );
    const sequenced = mapOption(double)(mapOption(addOne)(option));
    expect(composed).toEqual(sequenced);
  });
});

describe("flatMapOption", () => {
  it("threads some values into the continuation", () => {
    expect(flatMapOption(nextSomeDoubled)(some(SAMPLE_VALUE))).toEqual(
      some(SAMPLE_VALUE * TWO),
    );
  });

  it("short-circuits on none", () => {
    expect(flatMapOption(nextSomeDoubled)(none)).toEqual(none);
  });

  it("propagates none returned by the continuation", () => {
    expect(flatMapOption(nextNoneOnSample)(some(SAMPLE_VALUE))).toEqual(none);
  });
});

describe("toResult", () => {
  it("promotes some to ok", () => {
    expect(toResult(SAMPLE_REASON)(some(SAMPLE_VALUE))).toEqual(
      ok(SAMPLE_VALUE),
    );
  });

  it("converts none to error with the supplied reason", () => {
    const option: Option<number> = none;
    expect(toResult(SAMPLE_REASON)(option)).toEqual(error(SAMPLE_REASON));
  });
});
