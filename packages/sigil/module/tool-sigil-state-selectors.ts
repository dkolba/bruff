import type { Result } from "@bruff/utils";

import {
  findSigilGlyphOption,
  type SigilGlyphGroup,
  type SigilGlyphGroupName,
} from "./glyph-catalog.js";
import type {
  SigilExtractionError,
  SigilGlyphDraft,
  SigilGlyphMap,
  SigilGlyphMapping,
} from "./glyph-json.js";
import { createSigilGlyphMap } from "./glyph-name.js";
import type { SigilLicenseOption } from "./osi-license-catalog.js";
import { requiredGlyphSelectionViews } from "./tool-sigil-required-glyph-selection.js";
import {
  type ToolSigilState,
  type ToolSigilViewModel,
} from "./tool-sigil-state-types.js";

const EMPTY_COUNT = 0;
const FIRST_GLYPH_GROUP_INDEX = 0;

const glyphCountText = (drafts: ReadonlyArray<SigilGlyphDraft>): string =>
  `Glyphs ready: ${drafts.length}`;

const fileNameText = (fileName: string | undefined): string =>
  fileName ?? "No font selected";

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

const selectedRequiredCharacters = (
  state: ToolSigilState,
): ReadonlySet<string> =>
  new Set(state.requiredGlyphSelections.map((selection) => selection.unicode));

const selectedRequiredDrafts = (
  state: ToolSigilState,
): ReadonlyArray<SigilGlyphDraft> => {
  const requiredCharacters = selectedRequiredCharacters(state);

  return state.drafts.filter((draft) =>
    requiredCharacters.has(draft.glyph.unicode),
  );
};

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

const invalidRequiredGlyphSelectionCount = (state: ToolSigilState): number =>
  requiredGlyphSelectionViews(
    state.characters,
    state.requiredGlyphSelections,
  ).filter((selection) => !selection.isValid).length;

const requiredNamesByUnicode = (
  state: ToolSigilState,
): Readonly<Record<string, string>> =>
  Object.fromEntries(
    state.requiredGlyphSelections.map((selection) => [
      selection.unicode,
      selection.name,
    ]),
  );

const outputNamesByUnicode = (
  state: ToolSigilState,
): Readonly<Record<string, string>> => ({
  ...requiredNamesByUnicode(state),
  ...state.namesByUnicode,
});

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

/**
 * Selects errors visible to the user, including glyph-name validation errors.
 *
 * @param state - Current tool state
 * @returns Visible extraction and naming errors
 */
const selectToolSigilVisibleErrors = (
  state: ToolSigilState,
): ReadonlyArray<SigilExtractionError> => {
  const nameResult = createSigilGlyphMap(
    selectedRequiredDrafts(state),
    outputNamesByUnicode(state),
    {
      licensesByUnicode: selectedLicensesByUnicode(state),
      mappedGlyphsByUnicode: state.selectedGlyphsByUnicode,
      requiredNamesByUnicode: requiredNamesByUnicode(state),
    },
  );
  const selectionErrors = [
    ...catalogErrors(state),
    ...mappedGlyphErrors(state),
    ...licenseErrors(state),
  ];

  if (state.drafts.length === EMPTY_COUNT) {
    return state.errors;
  }

  if (selectionErrors.length > EMPTY_COUNT) {
    const visibleNameErrors =
      nameResult.type === "error"
        ? nameResult.error.filter(
            (nameError) => nameError.type !== "invalid-glyph-json",
          )
        : [];

    return [...state.errors, ...visibleNameErrors, ...selectionErrors];
  }

  return nameResult.type === "error"
    ? [...state.errors, ...nameResult.error]
    : state.errors;
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
  createSigilGlyphMap(
    selectedRequiredDrafts(state),
    outputNamesByUnicode(state),
    {
      licensesByUnicode: selectedLicensesByUnicode(state),
      mappedGlyphsByUnicode: state.selectedGlyphsByUnicode,
      requiredNamesByUnicode: requiredNamesByUnicode(state),
    },
  );

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
  state.errors.length > EMPTY_COUNT ||
  mappedGlyphErrors(state).length > EMPTY_COUNT ||
  licenseErrors(state).length > EMPTY_COUNT ||
  catalogErrors(state).length > EMPTY_COUNT ||
  invalidRequiredGlyphSelectionCount(state) > EMPTY_COUNT ||
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
  characters: state.characters,
  contractIssues: state.contractIssues,
  downloadDisabled: selectToolSigilDownloadDisabled(state),
  drafts: state.drafts,
  errors: selectToolSigilVisibleErrors(state),
  fontFileNameText: fileNameText(state.fontFileName),
  glyphCountText: glyphCountText(state.drafts),
  glyphGroups: state.glyphGroups,
  licenseOptions: state.licenseOptions,
  namesByUnicode: state.namesByUnicode,
  previewFontFamily: state.previewFontFamily,
  requiredGlyphSelections: requiredGlyphSelectionViews(
    state.characters,
    state.requiredGlyphSelections,
  ),
  schemaOptions: state.schemaOptions,
  selectedGlyphsByUnicode: state.selectedGlyphsByUnicode,
  selectedLicensesByUnicode: selectedLicensesByUnicode(state),
  selectedSchemaId: state.selectedSchemaId,
  stagedGlyphGroupsByUnicode: stagedGlyphGroupsByUnicode(state),
});
