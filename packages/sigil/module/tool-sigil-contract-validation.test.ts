/* eslint-disable unicorn/text-encoding-identifier-case -- Contract validation fixtures use shared glyph group names such as ASCII. */
import { describe, expect, it } from "vitest";
import {
  hasToolSigilContractIssues,
  validateToolSigilGlyphMap,
} from "./tool-sigil-contract-validation.js";

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
  it("returns no issues for valid glyph maps", () => {
    expect(validateToolSigilGlyphMap(validGlyphMap)).toStrictEqual([]);
  });

  it("returns root paths for non-object glyph maps", () => {
    expect(validateToolSigilGlyphMap(null)).toStrictEqual([
      {
        message: "Invalid input: expected object, received null",
        path: "$",
      },
    ]);
  });

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

describe("hasToolSigilContractIssues", () => {
  it("detects empty and populated issue lists", () => {
    expect(hasToolSigilContractIssues([])).toBe(false);
    expect(hasToolSigilContractIssues([{ message: "m", path: "p" }])).toBe(
      true,
    );
  });
});
