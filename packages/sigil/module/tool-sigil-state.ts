/* eslint-disable max-lines -- Selection validation stays with the pure state API so the tool has one state boundary. */
import {
  findSigilGlyphOption,
  SIGIL_GLYPH_GROUPS,
  type SigilGlyphGroup,
  type SigilGlyphGroupName,
} from "./glyph-catalog.js";
import {
  OSI_LICENSE_OPTIONS,
  type SigilLicenseOption,
} from "./osi-license-catalog.js";
import type {
  SigilExtractionError,
  SigilGlyphDraft,
  SigilGlyphMap,
  SigilGlyphMapping,
} from "./glyph-json.js";
import { createSigilGlyphMap } from "./glyph-name.js";
import { extractSigilGlyphs } from "./extract-glyphs.js";
import type { Font } from "opentype.js";
import type { Result } from "@bruff/utils";

const EMPTY_COUNT = 0;
const FIRST_GLYPH_GROUP_INDEX = 0;
const INITIAL_FONT_LOAD_TOKEN = 0;
const NEXT_FONT_LOAD_TOKEN_OFFSET = 1;

const glyphCountText = (drafts: ReadonlyArray<SigilGlyphDraft>): string =>
  `Glyphs ready: ${drafts.length}`;

const fileNameText = (fileName: string | undefined): string =>
  fileName ?? "No font selected";

const extractDrafts = (
  font: Font | undefined,
  characters: string,
): Pick<ToolSigilState, "drafts" | "errors"> => {
  if (font === undefined) {
    return {
      drafts: [],
      errors: [],
    };
  }

  const extractionReport = extractSigilGlyphs(font, characters);

  return {
    drafts: extractionReport.drafts,
    errors: extractionReport.errors,
  };
};

const firstGlyphGroupName = (
  glyphGroups: ReadonlyArray<SigilGlyphGroup>,
): SigilGlyphGroupName | undefined =>
  glyphGroups[FIRST_GLYPH_GROUP_INDEX]?.groupName;

const createMissingMappedGlyphError = (
  draft: SigilGlyphDraft,
): SigilExtractionError => ({
  message: `Select a glyph mapping for "${draft.glyph.unicode}".`,
  type: "missing-mapped-glyph",
});

const createMissingLicenseError = (
  draft: SigilGlyphDraft,
): SigilExtractionError => ({
  message: `Select a LICENSE value for "${draft.glyph.unicode}".`,
  type: "missing-license",
});

const emptyGlyphCatalogError: SigilExtractionError = {
  message: "No shared glyph catalog options are available.",
  type: "empty-glyph-catalog",
};

const emptyLicenseCatalogError: SigilExtractionError = {
  message: "No OSI license options are available.",
  type: "empty-license-catalog",
};

const hasLicenseValue = (
  licenseOptions: ReadonlyArray<SigilLicenseOption>,
  licenseValue: string,
): boolean =>
  licenseOptions.some((licenseOption) => licenseOption.value === licenseValue);

const selectedLicensesByUnicode = (
  state: ToolSigilState,
): Readonly<Record<string, string>> =>
  Object.fromEntries(
    state.drafts
      .map((draft): readonly [string, string | undefined] => [
        draft.glyph.unicode,
        state.selectedLicensesByUnicode[draft.glyph.unicode] ??
          state.lastSelectedLicense,
      ])
      .filter((entry): entry is readonly [string, string] => {
        const [, licenseValue] = entry;

        return (
          licenseValue !== undefined &&
          hasLicenseValue(state.licenseOptions, licenseValue)
        );
      }),
  );

const stagedGlyphGroupsByUnicode = (
  state: ToolSigilState,
): Readonly<Record<string, SigilGlyphGroupName>> => {
  const defaultGroupName = firstGlyphGroupName(state.glyphGroups);

  return Object.fromEntries(
    state.drafts
      .map((draft): readonly [string, SigilGlyphGroupName | undefined] => [
        draft.glyph.unicode,
        state.stagedGlyphGroupsByUnicode[draft.glyph.unicode] ??
          defaultGroupName,
      ])
      .filter((entry): entry is readonly [string, SigilGlyphGroupName] => {
        const [, groupName] = entry;

        return groupName !== undefined;
      }),
  );
};

const isValidGlyphMapping = (mapping: SigilGlyphMapping): boolean =>
  findSigilGlyphOption(mapping.groupName, mapping.glyphKey)?.glyph ===
  mapping.glyph;

