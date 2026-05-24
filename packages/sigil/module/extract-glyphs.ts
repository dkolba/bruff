import type { Font, Glyph } from "opentype.js";
import type {
  SigilExtractionError,
  SigilExtractionResult,
  SigilGlyphDraft,
} from "./glyph-json.js";
import { codePointKey } from "./code-point-key.js";

const EMPTY_INPUT_LENGTH = 0;
const GLYPH_PATH_DECIMAL_PLACES = 2;

/** Partitioned extraction state for selected glyphs. */
type GlyphExtractionState = Readonly<{
  drafts: ReadonlyArray<SigilGlyphDraft>;
  errors: ReadonlyArray<SigilExtractionError>;
}>;

const emptyInputError: SigilExtractionError = {
  message: "Enter at least one character to extract.",
  type: "empty-input",
};

const createMissingGlyphError = (character: string): SigilExtractionError => ({
  message: `Missing glyph for "${character}".`,
  type: "missing-glyph",
});

const distinctCharacters = (characters: string): ReadonlyArray<string> => [
  ...new Set(characters),
];

const glyphPath = (glyph: Glyph): string =>
  glyph.path.toPathData(GLYPH_PATH_DECIMAL_PLACES);

const glyphDraft = (
  font: Font,
  character: string,
  glyph: Glyph,
): SigilGlyphDraft => {
  const bounds = glyph.getBoundingBox();

  return {
    defaultName: codePointKey(character),
    glyph: {
      advanceWidth: font.getAdvanceWidth(character, font.unitsPerEm),
      bounds: {
        x1: bounds.x1,
        x2: bounds.x2,
        y1: bounds.y1,
        y2: bounds.y2,
      },
      path: glyphPath(glyph),
      unicode: character,
      unitsPerEm: font.unitsPerEm,
    },
  };
};

const extractCharacter = (
  font: Font,
  extractionState: GlyphExtractionState,
  character: string,
): GlyphExtractionState => {
  if (!font.hasChar(character)) {
    return {
      drafts: extractionState.drafts,
      errors: [...extractionState.errors, createMissingGlyphError(character)],
    };
  }

  return {
    drafts: [
      ...extractionState.drafts,
      glyphDraft(font, character, font.charToGlyph(character)),
    ],
    errors: extractionState.errors,
  };
};

const extractionOk = (
  drafts: ReadonlyArray<SigilGlyphDraft>,
): SigilExtractionResult => ({
  drafts,
  errors: [],
  type: "ok",
  value: drafts,
});

const extractionError = (
  drafts: ReadonlyArray<SigilGlyphDraft>,
  errors: ReadonlyArray<SigilExtractionError>,
): SigilExtractionResult => ({
  drafts,
  error: errors,
  errors,
  type: "error",
});

/**
 * Extracts selected font glyphs into sigil glyph drafts.
 *
 * @param font - Parsed OpenType font
 * @param characters - User-entered characters to extract
 * @returns Extracted drafts with any user-visible extraction errors
 */
export const extractSigilGlyphs = (
  font: Font,
  characters: string,
): SigilExtractionResult => {
  const uniqueCharacters = distinctCharacters(characters);
  if (uniqueCharacters.length === EMPTY_INPUT_LENGTH) {
    return extractionError([], [emptyInputError]);
  }

  const extractionState = uniqueCharacters.reduce<GlyphExtractionState>(
    (currentExtractionState, character) =>
      extractCharacter(font, currentExtractionState, character),
    { drafts: [], errors: [] },
  );

  return extractionState.errors.length === EMPTY_INPUT_LENGTH
    ? extractionOk(extractionState.drafts)
    : extractionError(extractionState.drafts, extractionState.errors);
};
