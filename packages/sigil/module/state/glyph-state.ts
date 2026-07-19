import type { SigilGlyphGroupName } from "../glyph-catalog.js";
import type { SigilGlyphMapping } from "../glyph-json.js";
import type { ToolSigilState } from "../tool-sigil-state-types.js";

/**
 * Stores an output glyph name.
 * @param state - Current tool state.
 * @param Unicode - Source character.
 * @param glyphName - Output glyph name.
 * @returns Updated tool state.
 */
export const setToolSigilGlyphName = (
  state: ToolSigilState,
  unicode: string,
  glyphName: string,
): ToolSigilState => ({
  ...state,
  namesByUnicode: {
    ...state.namesByUnicode,
    [unicode]: glyphName,
  },
});

/**
 * Stages a glyph catalog group.
 * @param state - Current tool state.
 * @param Unicode - Source character.
 * @param groupName - Glyph catalog group.
 * @returns Updated tool state.
 */
export const setToolSigilGlyphGroup = (
  state: ToolSigilState,
  unicode: string,
  groupName: SigilGlyphGroupName,
): ToolSigilState => {
  const selectedGlyph = state.selectedGlyphsByUnicode[unicode];
  const selectedGlyphsByUnicode =
    selectedGlyph?.groupName === groupName
      ? state.selectedGlyphsByUnicode
      : Object.fromEntries(
          Object.entries(state.selectedGlyphsByUnicode).filter(
            ([selectedUnicode]) => selectedUnicode !== unicode,
          ),
        );

  return {
    ...state,
    selectedGlyphsByUnicode,
    stagedGlyphGroupsByUnicode: {
      ...state.stagedGlyphGroupsByUnicode,
      [unicode]: groupName,
    },
  };
};

/**
 * Selects a mapped glyph.
 * @param state - Current tool state.
 * @param Unicode - Source character.
 * @param mapping - Selected glyph mapping.
 * @returns Updated tool state.
 */
export const setToolSigilMappedGlyph = (
  state: ToolSigilState,
  unicode: string,
  mapping: SigilGlyphMapping,
): ToolSigilState => ({
  ...state,
  selectedGlyphsByUnicode: {
    ...state.selectedGlyphsByUnicode,
    [unicode]: mapping,
  },
});

/**
 * Selects a license.
 * @param state - Current tool state.
 * @param Unicode - Source character.
 * @param licenseValue - License value.
 * @returns Updated tool state.
 */
export const setToolSigilLicense = (
  state: ToolSigilState,
  unicode: string,
  licenseValue: string,
): ToolSigilState => ({
  ...state,
  lastSelectedLicense: licenseValue,
  selectedLicensesByUnicode: {
    ...state.selectedLicensesByUnicode,
    [unicode]: licenseValue,
  },
});
