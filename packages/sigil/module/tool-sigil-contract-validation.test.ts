/* eslint-disable sort-imports, unicorn/text-encoding-identifier-case -- Contract validation fixtures use shared glyph group names such as ASCII. */
import { validateToolSigilGlyphMap } from "./tool-sigil-contract-validation.js";
import { describe, expect, it } from "vitest";
/* eslint-enable sort-imports */

const validMappedGlyph = {
  glyph: "#",
  glyphKey: "NUMBER_SIGN",
  groupName: "ASCII",
};

const validGlyph = {
  LICENSE: "MIT",
  advanceWidth: 600,
  bounds: {
    x1: 0,
    x2: 600,
    y1: 0,
    y2: 1000,
  },
  mappedGlyph: validMappedGlyph,
  path: "M0 0L600 0Z",
  unicode: "#",
  unitsPerEm: 1000,
};

const validGlyphMap = {
  door: validGlyph,
  enemy: validGlyph,
  floor: validGlyph,
  player: validGlyph,
  wall: validGlyph,
};

describe("validateToolSigilGlyphMap", () => {
  it("returns exact paths and reasons for invalid glyph map combinations", () => {
    expect(validateToolSigilGlyphMap({})).toEqual(
      expect.arrayContaining([
        {
          message: "Invalid input: expected object, received undefined",
          path: "floor",
        },
      ]),
    );
  });

  it("returns exact paths and reasons for invalid produced glyphs", () => {
    expect(
      validateToolSigilGlyphMap({
        ...validGlyphMap,
        floor: {
          ...validGlyph,
          path: "",
        },
      }),
    ).toStrictEqual([
      {
        message: "Too small: expected string to have >=1 characters",
        path: "floor.path",
      },
    ]);
  });
});
