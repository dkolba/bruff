import "./module/register-tool-sigil.js";

export { registerToolSigil } from "./module/register-tool-sigil.js";
export { ToolSigil } from "./module/tool-sigil.js";
export { codePointKey } from "./module/code-point-key.js";
export { extractSigilGlyphs } from "./module/extract-glyphs.js";
export { loadSigilFontFile } from "./module/font-file.js";
export { createSigilGlyphMap, isValidGlyphName } from "./module/glyph-name.js";
export type {
  SigilExtractionError,
  SigilExtractionReport,
  SigilExtractionResult,
  SigilGlyph,
  SigilGlyphBounds,
  SigilGlyphDraft,
  SigilGlyphMap,
} from "./module/glyph-json.js";
