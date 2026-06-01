/* eslint-disable unicorn/text-encoding-identifier-case -- Tests assert @bruff/glyph catalog group names such as ASCII. */
import {
  createSigilGlyph,
  createSigilGlyphMap,
  isValidGlyphName,
} from "./glyph-name.js";
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

const starMapping = {
  glyph: "*",
  glyphKey: "ASTERISK",
  groupName: "ASCII",
};

const heartMapping = {
  glyph: "♥",
  glyphKey: "HEART",
  groupName: "MISC_SYMBOLS",
};

const mappedGlyphsByUnicode = {
  "★": starMapping,
  "♥": heartMapping,
};

const licensesByUnicode = {
  "★": "MIT",
  "♥": "OFL-1.1",
};

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

describe("createSigilGlyphMap success", () => {
  it("creates a glyph map with edited and default names", () => {
    const glyphMapResult = createSigilGlyphMap(
      glyphDrafts,
      {
        "★": "star",
      },
      { licensesByUnicode, mappedGlyphsByUnicode },
    );

    expect(glyphMapResult).toStrictEqual({
      type: "ok",
      value: {
        star: createSigilGlyph(starGlyph, starMapping, "MIT"),
        u2665: createSigilGlyph(heartGlyph, heartMapping, "OFL-1.1"),
      },
    });
  });

  it("adds mapped glyph and exact LICENSE fields", () => {
    const glyphMapResult = createSigilGlyphMap(
      glyphDrafts,
      {},
      { licensesByUnicode, mappedGlyphsByUnicode },
    );

    expect(glyphMapResult.type).toBe("ok");
    if (glyphMapResult.type === "error") {
      return;
    }
    // eslint-disable-next-line dot-notation -- TS requires bracket access for index-signature glyph maps.
    expect(glyphMapResult.value["u2605"]).toMatchObject({
      LICENSE: "MIT",
      mappedGlyph: starMapping,
      unicode: "★",
    });
  });
});

describe("createSigilGlyphMap errors", () => {
  it("rejects duplicate glyph names", () => {
    const glyphMapResult = createSigilGlyphMap(
      glyphDrafts,
      {
        "★": "icon",
        "♥": "icon",
      },
      { licensesByUnicode, mappedGlyphsByUnicode },
    );

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
    const glyphMapResult = createSigilGlyphMap(
      glyphDrafts,
      {
        "★": "",
      },
      { licensesByUnicode, mappedGlyphsByUnicode },
    );

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
