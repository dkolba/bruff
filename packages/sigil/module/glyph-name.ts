import { parseSigilGlyphMap } from "@bruff/contracts";
import { error, ok, type Result } from "@bruff/utils";

import {
  requiredSigilGlyphNames,
  type SigilExtractionError,
  type SigilGlyph,
  type SigilGlyphDraft,
  type SigilGlyphMap,
  type SigilGlyphMapping,
  type SigilSourceGlyph,
} from "./glyph-json.js";

const EMPTY_NAME_LENGTH = 0;
const EMPTY_ERROR_COUNT = 0;
const FIRST_CODE_UNIT_INDEX = 0;
const C0_CONTROL_CODE_POINT_MAX = 31;
const DELETE_CONTROL_CODE_POINT = 127;

type DraftSigilGlyphMap = Readonly<Record<string, SigilGlyph>>;

type GlyphMapState = Readonly<{
  errors: ReadonlyArray<SigilExtractionError>;
  glyphMap: DraftSigilGlyphMap;
  glyphNames: ReadonlySet<string>;
}>;

type CreateSigilGlyphInput = Readonly<{
  license: string;
  mappedGlyph: SigilGlyphMapping;
  name: string;
  sourceGlyph: SigilSourceGlyph;
}>;

/** Mapping, license, and required-name selections keyed by source Unicode character. */
export type SigilGlyphMapSelection = Readonly<{
  licensesByUnicode: Readonly<Record<string, string>>;
  mappedGlyphsByUnicode: Readonly<Record<string, SigilGlyphMapping>>;
  requiredNamesByUnicode?: Readonly<Record<string, string>>;
}>;

const createInitialGlyphMapState = (): GlyphMapState => ({
  errors: [],
  glyphMap: {},
  glyphNames: new Set<string>(),
});

const isControlCharacter = (character: string): boolean => {
  const codePoint = character.codePointAt(FIRST_CODE_UNIT_INDEX);

  return (
    codePoint !== undefined &&
    (codePoint <= C0_CONTROL_CODE_POINT_MAX ||
      codePoint === DELETE_CONTROL_CODE_POINT)
  );
};

/**
 * Checks whether a glyph name is valid for use as a JSON key.
 *
 * @param name - User-editable glyph name
 * @returns `true` when `name` is non-empty and has no control characters
 */
export const isValidGlyphName = (name: string): boolean =>
  name.trim().length !== EMPTY_NAME_LENGTH &&
  ![...name].some((character) => isControlCharacter(character));

const invalidGlyphNameError = (glyphName: string): SigilExtractionError => ({
  message: `Invalid glyph name "${glyphName}".`,
  type: "invalid-glyph-name",
});

const duplicateGlyphNameError = (glyphName: string): SigilExtractionError => ({
  message: `Duplicate glyph name "${glyphName}".`,
  type: "duplicate-glyph-name",
});

const issuePath = (path: ReadonlyArray<PropertyKey>): string =>
  path.map(String).join(".");

const invalidGlyphJsonError = (
  path: ReadonlyArray<PropertyKey>,
  message: string,
): SigilExtractionError => ({
  message: `Produced glyph JSON does not match the shared contract at ${issuePath(path)}: ${message}`,
  type: "invalid-glyph-json",
});

const glyphNameErrors = (
  glyphName: string,
  glyphNames: ReadonlySet<string>,
): ReadonlyArray<SigilExtractionError> => [
  ...(isValidGlyphName(glyphName) ? [] : [invalidGlyphNameError(glyphName)]),
  ...(glyphNames.has(glyphName) ? [duplicateGlyphNameError(glyphName)] : []),
];

const addGlyphToMap = (
  glyphMap: DraftSigilGlyphMap,
  glyphName: string,
  glyph: SigilGlyph,
): DraftSigilGlyphMap => ({
  ...glyphMap,
  [glyphName]: glyph,
});

const outputGlyphName = (
  glyphName: string,
  requiredGlyphName: string | undefined,
): string => requiredGlyphName ?? glyphName;

