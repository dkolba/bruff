import type { SigilGlyphMap } from "./glyph-json.js";

const JSON_INDENT_SPACES = 2;
const JSON_DOWNLOAD_FILE_NAME = "sigil.json";
const JSON_MIME_TYPE = "application/json";

const createJsonBlob = (glyphMap: SigilGlyphMap): Blob =>
  new Blob([JSON.stringify(glyphMap, null, JSON_INDENT_SPACES)], {
    type: JSON_MIME_TYPE,
  });

/**
 * Creates and revokes a temporary JSON download link for a glyph map.
 */
export const triggerJsonDownload = (glyphMap: SigilGlyphMap): void => {
  const objectUrl = URL.createObjectURL(createJsonBlob(glyphMap));
  const downloadLink = document.createElement("a");
  downloadLink.href = objectUrl;
  downloadLink.download = JSON_DOWNLOAD_FILE_NAME;
  document.body.append(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  URL.revokeObjectURL(objectUrl);
};