const mappedGlyphErrors = (
  state: ToolSigilState,
): ReadonlyArray<SigilExtractionError> =>
  state.drafts
    .filter((draft) => {
      const selectedGlyph = state.selectedGlyphsByUnicode[draft.glyph.unicode];

      return selectedGlyph === undefined || !isValidGlyphMapping(selectedGlyph);
    })
    .map((draft) => createMissingMappedGlyphError(draft));

const licenseErrors = (
  state: ToolSigilState,
): ReadonlyArray<SigilExtractionError> => {
  const effectiveLicensesByUnicode = selectedLicensesByUnicode(state);

  return state.drafts
    .filter(
      (draft) => effectiveLicensesByUnicode[draft.glyph.unicode] === undefined,
    )
    .map((draft) => createMissingLicenseError(draft));
};

const catalogErrors = (
  state: ToolSigilState,
): ReadonlyArray<SigilExtractionError> => [
  ...(state.drafts.length > EMPTY_COUNT &&
  state.glyphGroups.length === EMPTY_COUNT
    ? [emptyGlyphCatalogError]
    : []),
  ...(state.drafts.length > EMPTY_COUNT &&
  state.licenseOptions.length === EMPTY_COUNT
    ? [emptyLicenseCatalogError]
    : []),
];

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
  stagedGlyphGroupsByUnicode: Readonly<Record<string, SigilGlyphGroupName>>;
  selectedGlyphsByUnicode: Readonly<Record<string, SigilGlyphMapping>>;
  selectedLicensesByUnicode: Readonly<Record<string, string>>;
}>;

/** Creates the initial empty state for the sigil tool. */
export const createToolSigilState = (): ToolSigilState => ({
  characters: "",
  drafts: [],
  errors: [],
  font: undefined,
  fontFileName: undefined,
  fontLoadToken: INITIAL_FONT_LOAD_TOKEN,
  glyphGroups: SIGIL_GLYPH_GROUPS,
  lastSelectedLicense: undefined,
  licenseOptions: OSI_LICENSE_OPTIONS,
  namesByUnicode: {},
  previewFontFamily: "",
  selectedGlyphsByUnicode: {},
  selectedLicensesByUnicode: {},
  stagedGlyphGroupsByUnicode: {},
});

/**
 * Starts a new font selection and clears state derived from the prior font.
 *
 * @param state - Current tool state
 * @param fontFileName - Selected file name, or undefined when cleared
 * @returns The cleared state and load token for async completions
 */
export const startToolSigilFontSelection = (
  state: ToolSigilState,
  fontFileName: string | undefined,
): ToolSigilFontSelection => {
  const fontLoadToken = state.fontLoadToken + NEXT_FONT_LOAD_TOKEN_OFFSET;

  return {
    fontLoadToken,
    state: {
      ...state,
      drafts: [],
      errors: [],
      font: undefined,
      fontFileName,
      fontLoadToken,
      previewFontFamily: "",
    },
  };
};

/**
 * Updates the requested characters and re-extracts glyphs when a font exists.
 *
 * @param state - Current tool state
 * @param characters - User-entered characters
 * @returns Updated tool state
 */
export const setToolSigilCharacters = (
  state: ToolSigilState,
  characters: string,
): ToolSigilState => ({
  ...state,
  characters,
  ...extractDrafts(state.font, characters),
});

/**
 * Stores a user-edited glyph name by source Unicode character.
 *
 * @param state - Current tool state
 * @param unicode - Source glyph Unicode character
 * @param glyphName - User-entered glyph name
 * @returns Updated tool state
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
 * Selects a staged `@bruff/glyph` group for one source character.
 *
 * @param state - Current tool state
 * @param unicode - Source glyph Unicode character
 * @param groupName - Selected glyph catalog group
 * @returns Updated tool state
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
 * Selects a mapped `@bruff/glyph` glyph for one source character.
 *
 * @param state - Current tool state
 * @param unicode - Source glyph Unicode character
 * @param mapping - Selected glyph mapping
 * @returns Updated tool state
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
 * Selects a license for one source character and memorizes it for new rows.
 *
 * @param state - Current tool state
 * @param unicode - Source glyph Unicode character
 * @param licenseValue - Machine-readable selected license value
 * @returns Updated tool state
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

/**
 * Applies a parsed font result when it belongs to the current load token.
 *
 * @param state - Current tool state
 * @param fontLoadToken - Token captured when the async font load started
 * @param fontResult - Parsed font or typed loading errors
 * @returns Updated state, or the unchanged state for stale results
 */
