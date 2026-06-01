import "./module/register-tool-sigil.js";

export { registerToolSigil } from "./module/register-tool-sigil.js";
export { ToolSigil } from "./module/tool-sigil.js";
export { codePointKey } from "./module/code-point-key.js";
export { extractSigilGlyphs } from "./module/extract-glyphs.js";
export { loadSigilFontFile } from "./module/font-file.js";
export {
  createSigilGlyph,
  createSigilGlyphMap,
  isValidGlyphName,
} from "./module/glyph-name.js";
export type { SigilGlyphMapSelection } from "./module/glyph-name.js";
export {
  SIGIL_GLYPH_GROUPS,
  findSigilGlyphGroup,
  findSigilGlyphOption,
} from "./module/glyph-catalog.js";
export type {
  SigilExtractionError,
  SigilExtractionReport,
  SigilExtractionResult,
  SigilGlyph,
  SigilGlyphBounds,
  SigilGlyphDraft,
  SigilGlyphMap,
  SigilGlyphMapping,
  SigilSourceGlyph,
} from "./module/glyph-json.js";
export type {
  SigilGlyphGroup,
  SigilGlyphGroupName,
  SigilGlyphOption,
} from "./module/glyph-catalog.js";
export type { SigilLicenseOption } from "./module/osi-license-catalog.js";
