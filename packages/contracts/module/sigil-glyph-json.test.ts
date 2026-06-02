/* eslint-disable unicorn/text-encoding-identifier-case -- `ASCII` is a @bruff/glyph catalog group name in the Sigil glyph JSON contract. */
import { describe, expect, it } from "vitest";
import {
  parseSigilGlyphMap,
  type ParseSigilGlyphMapError,
  type SigilGlyphMap,
  sigilGlyphMapSchema,
} from "@bruff/contracts";
import { type Result } from "@bruff/utils";

const VALID_SIGIL_GLYPH_MAP = {
  star: {
    LICENSE: "MIT",
    advanceWidth: 700,
    bounds: {
      x1: 10,
      x2: 690,
      y1: 20,
      y2: 720,
    },
    mappedGlyph: {
      glyph: "@",
      glyphKey: "AT",
      groupName: "ASCII",
    },
    path: "M0 0L1 1Z",
    unicode: "★",
    unitsPerEm: 1000,
  },
};

const INVALID_SIGIL_GLYPH_MAP = {
  star: {
    LICENSE: "MIT",
    advanceWidth: 700,
    bounds: {
      x1: 10,
      x2: 690,
      y1: 20,
      y2: 720,
    },
    mappedGlyph: {
      glyph: "@",
      glyphKey: "AT",
      groupName: "ASCII",
    },
    path: "M0 0L1 1Z",
    unicode: "★",
    unitsPerEm: Number.POSITIVE_INFINITY,
  },
};

describe("sigilGlyphMapSchema", () => {
  it("accepts a valid Sigil glyph map", () => {
    expect(sigilGlyphMapSchema.safeParse(VALID_SIGIL_GLYPH_MAP)).toStrictEqual({
      data: VALID_SIGIL_GLYPH_MAP,
      success: true,
    });
  });
});

describe("parseSigilGlyphMap", () => {
  it("returns ok with a readonly inferred glyph map for valid input", () => {
    const parsedGlyphMap: Result<SigilGlyphMap, ParseSigilGlyphMapError> =
      parseSigilGlyphMap(VALID_SIGIL_GLYPH_MAP);

    expect(parsedGlyphMap).toStrictEqual({
      type: "ok",
      value: VALID_SIGIL_GLYPH_MAP,
    });
  });

  it("returns an explicit error value for invalid glyph metrics", () => {
    expect(parseSigilGlyphMap(INVALID_SIGIL_GLYPH_MAP)).toStrictEqual({
      error: {
        issues: [
          expect.objectContaining({
            path: ["star", "unitsPerEm"],
          }),
        ],
        reason: "INVALID_SIGIL_GLYPH_MAP",
      },
      type: "error",
    });
  });

  it("accepts unknown input without throwing", () => {
    const unknownInput: unknown = undefined;

    expect(() => parseSigilGlyphMap(unknownInput)).not.toThrow();
    expect(parseSigilGlyphMap(unknownInput)).toStrictEqual({
      error: {
        issues: [
          expect.objectContaining({
            path: [],
          }),
        ],
        reason: "INVALID_SIGIL_GLYPH_MAP",
      },
      type: "error",
    });
  });
});
