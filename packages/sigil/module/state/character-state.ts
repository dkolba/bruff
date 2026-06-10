/* eslint-disable sort-imports -- State split keeps dependency groups readable. */
import {
  sigilSchemaCharacters,
  type SigilSchemaId,
  sigilSchemaNamesByUnicode,
} from "../sigil-schema-catalog.js";
import type {
  RequiredGlyphSelection,
  ToolSigilState,
} from "../tool-sigil-state-types.js";
import { extractDrafts } from "../tool-sigil-extract-drafts.js";
import { extractionCharacters } from "./extraction-characters.js";
import { schemaOptionById } from "./schema-option.js";
import { distinctGraphemes, segmentGraphemes } from "../unicode-graphemes.js";

const hasRequiredGraphemeCount = (
  characters: string,
  selections: ReadonlyArray<RequiredGlyphSelection>,
): boolean => segmentGraphemes(characters).length >= selections.length;

const selectionUnicode = (
  graphemes: ReadonlyArray<string>,
  selectionIndex: number,
  fallbackUnicode: string,
): string => {
  const grapheme = graphemes[selectionIndex];

  return grapheme === undefined ? fallbackUnicode : grapheme;
};

/** Maps required glyph selections to typed characters by schema order. */
const requiredGlyphSelectionsForCharacters = (
  characters: string,
  selections: ReadonlyArray<RequiredGlyphSelection>,
): ReadonlyArray<RequiredGlyphSelection> => {
  const graphemes = distinctGraphemes(characters);

  if (!hasRequiredGraphemeCount(characters, selections)) {
    return selections;
  }

  return selections.map((selection, selectionIndex) => ({
    ...selection,
    unicode: selectionUnicode(graphemes, selectionIndex, selection.unicode),
  }));
};

/** Updates editable characters.
 * @param state - Current tool state.
 * @param characters - Characters requested for extraction.
 * @returns Updated tool state.
 */
export const setToolSigilCharacters = (
  state: ToolSigilState,
  characters: string,
): ToolSigilState => {
  const requiredGlyphSelections = requiredGlyphSelectionsForCharacters(
    characters,
    state.requiredGlyphSelections,
  );

  const nextState = {
    ...state,
    characters,
    contractIssues: [],
    requiredGlyphSelections,
  };

  return {
    ...nextState,
    ...extractDrafts(state.font, extractionCharacters(characters, nextState)),
  };
};

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
