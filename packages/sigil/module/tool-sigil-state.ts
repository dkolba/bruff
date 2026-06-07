/* eslint-disable sort-imports -- Existing state module groups imports by pure schema/catalog dependencies before shell-facing state exports. */
import {
  DEFAULT_SIGIL_SCHEMA_ID,
  findSigilSchemaOption,
  SIGIL_SCHEMA_OPTIONS,
  sigilSchemaCharacters,
  type SigilSchemaId,
  sigilSchemaNamesByUnicode,
  type SigilSchemaOption,
} from "./sigil-schema-catalog.js";
import {
  SIGIL_GLYPH_GROUPS,
  type SigilGlyphGroupName,
} from "./glyph-catalog.js";
import type { SigilExtractionError, SigilGlyphMapping } from "./glyph-json.js";
import type {
  ToolSigilFontSelection,
  ToolSigilState,
} from "./tool-sigil-state-types.js";
import { extractSigilGlyphs } from "./extract-glyphs.js";
import type { Font } from "opentype.js";
import { OSI_LICENSE_OPTIONS } from "./osi-license-catalog.js";
import { completeMissingDrafts } from "./tool-sigil-missing-drafts.js";
import type { Result } from "@bruff/utils";
/* eslint-enable sort-imports */
export {
  selectToolSigilDownloadDisabled,
  selectToolSigilDownloadGlyphMap,
  selectToolSigilViewModel,
  selectToolSigilVisibleErrors,
} from "./tool-sigil-state-selectors.js";
export type {
  ToolSigilFontSelection,
  ToolSigilState,
  ToolSigilViewModel,
} from "./tool-sigil-state-types.js";

const INITIAL_FONT_LOAD_TOKEN = 0;
const NEXT_FONT_LOAD_TOKEN_OFFSET = 1;

const schemaOptionById = (
  schemaId: SigilSchemaId,
): SigilSchemaOption | undefined => {
  const schemaOption = findSigilSchemaOption(SIGIL_SCHEMA_OPTIONS, schemaId);

  return schemaOption.type === "some" ? schemaOption.value : undefined;
};

const extractDrafts = (
  font: Font | undefined,
  characters: string,
): Pick<ToolSigilState, "drafts" | "errors"> => {
  if (font === undefined) {
    return {
      drafts: [],
      errors: [],
    };
  }

  const extractionReport = extractSigilGlyphs(font, characters);

  return {
    drafts: completeMissingDrafts(font, characters, extractionReport.drafts),
    errors: extractionReport.errors,
  };
};

/** Creates the initial empty state for the sigil tool. */
export const createToolSigilState = (): ToolSigilState => {
  const schemaOption = schemaOptionById(DEFAULT_SIGIL_SCHEMA_ID);

  return {
    characters: sigilSchemaCharacters(schemaOption),
    contractIssues: [],
    drafts: [],
    errors: [],
    font: undefined,
    fontFileName: undefined,
    fontLoadToken: INITIAL_FONT_LOAD_TOKEN,
    glyphGroups: SIGIL_GLYPH_GROUPS,
    lastSelectedLicense: undefined,
    licenseOptions: OSI_LICENSE_OPTIONS,
    namesByUnicode: sigilSchemaNamesByUnicode(schemaOption),
    previewFontFamily: "",
    requiredGlyphSelections: [],
    schemaOptions: SIGIL_SCHEMA_OPTIONS,
    selectedGlyphsByUnicode: {},
    selectedLicensesByUnicode: {},
    selectedSchemaId: DEFAULT_SIGIL_SCHEMA_ID,
    stagedGlyphGroupsByUnicode: {},
  };
};

/**
 * Starts a new font selection and clears state derived from the prior font.
 *
 * @param state - Current tool state
 * @param fontFileName - Selected file name, or undefined when cleared
 * @returns The cleared state and load token for async completions
 */
export const startToolSigilFontSelection = (
  state: ToolSigilState,
  fontFileName: string | undefined,
): ToolSigilFontSelection => {
  const fontLoadToken = state.fontLoadToken + NEXT_FONT_LOAD_TOKEN_OFFSET;

  return {
    fontLoadToken,
    state: {
      ...state,
      drafts: [],
      errors: [],
      font: undefined,
      fontFileName,
      fontLoadToken,
      previewFontFamily: "",
    },
  };
};

/**
 * Updates the requested characters and re-extracts glyphs when a font exists.
 *
 * @param state - Current tool state
 * @param characters - User-entered characters
 * @returns Updated tool state
 */
export const setToolSigilCharacters = (
  state: ToolSigilState,
  characters: string,
): ToolSigilState => ({
  ...state,
  characters,
  ...extractDrafts(state.font, characters),
});

