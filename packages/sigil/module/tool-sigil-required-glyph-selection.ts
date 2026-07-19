import type { SigilSchemaOption } from "./sigil-schema-catalog.js";
import type {
  RequiredGlyphCharacterOption,
  RequiredGlyphSelection,
  RequiredGlyphSelectionView,
} from "./tool-sigil-state-types.js";
import { distinctGraphemes } from "./unicode-graphemes.js";

/**
 * Creates one option for each distinct typed character.
 *
 * @param characters - User-entered candidate characters
 * @returns Select options in first-seen character order
 */
export const requiredGlyphCharacterOptions = (
  characters: string,
): ReadonlyArray<RequiredGlyphCharacterOption> =>
  distinctGraphemes(characters).map((unicode) => ({
    label: unicode,
    unicode,
  }));

/**
 * Creates default required glyph selections for a schema.
 *
 * @param schemaOption - Selected schema option
 * @returns Required glyph selections using each schema default character
 */
export const defaultRequiredGlyphSelections = (
  schemaOption: SigilSchemaOption | undefined,
): ReadonlyArray<RequiredGlyphSelection> =>
  schemaOption?.requiredGlyphs.map((glyph) => ({
    name: glyph.name,
    unicode: glyph.defaultUnicode,
  })) ?? [];

/**
 * Projects required glyph selections for rendering.
 *
 * @param characters - User-entered candidate characters
 * @param selections - Current required glyph selections
 * @returns Render-ready required glyph selection views
 */
const hasRequiredGlyphSelectionCharacter = (
  options: ReadonlyArray<RequiredGlyphCharacterOption>,
  unicode: string,
): boolean => options.some((option) => option.unicode === unicode);

export const requiredGlyphSelectionViews = (
  characters: string,
  selections: ReadonlyArray<RequiredGlyphSelection>,
): ReadonlyArray<RequiredGlyphSelectionView> => {
  const options = requiredGlyphCharacterOptions(characters);

  return selections.map((selection) => ({
    isValid: hasRequiredGlyphSelectionCharacter(options, selection.unicode),
    name: selection.name,
    options,
    selectedUnicode: selection.unicode,
  }));
};

/**
 * Selects characters currently assigned to required glyphs.
 *
 * @param selections - Current required glyph selections
 * @returns Selected source characters
 */
export const selectedRequiredGlyphCharacters = (
  selections: ReadonlyArray<RequiredGlyphSelection>,
): string => selections.map((selection) => selection.unicode).join("");
