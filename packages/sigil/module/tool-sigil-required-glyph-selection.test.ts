/* eslint-disable sort-imports -- Test imports keep source modules before vitest. */
import { SIGIL_SCHEMA_OPTIONS } from "./sigil-schema-catalog.js";
import {
  defaultRequiredGlyphSelections,
  requiredGlyphCharacterOptions,
  requiredGlyphSelectionViews,
  selectedRequiredGlyphCharacters,
} from "./tool-sigil-required-glyph-selection.js";
import { describe, expect, it } from "vitest";
/* eslint-enable sort-imports */

const FIRST_SCHEMA_OPTION_INDEX = 0;

const defaultSchemaOption = SIGIL_SCHEMA_OPTIONS[FIRST_SCHEMA_OPTION_INDEX];

describe("requiredGlyphCharacterOptions", () => {
  it("deduplicates typed characters in first-seen order", () => {
    expect(requiredGlyphCharacterOptions("aab c")).toStrictEqual([
      { label: "a", unicode: "a" },
      { label: "b", unicode: "b" },
      { label: " ", unicode: " " },
      { label: "c", unicode: "c" },
    ]);
  });
});

describe("defaultRequiredGlyphSelections", () => {
  it("creates selections from schema glyph defaults", () => {
    expect(defaultRequiredGlyphSelections(defaultSchemaOption)).toStrictEqual([
      { name: "floor", unicode: "." },
      { name: "wall", unicode: "#" },
      { name: "door", unicode: "+" },
      { name: "player", unicode: "@" },
      { name: "enemy", unicode: "e" },
    ]);
  });
});

describe("requiredGlyphSelectionViews", () => {
  it("marks selections invalid when their character is absent", () => {
    expect(
      requiredGlyphSelectionViews("#", [
        { name: "wall", unicode: "#" },
        { name: "floor", unicode: "." },
      ]),
    ).toStrictEqual([
      {
        isValid: true,
        name: "wall",
        options: [{ label: "#", unicode: "#" }],
        selectedUnicode: "#",
      },
      {
        isValid: false,
        name: "floor",
        options: [{ label: "#", unicode: "#" }],
        selectedUnicode: ".",
      },
    ]);
  });
});

describe("selectedRequiredGlyphCharacters", () => {
  it("joins required glyph characters in selection order", () => {
    expect(
      selectedRequiredGlyphCharacters([
        { name: "wall", unicode: "#" },
        { name: "floor", unicode: "." },
      ]),
    ).toBe("#.");
  });
});
