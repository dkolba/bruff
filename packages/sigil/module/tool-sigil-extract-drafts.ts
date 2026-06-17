import type { Font } from "opentype.js";

import { extractSigilGlyphs } from "./extract-glyphs.js";
import { completeMissingDrafts } from "./tool-sigil-missing-drafts.js";
import type { ToolSigilState } from "./tool-sigil-state-types.js";

/**
 * Extracts renderable drafts for requested characters.
 *
 * @param font - Current parsed font, when available
 * @param characters - Requested source characters
 * @returns Extracted drafts and typed extraction errors
 */
export const extractDrafts = (
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
