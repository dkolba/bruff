/* eslint-disable unicorn/text-encoding-identifier-case -- ASCII is a @bruff/glyph catalog group name. */
import { isError, isOk } from "@bruff/utils";
import { describe, expect, test } from "vitest";

import { parseQuiltTerrainGlyphs } from "./sigil-glyph-map.ts";

const VALID_GLYPH_JSON = {
  door: {
    LICENSE: "MIT",
    advanceWidth: 700,
    bounds: { x1: 10, x2: 690, y1: 20, y2: 720 },
    mappedGlyph: { glyph: "+", glyphKey: "PLUS", groupName: "ASCII" },
    name: "+",
    path: "M0 0L1 1Z",
    unicode: "+",
    unitsPerEm: 1000,
  },
  enemy: {
    LICENSE: "MIT",
    advanceWidth: 700,
    bounds: { x1: 10, x2: 690, y1: 20, y2: 720 },
    mappedGlyph: { glyph: "e", glyphKey: "LATIN_E", groupName: "ASCII" },
    name: "e",
    path: "M0 0L1 1Z",
    unicode: "e",
    unitsPerEm: 1000,
  },
  floor: {
    LICENSE: "MIT",
    advanceWidth: 700,
    bounds: { x1: 10, x2: 690, y1: 20, y2: 720 },
    mappedGlyph: { glyph: ".", glyphKey: "PERIOD", groupName: "ASCII" },
    name: ".",
    path: "M0 0L1 1Z",
    unicode: ".",
    unitsPerEm: 1000,
  },
  player: {
    LICENSE: "MIT",
    advanceWidth: 700,
    bounds: { x1: 10, x2: 690, y1: 20, y2: 720 },
    mappedGlyph: { glyph: "@", glyphKey: "AT", groupName: "ASCII" },
    name: "@",
    path: "M0 0L1 1Z",
    unicode: "@",
    unitsPerEm: 1000,
  },
  wall: {
    LICENSE: "MIT",
    advanceWidth: 700,
    bounds: { x1: 10, x2: 690, y1: 20, y2: 720 },
    mappedGlyph: { glyph: "#", glyphKey: "HASH", groupName: "ASCII" },
    name: "#",
    path: "M0 0L1 1Z",
    unicode: "#",
    unitsPerEm: 1000,
  },
};

describe("sigil glyph map storage", () => {
  test("extracts terrain glyphs from valid Sigil glyph JSON", () => {
    const parsed = parseQuiltTerrainGlyphs(VALID_GLYPH_JSON);

    expect(isOk(parsed)).toBe(true);
    if (isOk(parsed)) {
      expect(parsed.value.floor).toBeDefined();
      expect(parsed.value.wall).toBeDefined();
      expect(parsed.value.door).toBeDefined();
      // Player and enemy are available in the source but not needed for terrain.
    }
  });

  test("ignores non-terrain entries in valid glyph JSON", () => {
    const parsed = parseQuiltTerrainGlyphs(VALID_GLYPH_JSON);

    expect(isOk(parsed)).toBe(true);
    if (isOk(parsed)) {
      // Only terrain keys are projectable.
      expect(
        Object.keys(parsed.value).toSorted((first, second) =>
          first.localeCompare(second),
        ),
      ).toStrictEqual(
        ["floor", "wall", "door"].toSorted((first, second) =>
          first.localeCompare(second),
        ),
      );
    }
  });

  test("returns a typed error for invalid glyph JSON", () => {
    const parsed = parseQuiltTerrainGlyphs({ version: 1 });

    expect(isError(parsed)).toBe(true);
    if (isError(parsed)) {
      expect(parsed.error.reason).toBe("INVALID_QUILT_TERRAIN_GLYPHS");
    }
  });

  test("returns a typed error for unknown input without throwing", () => {
    const unknownInput: unknown = undefined;

    expect(() => parseQuiltTerrainGlyphs(unknownInput)).not.toThrow();
    expect(isError(parseQuiltTerrainGlyphs(unknownInput))).toBe(true);
  });
});
