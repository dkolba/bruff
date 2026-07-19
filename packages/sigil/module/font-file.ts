import { error, ok, type Result } from "@bruff/utils";
import { type Font, parse } from "opentype.js";

import type { SigilExtractionError } from "./glyph-json.js";

const WOFF2_EXTENSION = ".woff2";

const createInvalidFontError = (fontFile: File): SigilExtractionError => ({
  message: `Could not parse "${fontFile.name}" as a supported font.`,
  type: "invalid-font",
});

const unsupportedWoff2Error: SigilExtractionError = {
  message: "WOFF2 fonts are not supported.",
  type: "unsupported-font-format",
};

const isWoff2File = (fontFile: File): boolean =>
  fontFile.name.toLowerCase().endsWith(WOFF2_EXTENSION);

/**
Loads a user-supplied font file into an OpenType font.

@param fontFile - Browser file selected by the user
@returns Parsed font or a typed loading error
*/
export const loadSigilFontFile = async (
  fontFile: File,
): Promise<Result<Font, ReadonlyArray<SigilExtractionError>>> => {
  if (isWoff2File(fontFile)) {
    return error([unsupportedWoff2Error]);
  }

  try {
    const fontBuffer = await fontFile.arrayBuffer();
    return ok(parse(fontBuffer));
  } catch {
    return error([createInvalidFontError(fontFile)]);
  }
};
