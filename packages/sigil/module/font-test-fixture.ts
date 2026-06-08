import { Font, Glyph, Path } from "opentype.js";

const ORIGIN = 0;
const STAR_CODE_POINT = 0x26_05;
const HEART_CODE_POINT = 0x26_65;
const FLOOR_CODE_POINT = 46;
const WALL_CODE_POINT = 35;
const DOOR_CODE_POINT = 43;
const PLAYER_CODE_POINT = 0x40;
const ENEMY_CODE_POINT = 0x65;
const NOTDEF_INDEX = 0;
const STAR_ADVANCE_WIDTH = 600;
const HEART_ADVANCE_WIDTH = 500;
const REQUIRED_ADVANCE_WIDTH = 400;
const NOTDEF_ADVANCE_WIDTH = 300;
const DESCENDER = -200;

/** Units-per-em used by the tiny browser test font. */
export const TEST_FONT_UNITS_PER_EM = 1000;

const createTestPath = (advanceWidth: number): Path => {
  const path = new Path();

  path.moveTo(ORIGIN, ORIGIN);
  path.lineTo(advanceWidth, ORIGIN);
  path.lineTo(advanceWidth, TEST_FONT_UNITS_PER_EM);
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

const createTestGlyph = (
  name: string,
  unicode: number,
  advanceWidth: number,
): Glyph =>
  new Glyph({
    advanceWidth,
    name,
    path: createTestPath(advanceWidth),
    unicode,
  });

const createWallGlyph = (): Glyph =>
  createTestGlyph("wall", WALL_CODE_POINT, REQUIRED_ADVANCE_WIDTH);

/**
 * Creates a tiny valid font for browser file-upload tests.
 *
 * @returns A font with schema-required glyphs and units-per-em of 1000
 */
export const createTestFont = (): Font =>
  new Font({
    ascender: TEST_FONT_UNITS_PER_EM,
    descender: DESCENDER,
    familyName: "Sigil Component Test",
    glyphs: [
      createNotdefGlyph(),
      createTestGlyph("star", STAR_CODE_POINT, STAR_ADVANCE_WIDTH),
      createTestGlyph("heart", HEART_CODE_POINT, HEART_ADVANCE_WIDTH),
      createTestGlyph("floor", FLOOR_CODE_POINT, REQUIRED_ADVANCE_WIDTH),
      createWallGlyph(),
      createTestGlyph("door", DOOR_CODE_POINT, REQUIRED_ADVANCE_WIDTH),
      createTestGlyph("player", PLAYER_CODE_POINT, REQUIRED_ADVANCE_WIDTH),
      createTestGlyph("enemy", ENEMY_CODE_POINT, REQUIRED_ADVANCE_WIDTH),
    ],
    styleName: "Regular",
    unitsPerEm: TEST_FONT_UNITS_PER_EM,
  });

/** Creates a valid test font that intentionally lacks schema glyphs. */
export const createMissingStarTestFont = (): Font =>
  new Font({
    ascender: TEST_FONT_UNITS_PER_EM,
    descender: DESCENDER,
    familyName: "Sigil Missing Star Test",
    glyphs: [createNotdefGlyph()],
    styleName: "Regular",
    unitsPerEm: TEST_FONT_UNITS_PER_EM,
  });

/** Creates a valid test font that only supports the schema wall glyph. */
export const createWallOnlyTestFont = (): Font =>
  new Font({
    ascender: TEST_FONT_UNITS_PER_EM,
    descender: DESCENDER,
    familyName: "Sigil Wall Only Test",
    glyphs: [createNotdefGlyph(), createWallGlyph()],
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
