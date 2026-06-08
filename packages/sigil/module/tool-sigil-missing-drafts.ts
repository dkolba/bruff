import type { Font } from "opentype.js";
import type { SigilGlyphDraft } from "./glyph-json.js";

const MISSING_GLYPH_ADVANCE_WIDTH = 0;
const MISSING_GLYPH_BOUND = 0;
const MISSING_GLYPH_PATH = "";

const missingGlyphDraft = (font: Font, unicode: string): SigilGlyphDraft => ({
  defaultName: unicode,
  glyph: {
    advanceWidth: MISSING_GLYPH_ADVANCE_WIDTH,
    bounds: {
      x1: MISSING_GLYPH_BOUND,
      x2: MISSING_GLYPH_BOUND,
      y1: MISSING_GLYPH_BOUND,
      y2: MISSING_GLYPH_BOUND,
    },
    path: MISSING_GLYPH_PATH,
    unicode,
    unitsPerEm: font.unitsPerEm,
  },
});

/**
 * Creates renderable drafts for every requested character.
 *
 * @param font - Parsed font used to supply units-per-em for missing rows
 * @param characters - Requested schema characters in display order
 * @param drafts - Successfully extracted drafts
 * @returns Drafts completed with placeholder rows for missing glyphs
 */
export const completeMissingDrafts = (
  font: Font,
  characters: string,
  drafts: ReadonlyArray<SigilGlyphDraft>,
): ReadonlyArray<SigilGlyphDraft> =>
  [...characters].map(
    (unicode) =>
      drafts.find((draft) => draft.glyph.unicode === unicode) ??
      missingGlyphDraft(font, unicode),
  );
