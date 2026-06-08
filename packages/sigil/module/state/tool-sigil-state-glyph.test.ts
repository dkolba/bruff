/* eslint-disable sort-imports, unicorn/text-encoding-identifier-case -- State tests cover catalog names such as ASCII. */
import {
  selectToolSigilViewModel,
  setToolSigilGlyphGroup,
} from "./tool-sigil-state.js";
import {
  asteriskMapping,
  selectedAsteriskState,
} from "./tool-sigil-state-test-support.js";
import { describe, expect, it } from "vitest";

describe("ToolSigil mapped glyph state", () => {
  it("selects staged groups and individual mapped glyphs", () => {
    const selectedState = selectedAsteriskState();

    expect(selectToolSigilViewModel(selectedState)).toMatchObject({
      selectedGlyphsByUnicode: {
        "★": asteriskMapping,
      },
      stagedGlyphGroupsByUnicode: {},
    });
  });
});

describe("ToolSigil mapped glyph group changes", () => {
  it("clears a selected glyph when the staged group changes", () => {
    expect(
      selectToolSigilViewModel(
        setToolSigilGlyphGroup(selectedAsteriskState(), "★", "BOX"),
      ).selectedGlyphsByUnicode,
    ).toStrictEqual({});
  });
});

describe("ToolSigil mapped glyph group preservation", () => {
  it("preserves a selected glyph when the staged group stays the same", () => {
    expect(
      selectToolSigilViewModel(
        setToolSigilGlyphGroup(selectedAsteriskState(), "★", "ASCII"),
      ).selectedGlyphsByUnicode,
    ).toStrictEqual({
      "★": asteriskMapping,
    });
  });
});
