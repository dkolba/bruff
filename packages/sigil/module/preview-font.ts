const INITIAL_PREVIEW_FONT_INDEX = 0;
const NEXT_PREVIEW_FONT_OFFSET = 1;
const PREVIEW_FONT_FAMILY_PREFIX = "tool-sigil-preview-font";

/** Browser font face state owned by the sigil tool shell. */
export type PreviewFontState = Readonly<{
  fontFace: FontFace | undefined;
  fontFamily: string;
  fontIndex: number;
}>;

/** Preview font family allocation result. */
export type PreviewFontAllocation = Readonly<{
  fontFamily: string;
  fontState: PreviewFontState;
}>;

/** Creates empty preview font state. */
export const createPreviewFontState = (): PreviewFontState => ({
  fontFace: undefined,
  fontFamily: "",
  fontIndex: INITIAL_PREVIEW_FONT_INDEX,
});

/** Deletes the active preview font face from the document font set. */
export const clearPreviewFontFace = (
  fontState: PreviewFontState,
): PreviewFontState => {
  if (fontState.fontFace !== undefined) {
    document.fonts.delete(fontState.fontFace);
  }

  return {
    fontFace: undefined,
    fontFamily: "",
    fontIndex: fontState.fontIndex,
  };
};

/** Allocates the next unique preview font family. */
export const allocatePreviewFontFamily = (
  fontState: PreviewFontState,
): PreviewFontAllocation => {
  const fontIndex = fontState.fontIndex + NEXT_PREVIEW_FONT_OFFSET;
  const fontFamily = `${PREVIEW_FONT_FAMILY_PREFIX}-${fontIndex}`;

  return {
    fontFamily,
    fontState: {
      fontFace: undefined,
      fontFamily,
      fontIndex,
    },
  };
};

/** Loads a font file into a browser FontFace for glyph previews. */
export const loadPreviewFontFace = async (
  fontFile: File,
  fontFamily: string,
): Promise<FontFace> => {
  const fontBuffer = await fontFile.arrayBuffer();
  const fontFace = new FontFace(fontFamily, fontBuffer);
  return fontFace.load();
};

/** Adds a loaded preview font face to the document font set. */
export const installPreviewFontFace = (
  fontState: PreviewFontState,
  fontFace: FontFace,
): PreviewFontState => {
  document.fonts.add(fontFace);

  return {
    ...fontState,
    fontFace,
  };
};
