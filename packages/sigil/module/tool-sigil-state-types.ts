import type {
  SigilExtractionError,
  SigilGlyphDraft,
  SigilGlyphMapping,
} from "./glyph-json.js";
import type { SigilGlyphGroup, SigilGlyphGroupName } from "./glyph-catalog.js";
import type { Font } from "opentype.js";
import type { SigilLicenseOption } from "./osi-license-catalog.js";
import type { SigilSchemaId, SigilSchemaOption } from "./sigil-schema-catalog.js";

/** Immutable state owned by the `<tool-sigil>` coordinator. */
export type ToolSigilState = Readonly<{
  characters: string;
  drafts: ReadonlyArray<SigilGlyphDraft>;
  errors: ReadonlyArray<SigilExtractionError>;
  font: Font | undefined;
  fontFileName: string | undefined;
  fontLoadToken: number;
  namesByUnicode: Readonly<Record<string, string>>;
  previewFontFamily: string;
  schemaOptions: ReadonlyArray<SigilSchemaOption>;
  selectedSchemaId: SigilSchemaId;
  stagedGlyphGroupsByUnicode: Readonly<Record<string, SigilGlyphGroupName>>;
  selectedGlyphsByUnicode: Readonly<Record<string, SigilGlyphMapping>>;
  selectedLicensesByUnicode: Readonly<Record<string, string>>;
  lastSelectedLicense: string | undefined;
  glyphGroups: ReadonlyArray<SigilGlyphGroup>;
  licenseOptions: ReadonlyArray<SigilLicenseOption>;
}>;

/** State and token returned when a new font selection starts. */
export type ToolSigilFontSelection = Readonly<{
  fontLoadToken: number;
  state: ToolSigilState;
}>;

/** Render-ready projection of `ToolSigilState`. */
export type ToolSigilViewModel = Readonly<{
  downloadDisabled: boolean;
  drafts: ReadonlyArray<SigilGlyphDraft>;
  errors: ReadonlyArray<SigilExtractionError>;
  fontFileNameText: string;
  glyphCountText: string;
  glyphGroups: ReadonlyArray<SigilGlyphGroup>;
  licenseOptions: ReadonlyArray<SigilLicenseOption>;
  namesByUnicode: Readonly<Record<string, string>>;
  previewFontFamily: string;
  schemaOptions: ReadonlyArray<SigilSchemaOption>;
  selectedSchemaId: SigilSchemaId;
  stagedGlyphGroupsByUnicode: Readonly<Record<string, SigilGlyphGroupName>>;
  selectedGlyphsByUnicode: Readonly<Record<string, SigilGlyphMapping>>;
  selectedLicensesByUnicode: Readonly<Record<string, string>>;
}>;
