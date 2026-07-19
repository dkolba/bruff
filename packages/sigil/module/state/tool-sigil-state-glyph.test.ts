/* eslint-disable unicorn/text-encoding-identifier-case -- State tests cover catalog names such as ASCII. */
import { describe, expect, it } from "vitest";

import {
  selectToolSigilViewModel,
  setToolSigilGlyphGroup,
} from "./tool-sigil-state.js";
import {
  asteriskMapping,
  selectedAsteriskState,
} from "./tool-sigil-state-test-support.js";

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
    const cleared = selectToolSigilViewModel(
      setToolSigilGlyphGroup(selectedAsteriskState(), "★", "BOX"),
    ).selectedGlyphsByUnicode;
    expect(cleared).toStrictEqual({});
  });
});

describe("ToolSigil mapped glyph group preservation", () => {
  it("preserves a selected glyph when the staged group stays the same", () => {
    const preserved = selectToolSigilViewModel(
      setToolSigilGlyphGroup(selectedAsteriskState(), "★", "ASCII"),
    ).selectedGlyphsByUnicode;
    expect(preserved).toStrictEqual({
      "★": asteriskMapping,
    });
  });
});
