import type { SigilSourceGlyph } from "@bruff/contracts";

export type {
  RequiredSigilGlyphName,
  SigilGlyph,
  SigilGlyphBounds,
  SigilGlyphMap,
  SigilGlyphMapping,
  SigilSourceGlyph,
} from "@bruff/contracts";
export { requiredSigilGlyphNames } from "@bruff/contracts";

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

/** User-facing extraction failure. */
export type SigilExtractionError = Readonly<{
  type:
    | "download-failed"
    | "duplicate-glyph-name"
    | "empty-glyph-catalog"
    | "empty-license-catalog"
    | "empty-input"
    | "invalid-font"
    | "invalid-glyph-json"
    | "invalid-glyph-name"
    | "missing-license"
    | "missing-glyph"
    | "missing-mapped-glyph"
    | "unsupported-font-format";
  message: string;
}>;
