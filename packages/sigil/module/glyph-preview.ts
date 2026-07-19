import { appendText } from "./dom-text.js";
import type { SigilGlyphDraft } from "./glyph-json.js";

/** Creates a rendered glyph preview using the uploaded font family. */
export const createGlyphPreview = (
  draft: SigilGlyphDraft,
  previewFontFamily: string,
): HTMLElement => {
  const preview = document.createElement("span");
  preview.setAttribute("class", "glyph-preview");
  preview.style.fontFamily = previewFontFamily;
  appendText(preview, draft.glyph.unicode);

  return preview;
};
