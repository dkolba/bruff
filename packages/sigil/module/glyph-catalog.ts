/* eslint-disable unicorn/text-encoding-identifier-case -- `ASCII` is a @bruff/glyph catalog group name, not a text encoding option. */
import {
  ALCHEMICAL,
  ARROWS,
  ARROWS_SUPP,
  ASCII,
  BLOCK,
  BOX,
  BRAILLE,
  COMBINING,
  COPTIC,
  CURRENCY,
  CYRILLIC,
  DINGBATS,
  ENCLOSED,
  GEO,
  GREEK,
  LATIN_EXTENDED,
  LETTERLIKE,
  MATH,
  MISC_SYMBOLS,
  OGHAM,
  RUNIC,
  SUPER_SUB,
} from "@bruff/glyph";

type GlyphTable = Readonly<Record<string, string>>;

type GlyphTableDefinition = Readonly<{
  groupName: SigilGlyphGroupName;
  glyphs: GlyphTable;
}>;

/** Stable group name for a top-level `@bruff/glyph` export table. */
export type SigilGlyphGroupName = string;

/** One selectable glyph from the shared glyph catalog. */
export type SigilGlyphOption = Readonly<{
  groupName: SigilGlyphGroupName;
  glyphKey: string;
  glyph: string;
  label: string;
}>;

/** One selectable glyph group from the shared glyph catalog. */
export type SigilGlyphGroup = Readonly<{
  groupName: SigilGlyphGroupName;
  label: string;
  glyphs: ReadonlyArray<SigilGlyphOption>;
}>;

const GLYPH_TABLES: ReadonlyArray<GlyphTableDefinition> = [
  { glyphs: ASCII, groupName: "ASCII" },
  { glyphs: LATIN_EXTENDED, groupName: "LATIN_EXTENDED" },
  { glyphs: GREEK, groupName: "GREEK" },
  { glyphs: CYRILLIC, groupName: "CYRILLIC" },
  { glyphs: RUNIC, groupName: "RUNIC" },
  { glyphs: BOX, groupName: "BOX" },
  { glyphs: BLOCK, groupName: "BLOCK" },
  { glyphs: BRAILLE, groupName: "BRAILLE" },
  { glyphs: GEO, groupName: "GEO" },
  { glyphs: ARROWS, groupName: "ARROWS" },
  { glyphs: MATH, groupName: "MATH" },
  { glyphs: MISC_SYMBOLS, groupName: "MISC_SYMBOLS" },
  { glyphs: DINGBATS, groupName: "DINGBATS" },
  { glyphs: ARROWS_SUPP, groupName: "ARROWS_SUPP" },
  { glyphs: LETTERLIKE, groupName: "LETTERLIKE" },
  { glyphs: CURRENCY, groupName: "CURRENCY" },
  { glyphs: SUPER_SUB, groupName: "SUPER_SUB" },
  { glyphs: ENCLOSED, groupName: "ENCLOSED" },
  { glyphs: OGHAM, groupName: "OGHAM" },
  { glyphs: ALCHEMICAL, groupName: "ALCHEMICAL" },
  { glyphs: COPTIC, groupName: "COPTIC" },
  { glyphs: COMBINING, groupName: "COMBINING" },
];

const FIRST_CHARACTER_INDEX = 0;
const SECOND_CHARACTER_INDEX = 1;
const EMPTY_LENGTH = 0;

const labelText = (text: string): string =>
  text
    .split("_")
    .map(
      (word) =>
        `${word.slice(FIRST_CHARACTER_INDEX, SECOND_CHARACTER_INDEX)}${word.slice(SECOND_CHARACTER_INDEX).toLowerCase()}`,
    )
    .join(" ");

const glyphOption =
  (groupName: SigilGlyphGroupName) =>
  ([glyphKey, glyph]: readonly [string, string]): SigilGlyphOption => ({
    glyph,
    glyphKey,
    groupName,
    label: `${glyphKey} ${glyph}`,
  });

const glyphGroup = ({
  glyphs,
  groupName,
}: GlyphTableDefinition): SigilGlyphGroup => ({
  glyphs: Object.entries(glyphs).map(glyphOption(groupName)),
  groupName,
  label: labelText(groupName),
});

/** Ordered selectable glyph groups projected from `@bruff/glyph`. */
export const SIGIL_GLYPH_GROUPS: ReadonlyArray<SigilGlyphGroup> =
  GLYPH_TABLES.map((tableDefinition) => glyphGroup(tableDefinition)).filter(
    (group) => group.glyphs.length > EMPTY_LENGTH,
  );

/**
Finds a selectable glyph group by catalog group name.

@param groupName - Glyph group name
@returns Matching group, or undefined when unavailable
*/
export const findSigilGlyphGroup = (
  groupName: SigilGlyphGroupName,
): SigilGlyphGroup | undefined =>
  SIGIL_GLYPH_GROUPS.find((group) => group.groupName === groupName);

/**
Finds a selectable glyph by group and key.

@param groupName - Glyph group name
@param glyphKey - Glyph key inside the group
@returns Matching glyph, or undefined when unavailable
*/
export const findSigilGlyphOption = (
  groupName: SigilGlyphGroupName,
  glyphKey: string,
): SigilGlyphOption | undefined =>
  findSigilGlyphGroup(groupName)?.glyphs.find(
    (glyph) => glyph.glyphKey === glyphKey,
  );
