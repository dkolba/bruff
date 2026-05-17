/** Extracted glyph bounds in font units. */
export type SigilGlyphBounds = Readonly<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}>;

/** Compact glyph payload suitable for future runtime rendering. */
export type SigilGlyph = Readonly<{
  unicode: string;
  advanceWidth: number;
  unitsPerEm: number;
  bounds: SigilGlyphBounds;
  path: string;
}>;

/** Extracted glyph before the user-editable name is applied. */
export type SigilGlyphDraft = Readonly<{
  defaultName: string;
  glyph: SigilGlyph;
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
    | "empty-input"
    | "invalid-font"
    | "invalid-glyph-name"
    | "missing-glyph"
    | "unsupported-font-format";
  message: string;
}>;
