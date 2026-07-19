import { selectedRequiredGlyphCharacters } from "../tool-sigil-required-glyph-selection.js";
import type { ToolSigilState } from "../tool-sigil-state-types.js";
import { distinctGraphemes } from "../unicode-graphemes.js";

/** Deduplicates textarea and selected required characters for extraction.
@param characters - Characters requested by the textarea.
@param state - Current tool state.
@returns Unique characters to extract.
*/
export const extractionCharacters = (
  characters: string,
  state: ToolSigilState,
): string =>
  distinctGraphemes(
    `${characters}${selectedRequiredGlyphCharacters(state.requiredGlyphSelections)}`,
  ).join("");
