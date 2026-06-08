/* eslint-disable sort-imports -- State split keeps dependency groups readable. */
import type { ToolSigilState } from "../tool-sigil-state-types.js";
import { selectedRequiredGlyphCharacters } from "../tool-sigil-required-glyph-selection.js";

/** Combines textarea and selected required glyph characters for extraction.
 * @param characters - Characters requested by the textarea.
 * @param state - Current tool state.
 * @returns Unique characters to extract.
 */
export const extractionCharacters = (
  characters: string,
  state: ToolSigilState,
): string =>
  [
    ...new Set(
      `${characters}${selectedRequiredGlyphCharacters(state.requiredGlyphSelections)}`,
    ),
  ].join("");