const firstGlyphEntry = (
  glyphMap: DraftSigilGlyphMap,
): SigilGlyph | undefined => Object.values(glyphMap).at(FIRST_CODE_UNIT_INDEX);

const completeRequiredGlyphs = (
  glyphMap: DraftSigilGlyphMap,
): DraftSigilGlyphMap => {
  const fallbackGlyph = firstGlyphEntry(glyphMap);

  return fallbackGlyph === undefined
    ? glyphMap
    : requiredSigilGlyphNames.reduce(
        (completedGlyphMap, requiredGlyphName) => ({
          ...completedGlyphMap,
          [requiredGlyphName]:
            completedGlyphMap[requiredGlyphName] ?? fallbackGlyph,
        }),
        glyphMap,
      );
};

/**
 * Combines source glyph data with the selected shared glyph mapping.
 *
 * @param sourceGlyph - Extracted source-font glyph data
 * @param mappedGlyph - Selected `@bruff/glyph` mapping
 * @param license - Selected machine-readable license value
 * @returns Downloadable sigil glyph payload
 */
export const createSigilGlyph = ({
  license,
  mappedGlyph,
  name,
  sourceGlyph,
}: CreateSigilGlyphInput): SigilGlyph => ({
  ...sourceGlyph,
  LICENSE: license,
  mappedGlyph,
  name,
});

const applyGlyphDraft =
  (
    namesByUnicode: Readonly<Record<string, string>>,
    selection: SigilGlyphMapSelection,
  ) =>
  (state: GlyphMapState, draft: SigilGlyphDraft): GlyphMapState => {
    const glyphName = namesByUnicode[draft.glyph.unicode] ?? draft.defaultName;
    const errors = glyphNameErrors(glyphName, state.glyphNames);
    const hasErrors = errors.length !== EMPTY_ERROR_COUNT;
    const glyphMapping = selection.mappedGlyphsByUnicode[draft.glyph.unicode];
    const license = selection.licensesByUnicode[draft.glyph.unicode];
    const requiredGlyphName =
      selection.requiredNamesByUnicode?.[draft.glyph.unicode];

    return {
      errors: [...state.errors, ...errors],
      glyphMap:
        hasErrors || glyphMapping === undefined || license === undefined
          ? state.glyphMap
          : addGlyphToMap(
              state.glyphMap,
              outputGlyphName(glyphName, requiredGlyphName),
              createSigilGlyph({
                license,
                mappedGlyph: glyphMapping,
                name: glyphName,
                sourceGlyph: draft.glyph,
              }),
            ),
      glyphNames: new Set([...state.glyphNames, glyphName]),
    };
  };

/**
 * Creates the final glyph map from extracted drafts and edited names.
 *
 * @param drafts - Extracted glyph drafts
 * @param namesByUnicode - Edited names keyed by source Unicode character
 * @param selection - Selected mapped glyphs and licenses keyed by source Unicode
 * @returns Glyph map result or validation errors
 */
export const createSigilGlyphMap = (
  drafts: ReadonlyArray<SigilGlyphDraft>,
  namesByUnicode: Readonly<Record<string, string>>,
  selection: SigilGlyphMapSelection,
): Result<SigilGlyphMap, ReadonlyArray<SigilExtractionError>> => {
  const glyphMapState = drafts.reduce(
    applyGlyphDraft(namesByUnicode, selection),
    createInitialGlyphMapState(),
  );

  if (glyphMapState.errors.length !== EMPTY_ERROR_COUNT) {
    return error(glyphMapState.errors);
  }

  const parsedGlyphMap = parseSigilGlyphMap(
    completeRequiredGlyphs(glyphMapState.glyphMap),
  );

  return parsedGlyphMap.type === "ok"
    ? ok(parsedGlyphMap.value)
    : error(
        parsedGlyphMap.error.issues.map((issue) =>
          invalidGlyphJsonError(issue.path, issue.message),
        ),
      );
};
