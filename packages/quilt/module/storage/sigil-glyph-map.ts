import {
  type BroughlikeTerrain,
  parseSigilGlyphMap,
  type ParseSigilGlyphMapError,
} from "@bruff/contracts";
import { error, ok, type Result } from "@bruff/utils";

import type { QuiltTerrainGlyphMap } from "../state/quilt-state.ts";

const TERRAIN_KEYS: ReadonlyArray<BroughlikeTerrain> = [
  "floor",
  "wall",
  "door",
];

/** Structured parse failure for {@link parseQuiltTerrainGlyphs}. */
export type ParseQuiltTerrainGlyphsError = Readonly<{
  reason: "INVALID_QUILT_TERRAIN_GLYPHS";
  source: ParseSigilGlyphMapError;
}>;

/**
 * Parses an unknown input into Quilt terrain glyph rendering data,
 * extracting only floor, wall, and door entries from a Sigil glyph map.
 *
 * @param input - Unknown candidate value
 * @returns A typed result containing terrain glyphs or parse failure
 */
export const parseQuiltTerrainGlyphs = (
  input: unknown,
): Result<QuiltTerrainGlyphMap, ParseQuiltTerrainGlyphsError> => {
  const parsedGlyphMap = parseSigilGlyphMap(input);

  if (parsedGlyphMap.type === "error") {
    return error({
      reason: "INVALID_QUILT_TERRAIN_GLYPHS",
      source: parsedGlyphMap.error,
    });
  }

  const terrainGlyphs: Record<
    string,
    QuiltTerrainGlyphMap[keyof QuiltTerrainGlyphMap]
  > = {};

  for (const terrainKey of TERRAIN_KEYS) {
    const sigilGlyph = parsedGlyphMap.value[terrainKey];
    /* v8 ignore next 3 -- Values guaranteed present by Sigil glyph contract. */
    if (sigilGlyph === undefined) {
      // eslint-disable-next-line no-continue -- Defensive unreachable branch.
      continue;
    }
    terrainGlyphs[terrainKey] = {
      advanceWidth: sigilGlyph.advanceWidth,
      bounds: sigilGlyph.bounds,
      path: sigilGlyph.path,
      terrain: terrainKey,
      unitsPerEm: sigilGlyph.unitsPerEm,
    };
  }

  return ok(terrainGlyphs);
};
