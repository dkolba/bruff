/** Extracted glyph bounds in font units. */
export type SigilGlyphBounds = Readonly<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}>;

/** Extracted source-font glyph data before a game glyph mapping is selected. */
export type SigilSourceGlyph = Readonly<{
  unicode: string;
  advanceWidth: number;
  unitsPerEm: number;
  bounds: SigilGlyphBounds;
  path: string;
}>;

/** Selected `@bruff/glyph` mapping for one source Unicode character. */
export type SigilGlyphMapping = Readonly<{
  groupName: string;
  glyphKey: string;
  glyph: string;
}>;

/** Compact glyph payload suitable for future runtime rendering. */
export type SigilGlyph = Readonly<
  SigilSourceGlyph & {
    mappedGlyph: SigilGlyphMapping;
    LICENSE: string;
  }
>;

/** Extracted glyph before the user-editable name is applied. */
export type SigilGlyphDraft = Readonly<{
  defaultName: string;
  glyph: SigilSourceGlyph;
}>;

/** Extraction report that can carry valid drafts and non-fatal errors together. */
export type SigilExtractionReport = Readonly<{
  drafts: ReadonlyArray<SigilGlyphDraft>;
  errors: ReadonlyArray<SigilExtractionError>;
}>;

/** Transitional extraction result carrying both report and legacy Result fields. */
export type SigilExtractionResult =
  | Readonly<
      SigilExtractionReport & {
        type: "ok";
        value: ReadonlyArray<SigilGlyphDraft>;
      }
    >
  | Readonly<
      SigilExtractionReport & {
        type: "error";
        error: ReadonlyArray<SigilExtractionError>;
      }
    >;

/** Downloadable glyph JSON keyed by user-editable glyph names. */
export type SigilGlyphMap = Readonly<Record<string, SigilGlyph>>;

/** User-facing extraction failure. */
export type SigilExtractionError = Readonly<{
  type:
    | "download-failed"
    | "duplicate-glyph-name"
    | "empty-glyph-catalog"
    | "empty-license-catalog"
    | "empty-input"
    | "invalid-font"
    | "invalid-glyph-name"
    | "missing-license"
    | "missing-glyph"
    | "missing-mapped-glyph"
    | "unsupported-font-format";
  message: string;
}>;