/**
 * Selects a concrete contract schema and re-extracts glyphs for its characters.
 *
 * @param state - Current tool state
 * @param schemaId - Concrete schema id selected by the user
 * @returns Updated tool state, or unchanged state for the current or unknown id
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
    ...extractDrafts(state.font, characters),
  };
};

/**
 * Stores a user-edited glyph name by source Unicode character.
 *
 * @param state - Current tool state
 * @param unicode - Source glyph Unicode character
 * @param glyphName - User-entered glyph name
 * @returns Updated tool state
 */
export const setToolSigilGlyphName = (
  state: ToolSigilState,
  unicode: string,
  glyphName: string,
): ToolSigilState => ({
  ...state,
  namesByUnicode: {
    ...state.namesByUnicode,
    [unicode]: glyphName,
  },
});

/**
 * Selects a staged `@bruff/glyph` group for one source character.
 *
 * @param state - Current tool state
 * @param unicode - Source glyph Unicode character
 * @param groupName - Selected glyph catalog group
 * @returns Updated tool state
 */
export const setToolSigilGlyphGroup = (
  state: ToolSigilState,
  unicode: string,
  groupName: SigilGlyphGroupName,
): ToolSigilState => {
  const selectedGlyph = state.selectedGlyphsByUnicode[unicode];
  const selectedGlyphsByUnicode =
    selectedGlyph?.groupName === groupName
      ? state.selectedGlyphsByUnicode
      : Object.fromEntries(
          Object.entries(state.selectedGlyphsByUnicode).filter(
            ([selectedUnicode]) => selectedUnicode !== unicode,
          ),
        );

  return {
    ...state,
    selectedGlyphsByUnicode,
    stagedGlyphGroupsByUnicode: {
      ...state.stagedGlyphGroupsByUnicode,
      [unicode]: groupName,
    },
  };
};

/**
 * Selects a mapped `@bruff/glyph` glyph for one source character.
 *
 * @param state - Current tool state
 * @param unicode - Source glyph Unicode character
 * @param mapping - Selected glyph mapping
 * @returns Updated tool state
 */
export const setToolSigilMappedGlyph = (
  state: ToolSigilState,
  unicode: string,
  mapping: SigilGlyphMapping,
): ToolSigilState => ({
  ...state,
  selectedGlyphsByUnicode: {
    ...state.selectedGlyphsByUnicode,
    [unicode]: mapping,
  },
});

/**
 * Selects a license for one source character and memorizes it for new rows.
 *
 * @param state - Current tool state
 * @param unicode - Source glyph Unicode character
 * @param licenseValue - Machine-readable selected license value
 * @returns Updated tool state
 */
export const setToolSigilLicense = (
  state: ToolSigilState,
  unicode: string,
  licenseValue: string,
): ToolSigilState => ({
  ...state,
  lastSelectedLicense: licenseValue,
  selectedLicensesByUnicode: {
    ...state.selectedLicensesByUnicode,
    [unicode]: licenseValue,
  },
});

/**
 * Applies a parsed font result when it belongs to the current load token.
 *
 * @param state - Current tool state
 * @param fontLoadToken - Token captured when the async font load started
 * @param fontResult - Parsed font or typed loading errors
 * @returns Updated state, or the unchanged state for stale results
 */
export const applyToolSigilFontLoadResult = (
  state: ToolSigilState,
  fontLoadToken: number,
  fontResult: Result<Font, ReadonlyArray<SigilExtractionError>>,
): ToolSigilState => {
  if (fontLoadToken !== state.fontLoadToken) {
    return state;
  }

  if (fontResult.type === "error") {
    return {
      ...state,
      drafts: [],
      errors: fontResult.error,
      font: undefined,
    };
  }

  return {
    ...state,
    font: fontResult.value,
    ...extractDrafts(fontResult.value, state.characters),
  };
};

/**
 * Applies the preview font family when it belongs to the current load token.
 *
 * @param state - Current tool state
 * @param fontLoadToken - Token captured when preview loading started
 * @param previewFontFamily - Browser font family installed for previews
 * @returns Updated state, or the unchanged state for stale results
 */
export const setToolSigilPreviewFontFamily = (
  state: ToolSigilState,
  fontLoadToken: number,
  previewFontFamily: string,
): ToolSigilState =>
  fontLoadToken === state.fontLoadToken
    ? {
        ...state,
        previewFontFamily,
      }
    : state;

/**
 * Clears the preview font family when the load token is current.
 *
 * @param state - Current tool state
 * @param fontLoadToken - Token captured when preview loading started
 * @returns Updated state, or the unchanged state for stale results
 */
export const clearToolSigilPreviewFontFamily = (
  state: ToolSigilState,
  fontLoadToken: number,
): ToolSigilState => setToolSigilPreviewFontFamily(state, fontLoadToken, "");
