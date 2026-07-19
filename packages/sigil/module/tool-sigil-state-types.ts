import type { Font } from "opentype.js";

import type { SigilGlyphGroup, SigilGlyphGroupName } from "./glyph-catalog.js";
import type {
  RequiredSigilGlyphName,
  SigilExtractionError,
  SigilGlyphDraft,
  SigilGlyphMapping,
} from "./glyph-json.js";
import type { SigilLicenseOption } from "./osi-license-catalog.js";
import type {
  SigilSchemaId,
  SigilSchemaOption,
} from "./sigil-schema-catalog.js";

/** Selected textarea character for one required contract glyph. */
export type RequiredGlyphSelection = Readonly<{
  name: RequiredSigilGlyphName;
  unicode: string;
}>;

/** One select option derived from the textarea. */
export type RequiredGlyphCharacterOption = Readonly<{
  label: string;
  unicode: string;
}>;

/** Render-ready state for one required glyph source-character select. */
export type RequiredGlyphSelectionView = Readonly<{
  isValid: boolean;
  name: RequiredSigilGlyphName;
  options: ReadonlyArray<RequiredGlyphCharacterOption>;
  selectedUnicode: string;
}>;

/** User-visible contract validation issue. */
export type ToolSigilContractIssue = Readonly<{
  message: string;
  path: string;
}>;

/** Immutable state owned by the `<tool-sigil>` coordinator. */
export type ToolSigilState = Readonly<{
  characters: string;
  contractIssues: ReadonlyArray<ToolSigilContractIssue>;
  drafts: ReadonlyArray<SigilGlyphDraft>;
  errors: ReadonlyArray<SigilExtractionError>;
  font: Font | undefined;
  fontFileName: string | undefined;
  fontLoadToken: number;
  namesByUnicode: Readonly<Record<string, string>>;
  previewFontFamily: string;
  requiredGlyphSelections: ReadonlyArray<RequiredGlyphSelection>;
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
  characters: string;
  contractIssues: ReadonlyArray<ToolSigilContractIssue>;
  downloadDisabled: boolean;
  drafts: ReadonlyArray<SigilGlyphDraft>;
  errors: ReadonlyArray<SigilExtractionError>;
  fontFileNameText: string;
  glyphCountText: string;
  glyphGroups: ReadonlyArray<SigilGlyphGroup>;
  licenseOptions: ReadonlyArray<SigilLicenseOption>;
  namesByUnicode: Readonly<Record<string, string>>;
  previewFontFamily: string;
  requiredGlyphSelections: ReadonlyArray<RequiredGlyphSelectionView>;
  schemaOptions: ReadonlyArray<SigilSchemaOption>;
  selectedSchemaId: SigilSchemaId;
  stagedGlyphGroupsByUnicode: Readonly<Record<string, SigilGlyphGroupName>>;
  selectedGlyphsByUnicode: Readonly<Record<string, SigilGlyphMapping>>;
  selectedLicensesByUnicode: Readonly<Record<string, string>>;
}>;
