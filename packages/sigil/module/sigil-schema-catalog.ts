import { brand, type Brand, none, type Option, some } from "@bruff/utils";
import type { RequiredSigilGlyphName } from "./glyph-json.js";

/** Stable id for a concrete sigil contract schema preset. */
export type SigilSchemaId = Brand<string, "SigilSchemaId">;

/** One required glyph entry within a schema preset. */
export type SigilSchemaGlyph = Readonly<{
  name: RequiredSigilGlyphName;
  unicode: string;
}>;

/** One schema preset selectable in the sigil tool. */
export type SigilSchemaOption = Readonly<{
  id: SigilSchemaId;
  label: string;
  requiredGlyphs: ReadonlyArray<SigilSchemaGlyph>;
}>;

/** Schema id for the shared `SigilGlyphMap` contract. */
export const SIGIL_GLYPH_MAP_SCHEMA_ID: SigilSchemaId =
  brand<"SigilSchemaId">("SigilGlyphMap");

/** Default concrete schema selected when the sigil tool loads. */
export const DEFAULT_SIGIL_SCHEMA_ID: SigilSchemaId = SIGIL_GLYPH_MAP_SCHEMA_ID;

/** Concrete schema presets available in the sigil tool. */
export const SIGIL_SCHEMA_OPTIONS: ReadonlyArray<SigilSchemaOption> = [
  {
    id: SIGIL_GLYPH_MAP_SCHEMA_ID,
    label: "SigilGlyphMap",
    requiredGlyphs: [
      { name: "floor", unicode: "." },
      { name: "wall", unicode: "#" },
      { name: "door", unicode: "+" },
      { name: "player", unicode: "@" },
      { name: "enemy", unicode: "e" },
    ],
  },
];

/**
 * Finds a concrete sigil schema option by id.
 *
 * @param schemaOptions - Available concrete schema presets
 * @param schemaId - Schema id to find
 * @returns The matching schema option, or none when no option exists
 */
export const findSigilSchemaOption = (
  schemaOptions: ReadonlyArray<SigilSchemaOption>,
  schemaId: SigilSchemaId,
): Option<SigilSchemaOption> => {
  const schemaOption = schemaOptions.find((option) => option.id === schemaId);

  return schemaOption === undefined ? none : some(schemaOption);
};

/**
 * Builds the source character string for a schema option.
 *
 * @param schemaOption - Concrete schema option
 * @returns Source characters in schema order
 */
export const sigilSchemaCharacters = (
  schemaOption: SigilSchemaOption | undefined,
): string =>
  schemaOption?.requiredGlyphs.map((glyph) => glyph.unicode).join("") ?? "";

/**
 * Builds default glyph names keyed by source Unicode character.
 *
 * @param schemaOption - Concrete schema option
 * @returns Required glyph names keyed by source character
 */
export const sigilSchemaNamesByUnicode = (
  schemaOption: SigilSchemaOption | undefined,
): Readonly<Record<string, string>> =>
  Object.fromEntries(
    schemaOption?.requiredGlyphs.map((glyph) => [glyph.unicode, glyph.name]) ??
      [],
  );
