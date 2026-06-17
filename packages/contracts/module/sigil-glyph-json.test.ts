/* eslint-disable unicorn/text-encoding-identifier-case -- `ASCII` is a @bruff/glyph catalog group name in the Sigil glyph JSON contract. */
import {
  parseSigilGlyphMap,
  type ParseSigilGlyphMapError,
  type SigilGlyphMap,
  sigilGlyphMapSchema,
} from "@bruff/contracts";
import { type Result } from "@bruff/utils";
import { describe, expect, it } from "vitest";

const TEST_ADVANCE_WIDTH = 700;
const TEST_BOUNDS_X1 = 10;
const TEST_BOUNDS_X2 = 690;
const TEST_BOUNDS_Y1 = 20;
const TEST_BOUNDS_Y2 = 720;
const TEST_UNITS_PER_EM = 1000;

type TestGlyphEntry = SigilGlyphMap["floor"];

const createGlyphEntry = (
  unicode: string,
  unitsPerEm: number,
): TestGlyphEntry => ({
  LICENSE: "MIT",
  advanceWidth: TEST_ADVANCE_WIDTH,
  bounds: {
    x1: TEST_BOUNDS_X1,
    x2: TEST_BOUNDS_X2,
    y1: TEST_BOUNDS_Y1,
    y2: TEST_BOUNDS_Y2,
  },
  mappedGlyph: {
    glyph: unicode,
    glyphKey: "AT",
    groupName: "ASCII",
  },
  name: unicode,
  path: "M0 0L1 1Z",
  unicode,
  unitsPerEm,
});

const VALID_SIGIL_GLYPH_MAP = {
  door: createGlyphEntry("+", TEST_UNITS_PER_EM),
  enemy: createGlyphEntry("e", TEST_UNITS_PER_EM),
  floor: createGlyphEntry(".", TEST_UNITS_PER_EM),
  player: createGlyphEntry("@", TEST_UNITS_PER_EM),
  star: createGlyphEntry("★", TEST_UNITS_PER_EM),
  wall: createGlyphEntry("#", TEST_UNITS_PER_EM),
};

const INVALID_SIGIL_GLYPH_MAP = {
  ...VALID_SIGIL_GLYPH_MAP,
  floor: createGlyphEntry(".", Number.POSITIVE_INFINITY),
};

const MISSING_REQUIRED_SIGIL_GLYPH_MAP = {
  door: createGlyphEntry("+", TEST_UNITS_PER_EM),
  enemy: createGlyphEntry("e", TEST_UNITS_PER_EM),
  floor: createGlyphEntry(".", TEST_UNITS_PER_EM),
  player: createGlyphEntry("@", TEST_UNITS_PER_EM),
};

describe("sigilGlyphMapSchema", () => {
  it("accepts a valid Sigil glyph map", () => {
    expect(sigilGlyphMapSchema.safeParse(VALID_SIGIL_GLYPH_MAP)).toStrictEqual({
      data: VALID_SIGIL_GLYPH_MAP,
      success: true,
    });
  });

  it("requires a display name inside each glyph entry", () => {
    const parsedGlyphMap = sigilGlyphMapSchema.safeParse({
      ...VALID_SIGIL_GLYPH_MAP,
      floor: {
        ...createGlyphEntry(".", TEST_UNITS_PER_EM),
        name: undefined,
      },
    });

    expect(parsedGlyphMap.success).toBe(false);
    if (parsedGlyphMap.success) {
      return;
    }
    expect(parsedGlyphMap.error.issues).toEqual([
      expect.objectContaining({
        path: ["floor", "name"],
      }),
    ]);
  });

  it("requires core gameplay glyph names while allowing extra glyphs", () => {
    const parsedGlyphMap = sigilGlyphMapSchema.safeParse(
      MISSING_REQUIRED_SIGIL_GLYPH_MAP,
    );

    expect(parsedGlyphMap.success).toBe(false);
    if (parsedGlyphMap.success) {
      return;
    }
    expect(parsedGlyphMap.error.issues).toEqual([
      expect.objectContaining({
        path: ["wall"],
      }),
    ]);
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
            path: ["floor", "unitsPerEm"],
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
