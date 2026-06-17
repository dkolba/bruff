import { Font, Glyph, Path } from "opentype.js";
import { describe, expect, it } from "vitest";

import { extractSigilGlyphs } from "./extract-glyphs.js";
import type { SigilGlyphDraft } from "./glyph-json.js";

const ORIGIN = 0;
const STAR_CODE_POINT = 0x26_05;
const HEART_CODE_POINT = 0x26_65;
const CHECK_CODE_POINT = 0x27_13;
const SPACE_CODE_POINT = 0x20;
const NOTDEF_INDEX = 0;
const STAR_ADVANCE_WIDTH = 600;
const HEART_ADVANCE_WIDTH = 500;
const CHECK_ADVANCE_WIDTH = 550;
const SPACE_ADVANCE_WIDTH = 300;
const UNITS_PER_EM = 1000;
const DESCENDER = -200;
const DECIMAL_PRECISION = 2;
const EXTRACTED_GLYPH_COUNT = 3;
const MIXED_INPUT_EXTRACTED_GLYPH_COUNT = 1;
const VARIATION_SEQUENCE_EXTRACTED_GLYPH_COUNT = 1;
const ZERO_ADVANCE_WIDTH = 0;
const FIRST_DRAFT_INDEX = 0;

const pathForAdvanceWidth = (advanceWidth: number): Path => {
  const path = new Path();

  path.moveTo(ORIGIN, ORIGIN);
  path.lineTo(advanceWidth, ORIGIN);
  path.lineTo(advanceWidth, UNITS_PER_EM);
  path.closePath();

  return path;
};

const createGlyph = (
  name: string,
  unicode: number,
  advanceWidth: number,
): Glyph =>
  new Glyph({
    advanceWidth,
    name,
    path: pathForAdvanceWidth(advanceWidth),
    unicode,
  });

const createNotdefGlyph = (): Glyph =>
  new Glyph({
    advanceWidth: SPACE_ADVANCE_WIDTH,
    index: NOTDEF_INDEX,
    name: ".notdef",
    path: new Path(),
  });

const createGlyphWithoutAdvanceWidth = (): Glyph =>
  new Glyph({
    name: "space",
    path: new Path(),
    unicode: SPACE_CODE_POINT,
  });

const createTestFont = (): Font =>
  new Font({
    ascender: UNITS_PER_EM,
    descender: DESCENDER,
    familyName: "Sigil Test",
    glyphs: [
      createNotdefGlyph(),
      createGlyph("star", STAR_CODE_POINT, STAR_ADVANCE_WIDTH),
      createGlyph("heart", HEART_CODE_POINT, HEART_ADVANCE_WIDTH),
      createGlyph("check", CHECK_CODE_POINT, CHECK_ADVANCE_WIDTH),
      createGlyph("space", SPACE_CODE_POINT, SPACE_ADVANCE_WIDTH),
    ],
    styleName: "Regular",
    unitsPerEm: UNITS_PER_EM,
  });

const expectStarDraft = (starDraft: SigilGlyphDraft | undefined): void => {
  expect(starDraft).toMatchObject({
    defaultName: "u2605",
    glyph: {
      advanceWidth: STAR_ADVANCE_WIDTH,
      bounds: {
        x1: ORIGIN,
        x2: STAR_ADVANCE_WIDTH,
        y1: ORIGIN,
        y2: UNITS_PER_EM,
      },
      unicode: "★",
      unitsPerEm: UNITS_PER_EM,
    },
  });
  expect(starDraft?.glyph.path).toBe(
    pathForAdvanceWidth(STAR_ADVANCE_WIDTH).toPathData(DECIMAL_PRECISION),
  );
};

describe("extractSigilGlyphs success", () => {
  it("extracts distinct glyphs in first-seen order", () => {
    const extractionReport = extractSigilGlyphs(createTestFont(), "★♥✓★");
    const [starDraft, heartDraft, checkDraft] = extractionReport.drafts;

    expect(extractionReport.errors).toStrictEqual([]);
    expect(extractionReport.drafts).toHaveLength(EXTRACTED_GLYPH_COUNT);
    expectStarDraft(starDraft);
    expect(heartDraft?.defaultName).toBe("u2665");
    expect(checkDraft?.defaultName).toBe("u2713");
  });

  it("keeps emoji variation sequences as one extracted character", () => {
    const extractionReport = extractSigilGlyphs(createTestFont(), "♥️♥️");
    const [heartDraft] = extractionReport.drafts;

    expect(extractionReport.errors).toStrictEqual([]);
    expect(extractionReport.drafts).toHaveLength(
      VARIATION_SEQUENCE_EXTRACTED_GLYPH_COUNT,
    );
    expect(heartDraft?.defaultName).toBe("u2665");
    expect(heartDraft?.glyph.unicode).toBe("♥️");
  });

  it("uses zero advance width when a glyph omits advance width", () => {
    const font = new Font({
      ascender: UNITS_PER_EM,
      descender: DESCENDER,
      familyName: "Sigil Test",
      glyphs: [createNotdefGlyph(), createGlyphWithoutAdvanceWidth()],
      styleName: "Regular",
      unitsPerEm: UNITS_PER_EM,
    });

    expect(
      extractSigilGlyphs(font, " ").drafts[FIRST_DRAFT_INDEX]?.glyph
        .advanceWidth,
    ).toBe(ZERO_ADVANCE_WIDTH);
  });
});

describe("extractSigilGlyphs missing glyphs", () => {
  it("reports missing glyphs", () => {
    expect(extractSigilGlyphs(createTestFont(), "★?").errors).toStrictEqual([
      {
        message: 'Missing glyph for "?".',
        type: "missing-glyph",
      },
    ]);
  });

  it("preserves valid drafts when reporting missing glyphs", () => {
    expect(extractSigilGlyphs(createTestFont(), "★?")).toMatchObject({
      drafts: [
        {
          defaultName: "u2605",
          glyph: {
            advanceWidth: STAR_ADVANCE_WIDTH,
            unicode: "★",
            unitsPerEm: UNITS_PER_EM,
          },
        },
      ],
      errors: [
        {
          message: 'Missing glyph for "?".',
          type: "missing-glyph",
        },
      ],
    });
    expect(extractSigilGlyphs(createTestFont(), "★?")).toHaveProperty(
      "drafts.length",
      MIXED_INPUT_EXTRACTED_GLYPH_COUNT,
    );
  });
});

describe("extractSigilGlyphs empty input", () => {
  it("reports empty input", () => {
    expect(extractSigilGlyphs(createTestFont(), "")).toStrictEqual({
      drafts: [],
      error: [
        {
          message: "Enter at least one character to extract.",
          type: "empty-input",
        },
      ],
      errors: [
        {
          message: "Enter at least one character to extract.",
          type: "empty-input",
        },
      ],
      type: "error",
    });
  });
});
