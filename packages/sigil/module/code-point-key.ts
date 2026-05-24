const FIRST_CODE_UNIT_INDEX = 0;
const HEX_RADIX = 16;

/**
 * Creates the deterministic default glyph key for a Unicode code point.
 *
 * @param character - Character to name
 * @returns Lowercase `u<hex-code-point>` key for the first code point
 */
export const codePointKey = (character: string): string => {
  const [firstCharacter = ""] = character;
  const codePoint = firstCharacter.codePointAt(FIRST_CODE_UNIT_INDEX);

  return codePoint === undefined ? "u" : `u${codePoint.toString(HEX_RADIX)}`;
};
