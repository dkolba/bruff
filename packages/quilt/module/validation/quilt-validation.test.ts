import { describe, expect, test } from "vitest";
import { validateQuiltMapSize } from "./quilt-validation.ts";

describe("quilt validation", () => {
  test("validates positive map dimensions", () => {
    expect(validateQuiltMapSize({ height: 4, width: 4 })).toStrictEqual({
      type: "ok",
      value: { height: 4, width: 4 },
    });
  });

  test("returns value errors for invalid map dimensions", () => {
    expect(validateQuiltMapSize({ height: 0, width: 4 })).toStrictEqual({
      error: { reason: "INVALID_MAP_SIZE" },
      type: "error",
    });
  });
});
