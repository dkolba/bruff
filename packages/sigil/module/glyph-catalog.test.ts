/* eslint-disable unicorn/text-encoding-identifier-case -- Tests assert @bruff/glyph catalog group names such as ASCII. */
import { describe, expect, it } from "vitest";

import {
  findSigilGlyphGroup,
  findSigilGlyphOption,
  SIGIL_GLYPH_GROUPS,
} from "./glyph-catalog.js";

const EXPECTED_SIGIL_GLYPH_GROUP_NAMES: ReadonlyArray<string> = [
  "ASCII",
  "LATIN_EXTENDED",
  "GREEK",
  "CYRILLIC",
  "RUNIC",
  "BOX",
  "BLOCK",
  "BRAILLE",
  "GEO",
  "ARROWS",
  "MATH",
  "MISC_SYMBOLS",
  "DINGBATS",
  "ARROWS_SUPP",
  "LETTERLIKE",
  "CURRENCY",
  "SUPER_SUB",
  "ENCLOSED",
  "OGHAM",
  "ALCHEMICAL",
  "COPTIC",
  "COMBINING",
];

describe("SIGIL_GLYPH_GROUPS", () => {
  it("preserves the expected catalog group ordering", () => {
    expect(SIGIL_GLYPH_GROUPS.map((group) => group.groupName)).toEqual(
      EXPECTED_SIGIL_GLYPH_GROUP_NAMES,
    );
  });

  it("creates readable labels for groups and glyph options", () => {
    expect(findSigilGlyphGroup("MISC_SYMBOLS")).toMatchObject({
      groupName: "MISC_SYMBOLS",
      label: "Misc Symbols",
    });
    expect(findSigilGlyphOption("ASCII", "AT")).toStrictEqual({
      glyph: "@",
      glyphKey: "AT",
      groupName: "ASCII",
      label: "AT @",
    });
  });

  it("includes representative @bruff/glyph entries without helper functions", () => {
    expect(findSigilGlyphOption("BOX", "H")).toMatchObject({
      glyph: "─",
      glyphKey: "H",
    });
    expect(findSigilGlyphOption("BRAILLE", "ALL_DOTS")).toMatchObject({
      glyph: "⣿",
      glyphKey: "ALL_DOTS",
    });
    expect(findSigilGlyphOption("ASCII", "braille")).toBeUndefined();
    expect(findSigilGlyphOption("ASCII", "combine")).toBeUndefined();
  });
});
