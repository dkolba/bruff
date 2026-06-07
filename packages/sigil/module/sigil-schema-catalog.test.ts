import { describe, expect, it } from "vitest";
import {
  DEFAULT_SIGIL_SCHEMA_ID,
  findSigilSchemaOption,
  SIGIL_GLYPH_MAP_SCHEMA_ID,
  SIGIL_SCHEMA_OPTIONS,
} from "./sigil-schema-catalog.js";

const EXPECTED_SIGIL_GLYPH_MAP_REQUIRED_GLYPHS = [
  { name: "floor", unicode: "." },
  { name: "wall", unicode: "#" },
  { name: "door", unicode: "+" },
  { name: "player", unicode: "@" },
  { name: "enemy", unicode: "e" },
];

describe("SIGIL_SCHEMA_OPTIONS", () => {
  it("contains the default SigilGlyphMap option", () => {
    expect(DEFAULT_SIGIL_SCHEMA_ID).toBe(SIGIL_GLYPH_MAP_SCHEMA_ID);
    expect(SIGIL_SCHEMA_OPTIONS).toStrictEqual([
      {
        id: SIGIL_GLYPH_MAP_SCHEMA_ID,
        label: "SigilGlyphMap",
        requiredGlyphs: EXPECTED_SIGIL_GLYPH_MAP_REQUIRED_GLYPHS,
      },
    ]);
  });

  it("finds a schema option by id", () => {
    expect(
      findSigilSchemaOption(SIGIL_SCHEMA_OPTIONS, SIGIL_GLYPH_MAP_SCHEMA_ID),
    ).toStrictEqual({
      type: "some",
      value: SIGIL_SCHEMA_OPTIONS[0],
    });
  });
});
