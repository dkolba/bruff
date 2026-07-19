import { SIGIL_GLYPH_GROUPS } from "../glyph-catalog.js";
import { OSI_LICENSE_OPTIONS } from "../osi-license-catalog.js";
import {
  DEFAULT_SIGIL_SCHEMA_ID,
  SIGIL_SCHEMA_OPTIONS,
  sigilSchemaCharacters,
  sigilSchemaNamesByUnicode,
} from "../sigil-schema-catalog.js";
import { defaultRequiredGlyphSelections } from "../tool-sigil-required-glyph-selection.js";
import type { ToolSigilState } from "../tool-sigil-state-types.js";
import { schemaOptionById } from "./schema-option.js";

const INITIAL_FONT_LOAD_TOKEN = 0;

/** Creates the initial empty state for the sigil tool.
@returns Initial tool state.
*/
export const createToolSigilState = (): ToolSigilState => {
  const schemaOption = schemaOptionById(DEFAULT_SIGIL_SCHEMA_ID);

  return {
    characters: sigilSchemaCharacters(schemaOption),
    contractIssues: [],
    drafts: [],
    errors: [],
    font: undefined,
    fontFileName: undefined,
    fontLoadToken: INITIAL_FONT_LOAD_TOKEN,
    glyphGroups: SIGIL_GLYPH_GROUPS,
    lastSelectedLicense: undefined,
    licenseOptions: OSI_LICENSE_OPTIONS,
    namesByUnicode: sigilSchemaNamesByUnicode(schemaOption),
    previewFontFamily: "",
    requiredGlyphSelections: defaultRequiredGlyphSelections(schemaOption),
    schemaOptions: SIGIL_SCHEMA_OPTIONS,
    selectedGlyphsByUnicode: {},
    selectedLicensesByUnicode: {},
    selectedSchemaId: DEFAULT_SIGIL_SCHEMA_ID,
    stagedGlyphGroupsByUnicode: {},
  };
};
