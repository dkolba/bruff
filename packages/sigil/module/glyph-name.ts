import { error, ok, type Result } from "@bruff/utils";
import type {
  SigilExtractionError,
  SigilGlyph,
  SigilGlyphDraft,
  SigilGlyphMap,
} from "./glyph-json.js";

const EMPTY_NAME_LENGTH = 0;
const EMPTY_ERROR_COUNT = 0;
const FIRST_CODE_UNIT_INDEX = 0;
const C0_CONTROL_CODE_POINT_MAX = 31;
const DELETE_CONTROL_CODE_POINT = 127;

type GlyphMapState = Readonly<{
  errors: ReadonlyArray<SigilExtractionError>;
  glyphMap: SigilGlyphMap;
  glyphNames: ReadonlySet<string>;
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

const glyphNameErrors = (
  glyphName: string,
  glyphNames: ReadonlySet<string>,
): ReadonlyArray<SigilExtractionError> => [
  ...(isValidGlyphName(glyphName) ? [] : [invalidGlyphNameError(glyphName)]),
  ...(glyphNames.has(glyphName) ? [duplicateGlyphNameError(glyphName)] : []),
];

const addGlyphToMap = (
  glyphMap: SigilGlyphMap,
  glyphName: string,
  glyph: SigilGlyph,
): SigilGlyphMap => ({
  ...glyphMap,
  [glyphName]: glyph,
});

const applyGlyphDraft =
  (namesByUnicode: Readonly<Record<string, string>>) =>
  (state: GlyphMapState, draft: SigilGlyphDraft): GlyphMapState => {
    const glyphName = namesByUnicode[draft.glyph.unicode] ?? draft.defaultName;
    const errors = glyphNameErrors(glyphName, state.glyphNames);
    const hasErrors = errors.length !== EMPTY_ERROR_COUNT;

    return {
      errors: [...state.errors, ...errors],
      glyphMap: hasErrors
        ? state.glyphMap
        : addGlyphToMap(state.glyphMap, glyphName, draft.glyph),
      glyphNames: new Set([...state.glyphNames, glyphName]),
    };
  };

/**
 * Creates the final glyph map from extracted drafts and edited names.
 *
 * @param drafts - Extracted glyph drafts
 * @param namesByUnicode - Edited names keyed by source Unicode character
 * @returns Glyph map result or validation errors
 */
export const createSigilGlyphMap = (
  drafts: ReadonlyArray<SigilGlyphDraft>,
  namesByUnicode: Readonly<Record<string, string>>,
): Result<SigilGlyphMap, ReadonlyArray<SigilExtractionError>> => {
  const glyphMapState = drafts.reduce(
    applyGlyphDraft(namesByUnicode),
    createInitialGlyphMapState(),
  );

  return glyphMapState.errors.length === EMPTY_ERROR_COUNT
    ? ok(glyphMapState.glyphMap)
    : error(glyphMapState.errors);
};
