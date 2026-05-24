import { createSigilGlyphMap, isValidGlyphName } from "./glyph-name.js";
import { describe, expect, it } from "vitest";

const ORIGIN = 0;
const STAR_ADVANCE_WIDTH = 600;
const HEART_ADVANCE_WIDTH = 500;
const UNITS_PER_EM = 1000;

const starGlyph = {
  advanceWidth: STAR_ADVANCE_WIDTH,
  bounds: {
    x1: ORIGIN,
    x2: STAR_ADVANCE_WIDTH,
    y1: ORIGIN,
    y2: UNITS_PER_EM,
  },
  path: "M0 0L600 0Z",
  unicode: "★",
  unitsPerEm: UNITS_PER_EM,
};

const heartGlyph = {
  advanceWidth: HEART_ADVANCE_WIDTH,
  bounds: {
    x1: ORIGIN,
    x2: HEART_ADVANCE_WIDTH,
    y1: ORIGIN,
    y2: UNITS_PER_EM,
  },
  path: "M0 0L500 0Z",
  unicode: "♥",
  unitsPerEm: UNITS_PER_EM,
};

const glyphDrafts = [
  {
    defaultName: "u2605",
    glyph: starGlyph,
  },
  {
    defaultName: "u2665",
    glyph: heartGlyph,
  },
];

describe("isValidGlyphName", () => {
  it("accepts ASCII names", () => {
    expect(isValidGlyphName("star")).toBe(true);
  });

  it("accepts emoji names", () => {
    expect(isValidGlyphName("⭐")).toBe(true);
  });

  it("accepts symbol names", () => {
    expect(isValidGlyphName("★")).toBe(true);
  });

  it("accepts mixed Unicode names", () => {
    expect(isValidGlyphName("star★")).toBe(true);
  });

  it("rejects empty names", () => {
    expect(isValidGlyphName("")).toBe(false);
  });

  it("rejects control characters", () => {
    expect(isValidGlyphName("star\n")).toBe(false);
  });
});

describe("createSigilGlyphMap", () => {
  it("creates a glyph map with edited and default names", () => {
    const glyphMapResult = createSigilGlyphMap(glyphDrafts, {
      "★": "star",
    });

    expect(glyphMapResult).toStrictEqual({
      type: "ok",
      value: {
        star: starGlyph,
        u2665: heartGlyph,
      },
    });
  });

  it("rejects duplicate glyph names", () => {
    const glyphMapResult = createSigilGlyphMap(glyphDrafts, {
      "★": "icon",
      "♥": "icon",
    });

    expect(glyphMapResult).toStrictEqual({
      error: [
        {
          message: 'Duplicate glyph name "icon".',
          type: "duplicate-glyph-name",
        },
      ],
      type: "error",
    });
  });

  it("rejects invalid glyph names", () => {
    const glyphMapResult = createSigilGlyphMap(glyphDrafts, {
      "★": "",
    });

    expect(glyphMapResult).toStrictEqual({
      error: [
        {
          message: 'Invalid glyph name "".',
          type: "invalid-glyph-name",
        },
      ],
      type: "error",
    });
  });
});