export const applyToolSigilFontLoadResult = (
  state: ToolSigilState,
  fontLoadToken: number,
  fontResult: Result<Font, ReadonlyArray<SigilExtractionError>>,
): ToolSigilState => {
  if (fontLoadToken !== state.fontLoadToken) {
    return state;
  }

  if (fontResult.type === "error") {
    return {
      ...state,
      drafts: [],
      errors: fontResult.error,
      font: undefined,
    };
  }

  return {
    ...state,
    font: fontResult.value,
    ...extractDrafts(fontResult.value, state.characters),
  };
};

/**
 * Applies the preview font family when it belongs to the current load token.
 *
 * @param state - Current tool state
 * @param fontLoadToken - Token captured when preview loading started
 * @param previewFontFamily - Browser font family installed for previews
 * @returns Updated state, or the unchanged state for stale results
 */
export const setToolSigilPreviewFontFamily = (
  state: ToolSigilState,
  fontLoadToken: number,
  previewFontFamily: string,
): ToolSigilState =>
  fontLoadToken === state.fontLoadToken
    ? {
        ...state,
        previewFontFamily,
      }
    : state;

/**
 * Clears the preview font family when the load token is current.
 *
 * @param state - Current tool state
 * @param fontLoadToken - Token captured when preview loading started
 * @returns Updated state, or the unchanged state for stale results
 */
export const clearToolSigilPreviewFontFamily = (
  state: ToolSigilState,
  fontLoadToken: number,
): ToolSigilState => setToolSigilPreviewFontFamily(state, fontLoadToken, "");

/**
 * Selects errors visible to the user, including glyph-name validation errors.
 *
 * @param state - Current tool state
 * @returns Visible extraction and naming errors
 */
export const selectToolSigilVisibleErrors = (
  state: ToolSigilState,
): ReadonlyArray<SigilExtractionError> => {
  const nameResult = createSigilGlyphMap(state.drafts, state.namesByUnicode, {
    licensesByUnicode: selectedLicensesByUnicode(state),
    mappedGlyphsByUnicode: state.selectedGlyphsByUnicode,
  });
  const selectionErrors = [
    ...catalogErrors(state),
    ...mappedGlyphErrors(state),
    ...licenseErrors(state),
  ];

  return nameResult.type === "error"
    ? [...state.errors, ...nameResult.error, ...selectionErrors]
    : [...state.errors, ...selectionErrors];
};

/**
 * Selects the downloadable glyph map result for the current state.
 *
 * @param state - Current tool state
 * @returns Glyph map or typed glyph-name validation errors
 */
export const selectToolSigilDownloadGlyphMap = (
  state: ToolSigilState,
): Result<SigilGlyphMap, ReadonlyArray<SigilExtractionError>> =>
  createSigilGlyphMap(state.drafts, state.namesByUnicode, {
    licensesByUnicode: selectedLicensesByUnicode(state),
    mappedGlyphsByUnicode: state.selectedGlyphsByUnicode,
  });

/**
 * Selects whether the JSON download command should be disabled.
 *
 * @param state - Current tool state
 * @returns True when the current state cannot produce a valid glyph map
 */
export const selectToolSigilDownloadDisabled = (
  state: ToolSigilState,
): boolean =>
  selectToolSigilDownloadGlyphMap(state).type === "error" ||
  mappedGlyphErrors(state).length > EMPTY_COUNT ||
  licenseErrors(state).length > EMPTY_COUNT ||
  catalogErrors(state).length > EMPTY_COUNT ||
  state.drafts.length === EMPTY_COUNT;

/**
 * Creates the render-ready view model for the current state.
 *
 * @param state - Current tool state
 * @returns View model consumed by DOM rendering helpers
 */
export const selectToolSigilViewModel = (
  state: ToolSigilState,
): ToolSigilViewModel => ({
  downloadDisabled: selectToolSigilDownloadDisabled(state),
  drafts: state.drafts,
  errors: selectToolSigilVisibleErrors(state),
  fontFileNameText: fileNameText(state.fontFileName),
  glyphCountText: glyphCountText(state.drafts),
  glyphGroups: state.glyphGroups,
  licenseOptions: state.licenseOptions,
  namesByUnicode: state.namesByUnicode,
  previewFontFamily: state.previewFontFamily,
  selectedGlyphsByUnicode: state.selectedGlyphsByUnicode,
  selectedLicensesByUnicode: selectedLicensesByUnicode(state),
  stagedGlyphGroupsByUnicode: stagedGlyphGroupsByUnicode(state),
});
