import { expect, test } from "vitest";

import {
  ASCII,
  BRAILLE,
  braille,
  combine,
  COMBINING,
  GEO,
  RUNIC,
} from "./index.js";

const DOT_ONE_MASK = 1;
const FULL_MASK = 255;
const OVERFLOW_MASK = 511;

test("exports representative roguelike glyph tables", () => {
  const representativeGlyphs = {
    arcaneShrine: RUNIC.ALGIZ,
    floor: ASCII.DOT,
    gemstone: GEO.DIAMOND_FULL,
    player: ASCII.AT,
    wall: ASCII.HASH,
  };

  expect(representativeGlyphs).toStrictEqual({
    arcaneShrine: "ᛉ",
    floor: ".",
    gemstone: "◆",
    player: "@",
    wall: "#",
  });
});

test("#braille generates a glyph from an eight-bit dot mask", () => {
  expect([
    braille(DOT_ONE_MASK),
    braille(FULL_MASK),
    braille(OVERFLOW_MASK),
  ]).toStrictEqual([BRAILLE.D1, BRAILLE.ALL_DOTS, BRAILLE.ALL_DOTS]);
});

test("#combine appends combining marks to a base glyph", () => {
  expect(combine(ASCII.AT, COMBINING.ENCLOSING_CIRCLE)).toBe("@⃝");
});
