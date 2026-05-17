import { Font, Glyph, Path } from "opentype.js";

const ORIGIN = 0;
const STAR_CODE_POINT = 0x26_05;
const NOTDEF_INDEX = 0;
const STAR_ADVANCE_WIDTH = 600;
const NOTDEF_ADVANCE_WIDTH = 300;
const DESCENDER = -200;

/** Units-per-em used by the tiny browser test font. */
export const TEST_FONT_UNITS_PER_EM = 1000;

const createStarPath = (): Path => {
  const path = new Path();

  path.moveTo(ORIGIN, ORIGIN);
  path.lineTo(STAR_ADVANCE_WIDTH, ORIGIN);
  path.lineTo(STAR_ADVANCE_WIDTH, TEST_FONT_UNITS_PER_EM);
  path.closePath();

  return path;
};

const createNotdefGlyph = (): Glyph =>
  new Glyph({
    advanceWidth: NOTDEF_ADVANCE_WIDTH,
    index: NOTDEF_INDEX,
    name: ".notdef",
    path: new Path(),
  });

/**
 * Creates a tiny valid font for browser file-upload tests.
 *
 * @returns A font with a star glyph and units-per-em of 1000
 */
export const createTestFont = (): Font =>
  new Font({
    ascender: TEST_FONT_UNITS_PER_EM,
    descender: DESCENDER,
    familyName: "Sigil Component Test",
    glyphs: [
      createNotdefGlyph(),
      new Glyph({
        advanceWidth: STAR_ADVANCE_WIDTH,
        name: "star",
        path: createStarPath(),
        unicode: STAR_CODE_POINT,
      }),
    ],
    styleName: "Regular",
    unitsPerEm: TEST_FONT_UNITS_PER_EM,
  });

/** Creates a valid test font that intentionally lacks the star glyph. */
export const createMissingStarTestFont = (): Font =>
  new Font({
    ascender: TEST_FONT_UNITS_PER_EM,
    descender: DESCENDER,
    familyName: "Sigil Missing Star Test",
    glyphs: [createNotdefGlyph()],
    styleName: "Regular",
    unitsPerEm: TEST_FONT_UNITS_PER_EM,
  });

/**
 * Creates a browser File wrapping the tiny valid test font.
 *
 * @param fileName - Font file name to expose to the component
 * @returns A TTF-like browser File
 */
export const createValidFontFile = (fileName: string): File =>
  new File([createTestFont().toArrayBuffer()], fileName, {
    type: "font/ttf",
  });

/**
 * Creates a valid browser File for a font without the star glyph.
 *
 * @param fileName - Font file name to expose to the component
 * @returns A TTF-like browser File
 */
export const createMissingStarFontFile = (fileName: string): File =>
  new File([createMissingStarTestFont().toArrayBuffer()], fileName, {
    type: "font/ttf",
  });
