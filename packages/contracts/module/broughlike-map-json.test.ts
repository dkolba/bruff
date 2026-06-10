import {
  type BroughlikeMap,
  broughlikeMapSchema,
  parseBroughlikeMap,
  type ParseBroughlikeMapError,
} from "@bruff/contracts";
import { describe, expect, it, test } from "vitest";
import type { Result } from "@bruff/utils";

const VALID_BROUGHLIKE_MAP = {
  height: 3,
  rows: [
    ["wall", "door", "wall"],
    ["floor", "floor", "floor"],
    ["wall", "floor", "wall"],
  ],
  version: 1,
  width: 3,
};

const NON_RECTANGULAR_BROUGHLIKE_MAP = {
  height: 2,
  rows: [["floor"], ["floor", "door"]],
  version: 1,
  width: 2,
};

const HEIGHT_MISMATCH_BROUGHLIKE_MAP = {
  height: 3,
  rows: [["floor", "door"]],
  version: 1,
  width: 2,
};

const LARGE_VALID_BROUGHLIKE_MAP = {
  height: 9,
  rows: Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => "floor"),
  ),
  version: 1,
  width: 9,
};

const OVERSIZED_BROUGHLIKE_MAP = {
  height: 10,
  rows: Array.from({ length: 10 }, () =>
    Array.from({ length: 10 }, () => "floor"),
  ),
  version: 1,
  width: 10,
};

describe("broughlikeMapSchema", () => {
  it("accepts a compact map with floor, wall, and door terrain", () => {
    expect(broughlikeMapSchema.safeParse(VALID_BROUGHLIKE_MAP)).toStrictEqual({
      data: VALID_BROUGHLIKE_MAP,
      success: true,
    });
  });
});

describe("parseBroughlikeMap valid input", () => {
  it("returns ok with a readonly inferred map for valid input", () => {
    const parsedMap: Result<BroughlikeMap, ParseBroughlikeMapError> =
      parseBroughlikeMap(VALID_BROUGHLIKE_MAP);

    expect(parsedMap).toStrictEqual({
      type: "ok",
      value: VALID_BROUGHLIKE_MAP,
    });
  });

  test("accepts 9x9 maps for Quilt export", () => {
    expect(parseBroughlikeMap(LARGE_VALID_BROUGHLIKE_MAP)).toStrictEqual({
      type: "ok",
      value: LARGE_VALID_BROUGHLIKE_MAP,
    });
  });
});

describe("parseBroughlikeMap invalid row data", () => {
  it("rejects non-rectangular row data", () => {
    expect(parseBroughlikeMap(NON_RECTANGULAR_BROUGHLIKE_MAP)).toStrictEqual({
      error: {
        issues: [
          expect.objectContaining({
            path: ["rows"],
          }),
        ],
        reason: "INVALID_BROUGHLIKE_MAP",
      },
      type: "error",
    });
  });

  it("rejects height values that do not match row count", () => {
    expect(parseBroughlikeMap(HEIGHT_MISMATCH_BROUGHLIKE_MAP)).toStrictEqual({
      error: {
        issues: [
          expect.objectContaining({
            message: "Map row count must match height.",
            path: ["rows"],
          }),
        ],
        reason: "INVALID_BROUGHLIKE_MAP",
      },
      type: "error",
    });
  });
});

describe("parseBroughlikeMap invalid dimensions", () => {
  it("rejects boards larger than a tiny broughlike grid", () => {
    expect(parseBroughlikeMap(OVERSIZED_BROUGHLIKE_MAP)).toStrictEqual({
      error: {
        issues: [
          expect.objectContaining({
            path: ["height"],
          }),
          expect.objectContaining({
            path: ["width"],
          }),
        ],
        reason: "INVALID_BROUGHLIKE_MAP",
      },
      type: "error",
    });
  });
});

describe("parseBroughlikeMap unknown input", () => {
  it("accepts unknown input without throwing", () => {
    const unknownInput: unknown = undefined;

    expect(() => parseBroughlikeMap(unknownInput)).not.toThrow();
    expect(parseBroughlikeMap(unknownInput)).toStrictEqual({
      error: {
        issues: [
          expect.objectContaining({
            path: [],
          }),
        ],
        reason: "INVALID_BROUGHLIKE_MAP",
      },
      type: "error",
    });
  });
});
