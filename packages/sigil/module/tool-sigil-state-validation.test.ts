/* eslint-disable unicorn/text-encoding-identifier-case -- State validation tests cover fixed Sigil glyph fixture values. */
import {
  applyToolSigilFontLoadResult,
  clearToolSigilPreviewFontFamily,
  createToolSigilState,
  selectToolSigilViewModel,
  setToolSigilCharacters,
  setToolSigilGlyphName,
  setToolSigilLicense,
  setToolSigilMappedGlyph,
  setToolSigilPreviewFontFamily,
  startToolSigilFontSelection,
  type ToolSigilState,
} from "./state/tool-sigil-state.js";
import { describe, expect, it } from "vitest";
import { createTestFont } from "./font-test-fixture.js";
import { ok } from "@bruff/utils";

const STALE_FONT_LOAD_TOKEN = 1;
const CURRENT_FONT_LOAD_TOKEN = 2;
const PREVIEW_FONT_FAMILY = "tool-sigil-preview-font-1";

const asteriskMapping = {
  glyph: "*",
  glyphKey: "ASTERISK",
  groupName: "ASCII",
};

const loadCurrentFontState = (characters: string): ToolSigilState => {
  const selection = startToolSigilFontSelection(
    createToolSigilState(),
    "component-test.ttf",
  );

  return applyToolSigilFontLoadResult(
    setToolSigilCharacters(selection.state, characters),
    selection.fontLoadToken,
    ok(createTestFont()),
  );
};

describe("ToolSigil catalog validation", () => {
  it("shows typed errors for empty catalogs", () => {
    expect(
      selectToolSigilViewModel({
        ...loadCurrentFontState("★"),
        glyphGroups: [],
        licenseOptions: [],
      }).errors,
    ).toEqual(
      expect.arrayContaining([
        {
          message: "No shared glyph catalog options are available.",
          type: "empty-glyph-catalog",
        },
        {
          message: "No OSI license options are available.",
          type: "empty-license-catalog",
        },
      ]),
    );
  });
});

describe("ToolSigil stale selection validation", () => {
  it("rejects stale mapped glyphs and stale license defaults", () => {
    const staleState = {
      ...loadCurrentFontState("★"),
      lastSelectedLicense: "stale-license",
      selectedGlyphsByUnicode: {
        "★": {
          glyph: "not-asterisk",
          glyphKey: "ASTERISK",
          groupName: "ASCII",
        },
      },
    };

    expect(selectToolSigilViewModel(staleState).errors).toEqual(
      expect.arrayContaining([
        {
          message: 'Select a glyph mapping for "★".',
          type: "missing-mapped-glyph",
        },
        {
          message: 'Select a LICENSE value for "★".',
          type: "missing-license",
        },
      ]),
    );
  });
});

describe("ToolSigil partial selection validation", () => {
  it("shows selection errors when other completed glyphs satisfy the contract", () => {
    const selectedState = setToolSigilLicense(
      setToolSigilMappedGlyph(loadCurrentFontState("★♥"), "★", asteriskMapping),
      "★",
      "MIT",
    );

    expect(selectToolSigilViewModel(selectedState).errors).toEqual(
      expect.arrayContaining([
        {
          message: 'Select a glyph mapping for "♥".',
          type: "missing-mapped-glyph",
        },
      ]),
    );
  });
});

describe("ToolSigil stale font state", () => {
  it("ignores stale font load results", () => {
    const currentState = {
      ...createToolSigilState(),
      fontLoadToken: CURRENT_FONT_LOAD_TOKEN,
    };

    expect(
      applyToolSigilFontLoadResult(
        currentState,
        STALE_FONT_LOAD_TOKEN,
        ok(createTestFont()),
      ),
    ).toBe(currentState);
  });
});

describe("ToolSigil glyph name state", () => {
  it("combines extraction and glyph-name errors in the view model", () => {
    const namedState = setToolSigilGlyphName(
      loadCurrentFontState("★?"),
      "★",
      "",
    );

    expect(selectToolSigilViewModel(namedState).errors).toEqual(
      expect.arrayContaining([
        {
          message: 'Missing glyph for "?".',
          type: "missing-glyph",
        },
        {
          message: 'Select a glyph mapping for "★".',
          type: "missing-mapped-glyph",
        },
        {
          message: 'Select a LICENSE value for "★".',
          type: "missing-license",
        },
      ]),
    );
    expect(selectToolSigilViewModel(namedState).downloadDisabled).toBe(true);
  });
});

describe("ToolSigil preview state", () => {
  it("sets the current preview font family", () => {
    const currentState = {
      ...createToolSigilState(),
      fontLoadToken: CURRENT_FONT_LOAD_TOKEN,
    };

    expect(
      selectToolSigilViewModel(
        setToolSigilPreviewFontFamily(
          currentState,
          CURRENT_FONT_LOAD_TOKEN,
          PREVIEW_FONT_FAMILY,
        ),
      ).previewFontFamily,
    ).toBe(PREVIEW_FONT_FAMILY);
  });

  it("ignores stale preview font families", () => {
    const currentState = {
      ...createToolSigilState(),
      fontLoadToken: CURRENT_FONT_LOAD_TOKEN,
    };

    expect(
      setToolSigilPreviewFontFamily(
        currentState,
        STALE_FONT_LOAD_TOKEN,
        PREVIEW_FONT_FAMILY,
      ),
    ).toBe(currentState);
  });

  it("clears the current preview font family", () => {
    const currentState = {
      ...createToolSigilState(),
      fontLoadToken: CURRENT_FONT_LOAD_TOKEN,
      previewFontFamily: PREVIEW_FONT_FAMILY,
    };

    expect(
      selectToolSigilViewModel(
        clearToolSigilPreviewFontFamily(currentState, CURRENT_FONT_LOAD_TOKEN),
      ).previewFontFamily,
    ).toBe("");
  });
});
