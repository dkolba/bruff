import type { Result } from "@bruff/utils";
import type { Font } from "opentype.js";

import type { SigilExtractionError } from "../glyph-json.js";
import { extractDrafts } from "../tool-sigil-extract-drafts.js";
import type {
  ToolSigilFontSelection,
  ToolSigilState,
} from "../tool-sigil-state-types.js";
import { extractionCharacters } from "./extraction-characters.js";

const NEXT_FONT_LOAD_TOKEN_OFFSET = 1;

/** Starts a new font selection.
 * @param state - Current tool state.
 * @param fontFileName - Selected file name.
 * @returns Cleared state and async load token.
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

/** Applies a parsed font result.
 * @param state - Current tool state.
 * @param fontLoadToken - Captured load token.
 * @param fontResult - Parsed font result.
 * @returns Updated tool state.
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
    ...extractDrafts(
      fontResult.value,
      extractionCharacters(state.characters, state),
    ),
  };
};

/** Applies a preview font family.
 * @param state - Current tool state.
 * @param fontLoadToken - Captured load token.
 * @param previewFontFamily - Preview font family.
 * @returns Updated tool state.
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

/** Clears the preview font family.
 * @param state - Current tool state.
 * @param fontLoadToken - Captured load token.
 * @returns Updated tool state.
 */
export const clearToolSigilPreviewFontFamily = (
  state: ToolSigilState,
  fontLoadToken: number,
): ToolSigilState => setToolSigilPreviewFontFamily(state, fontLoadToken, "");
