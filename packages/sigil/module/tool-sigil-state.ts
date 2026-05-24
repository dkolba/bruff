import type {
  SigilExtractionError,
  SigilGlyphDraft,
  SigilGlyphMap,
} from "./glyph-json.js";
import { createSigilGlyphMap } from "./glyph-name.js";
import { extractSigilGlyphs } from "./extract-glyphs.js";
import type { Font } from "opentype.js";
import type { Result } from "@bruff/utils";

const EMPTY_COUNT = 0;
const INITIAL_FONT_LOAD_TOKEN = 0;
const NEXT_FONT_LOAD_TOKEN_OFFSET = 1;

const glyphCountText = (drafts: ReadonlyArray<SigilGlyphDraft>): string =>
  `Glyphs ready: ${drafts.length}`;

const fileNameText = (fileName: string | undefined): string =>
  fileName ?? "No font selected";

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
    drafts: extractionReport.drafts,
    errors: extractionReport.errors,
  };
};

/** Immutable state owned by the `<tool-sigil>` coordinator. */
export type ToolSigilState = Readonly<{
  characters: string;
  drafts: ReadonlyArray<SigilGlyphDraft>;
  errors: ReadonlyArray<SigilExtractionError>;
  font: Font | undefined;
  fontFileName: string | undefined;
  fontLoadToken: number;
  namesByUnicode: Readonly<Record<string, string>>;
  previewFontFamily: string;
}>;

/** State and token returned when a new font selection starts. */
export type ToolSigilFontSelection = Readonly<{
  fontLoadToken: number;
  state: ToolSigilState;
}>;

/** Render-ready projection of `ToolSigilState`. */
export type ToolSigilViewModel = Readonly<{
  downloadDisabled: boolean;
  drafts: ReadonlyArray<SigilGlyphDraft>;
  errors: ReadonlyArray<SigilExtractionError>;
  fontFileNameText: string;
  glyphCountText: string;
  namesByUnicode: Readonly<Record<string, string>>;
  previewFontFamily: string;
}>;

/** Creates the initial empty state for the sigil tool. */
export const createToolSigilState = (): ToolSigilState => ({
  characters: "",
  drafts: [],
  errors: [],
  font: undefined,
  fontFileName: undefined,
  fontLoadToken: INITIAL_FONT_LOAD_TOKEN,
  namesByUnicode: {},
  previewFontFamily: "",
});

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

/**
 * Selects errors visible to the user, including glyph-name validation errors.
 *
 * @param state - Current tool state
 * @returns Visible extraction and naming errors
 */
export const selectToolSigilVisibleErrors = (
  state: ToolSigilState,
): ReadonlyArray<SigilExtractionError> => {
  const nameResult = createSigilGlyphMap(state.drafts, state.namesByUnicode);

  return nameResult.type === "error"
    ? [...state.errors, ...nameResult.error]
    : state.errors;
};

/**
 * Selects the downloadable glyph map result for the current state.
 *
 * @param state - Current tool state
 * @returns Glyph map or typed glyph-name validation errors
 */
export const selectToolSigilDownloadGlyphMap = (
  state: ToolSigilState,
): Result<SigilGlyphMap, ReadonlyArray<SigilExtractionError>> =>
  createSigilGlyphMap(state.drafts, state.namesByUnicode);

/**
 * Selects whether the JSON download command should be disabled.
 *
 * @param state - Current tool state
 * @returns True when the current state cannot produce a valid glyph map
 */
export const selectToolSigilDownloadDisabled = (
  state: ToolSigilState,
): boolean =>
  selectToolSigilDownloadGlyphMap(state).type === "error" ||
  state.drafts.length === EMPTY_COUNT;

/**
 * Creates the render-ready view model for the current state.
 *
 * @param state - Current tool state
 * @returns View model consumed by DOM rendering helpers
 */
export const selectToolSigilViewModel = (
  state: ToolSigilState,
): ToolSigilViewModel => ({
  downloadDisabled: selectToolSigilDownloadDisabled(state),
  drafts: state.drafts,
  errors: selectToolSigilVisibleErrors(state),
  fontFileNameText: fileNameText(state.fontFileName),
  glyphCountText: glyphCountText(state.drafts),
  namesByUnicode: state.namesByUnicode,
  previewFontFamily: state.previewFontFamily,
});
