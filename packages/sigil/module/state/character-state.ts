/* eslint-disable sort-imports -- State split keeps dependency groups readable. */
import {
  sigilSchemaCharacters,
  type SigilSchemaId,
  sigilSchemaNamesByUnicode,
} from "../sigil-schema-catalog.js";
import type { ToolSigilState } from "../tool-sigil-state-types.js";
import { extractDrafts } from "../tool-sigil-extract-drafts.js";
import { extractionCharacters } from "./extraction-characters.js";
import { schemaOptionById } from "./schema-option.js";

/** Updates editable characters.
 * @param state - Current tool state.
 * @param characters - Characters requested for extraction.
 * @returns Updated tool state.
 */
export const setToolSigilCharacters = (
  state: ToolSigilState,
  characters: string,
): ToolSigilState => ({
  ...state,
  characters,
  contractIssues: [],
  ...extractDrafts(state.font, extractionCharacters(characters, state)),
});

/** Updates a required schema glyph.
 * @param state - Current tool state.
 * @param name - Required glyph name.
 * @param unicode - Selected source character.
 * @returns Updated tool state.
 */
export const setToolSigilRequiredGlyphCharacter = (
  state: ToolSigilState,
  name: string,
  unicode: string,
): ToolSigilState => {
  const currentSelection = state.requiredGlyphSelections.find(
    (selection) => selection.name === name,
  );

  if (currentSelection?.unicode === unicode) {
    return state;
  }

  const requiredGlyphSelections = state.requiredGlyphSelections.map(
    (selection) =>
      selection.name === name ? { ...selection, unicode } : selection,
  );
  const nextState = { ...state, contractIssues: [], requiredGlyphSelections };

  return {
    ...nextState,
    ...extractDrafts(
      state.font,
      extractionCharacters(state.characters, nextState),
    ),
  };
};

/** Selects a schema.
 * @param state - Current tool state.
 * @param schemaId - Schema identifier to select.
 * @returns Updated tool state.
 */
export const setToolSigilSchema = (
  state: ToolSigilState,
  schemaId: SigilSchemaId,
): ToolSigilState => {
  if (schemaId === state.selectedSchemaId) {
    return state;
  }

  const schemaOption = schemaOptionById(schemaId);
  if (schemaOption === undefined) {
    return state;
  }

  const characters = sigilSchemaCharacters(schemaOption);

  return {
    ...state,
    characters,
    namesByUnicode: sigilSchemaNamesByUnicode(schemaOption),
    selectedSchemaId: schemaId,
    ...extractDrafts(state.font, extractionCharacters(characters, state)),
  };
};
