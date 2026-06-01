/* eslint-disable max-lines, max-lines-per-function, max-statements, no-magic-numbers, unicorn/text-encoding-identifier-case -- State tests cover the full glyph/license state matrix and catalog names such as ASCII. */
import {
  applyToolSigilFontLoadResult,
  clearToolSigilPreviewFontFamily,
  createToolSigilState,
  selectToolSigilDownloadGlyphMap,
  selectToolSigilViewModel,
  setToolSigilCharacters,
  setToolSigilGlyphGroup,
  setToolSigilGlyphName,
  setToolSigilLicense,
  setToolSigilMappedGlyph,
  setToolSigilPreviewFontFamily,
  startToolSigilFontSelection,
} from "./tool-sigil-state.js";
import { describe, expect, it } from "vitest";
import { error, ok } from "@bruff/utils";
import { createTestFont } from "./font-test-fixture.js";
import type { SigilExtractionError } from "./glyph-json.js";

const STALE_FONT_LOAD_TOKEN = 1;
const CURRENT_FONT_LOAD_TOKEN = 2;

const invalidFontErrors: ReadonlyArray<SigilExtractionError> = [
  {
    message: 'Could not parse "broken.ttf" as a supported font.',
    type: "invalid-font",
  },
];

describe("ToolSigil state selection", () => {
  it("creates the initial view model", () => {
    const viewModel = selectToolSigilViewModel(createToolSigilState());

    expect(viewModel).toMatchObject({
      downloadDisabled: true,
      drafts: [],
      errors: [],
      fontFileNameText: "No font selected",
      glyphCountText: "Glyphs ready: 0",
      namesByUnicode: {},
      previewFontFamily: "",
      selectedGlyphsByUnicode: {},
      selectedLicensesByUnicode: {},
      stagedGlyphGroupsByUnicode: {},
    });
    expect(viewModel.glyphGroups.length).toBeGreaterThan(0);
    expect(viewModel.licenseOptions.length).toBeGreaterThan(0);
  });
});

describe("ToolSigil current font state", () => {
  it("extracts drafts from current characters when a font load succeeds", () => {
    const selection = startToolSigilFontSelection(
      createToolSigilState(),
      "component-test.ttf",
    );
    const characterState = setToolSigilCharacters(selection.state, "★");
    const loadedState = applyToolSigilFontLoadResult(
      characterState,
      selection.fontLoadToken,
      ok(createTestFont()),
    );

    expect(selectToolSigilViewModel(loadedState)).toMatchObject({
      downloadDisabled: true,
      fontFileNameText: "component-test.ttf",
      glyphCountText: "Glyphs ready: 1",
    });
    const mappedState = setToolSigilLicense(
      setToolSigilMappedGlyph(loadedState, "★", {
        glyph: "*",
        glyphKey: "ASTERISK",
        groupName: "ASCII",
      }),
      "★",
      "MIT",
    );
    const glyphMapResult = selectToolSigilDownloadGlyphMap(mappedState);

    expect(glyphMapResult.type).toBe("ok");
    if (glyphMapResult.type === "error") {
      return;
    }
    expect(Object.keys(glyphMapResult.value)).toStrictEqual(["u2605"]);
    expect(
      Object.values(glyphMapResult.value).map((glyph) => glyph.unicode),
    ).toStrictEqual(["★"]);
    // eslint-disable-next-line dot-notation -- TS requires bracket access for index-signature glyph maps.
    expect(glyphMapResult.value["u2605"]).toMatchObject({
      LICENSE: "MIT",
      mappedGlyph: {
        glyph: "*",
        glyphKey: "ASTERISK",
        groupName: "ASCII",
      },
    });
  });

  it("stores typed font load errors", () => {
    const selection = startToolSigilFontSelection(
      createToolSigilState(),
      "broken.ttf",
    );
    const loadedState = applyToolSigilFontLoadResult(
      selection.state,
      selection.fontLoadToken,
      error(invalidFontErrors),
    );

    expect(selectToolSigilViewModel(loadedState).errors).toStrictEqual(
      invalidFontErrors,
    );
  });
});

describe("ToolSigil glyph mapping state", () => {
  it("selects staged groups and individual mapped glyphs", () => {
    const selectedState = setToolSigilMappedGlyph(
      setToolSigilGlyphGroup(createToolSigilState(), "★", "ASCII"),
      "★",
      {
        glyph: "*",
        glyphKey: "ASTERISK",
        groupName: "ASCII",
      },
    );

    expect(selectToolSigilViewModel(selectedState)).toMatchObject({
      selectedGlyphsByUnicode: {
        "★": {
          glyph: "*",
          glyphKey: "ASTERISK",
          groupName: "ASCII",
        },
      },
      stagedGlyphGroupsByUnicode: {},
    });
  });

  it("clears a selected glyph when the staged group changes", () => {
    const selectedState = setToolSigilMappedGlyph(
      setToolSigilGlyphGroup(createToolSigilState(), "★", "ASCII"),
      "★",
      {
        glyph: "*",
        glyphKey: "ASTERISK",
        groupName: "ASCII",
      },
    );

    expect(
      selectToolSigilViewModel(
        setToolSigilGlyphGroup(selectedState, "★", "BOX"),
      ).selectedGlyphsByUnicode,
    ).toStrictEqual({});
  });

  it("preserves a selected glyph when the staged group stays the same", () => {
    const selectedState = setToolSigilMappedGlyph(
      setToolSigilGlyphGroup(createToolSigilState(), "★", "ASCII"),
      "★",
      {
        glyph: "*",
        glyphKey: "ASTERISK",
        groupName: "ASCII",
      },
    );

    expect(
      selectToolSigilViewModel(
        setToolSigilGlyphGroup(selectedState, "★", "ASCII"),
      ).selectedGlyphsByUnicode,
    ).toStrictEqual({
      "★": {
        glyph: "*",
        glyphKey: "ASTERISK",
        groupName: "ASCII",
      },
    });
  });
});

describe("ToolSigil license state", () => {
  it("selects a license and memorizes it for new rows", () => {
    const licensedState = setToolSigilLicense(
      createToolSigilState(),
      "★",
      "MIT",
    );

    expect(selectToolSigilViewModel(licensedState)).toMatchObject({
      selectedLicensesByUnicode: {},
    });
    expect(licensedState.lastSelectedLicense).toBe("MIT");
  });

  it("defaults newly extracted rows to the last selected license", () => {
    const selection = startToolSigilFontSelection(
      setToolSigilLicense(createToolSigilState(), "★", "MIT"),
      "component-test.ttf",
    );
    const loadedState = applyToolSigilFontLoadResult(
      setToolSigilCharacters(selection.state, "♥"),
      selection.fontLoadToken,
      ok(createTestFont()),
    );

    expect(
      selectToolSigilViewModel(loadedState).selectedLicensesByUnicode,
    ).toStrictEqual({
      "♥": "MIT",
    });
  });
});

describe("ToolSigil catalog validation", () => {
  it("shows typed errors for empty catalogs", () => {
    const selection = startToolSigilFontSelection(
      createToolSigilState(),
      "component-test.ttf",
    );
    const loadedState = applyToolSigilFontLoadResult(
      setToolSigilCharacters(selection.state, "★"),
      selection.fontLoadToken,
      ok(createTestFont()),
    );

    expect(
      selectToolSigilViewModel({
        ...loadedState,
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

  it("rejects stale mapped glyphs and stale license defaults", () => {
    const selection = startToolSigilFontSelection(
      createToolSigilState(),
      "component-test.ttf",
    );
    const loadedState = applyToolSigilFontLoadResult(
      setToolSigilCharacters(selection.state, "★"),
      selection.fontLoadToken,
      ok(createTestFont()),
    );
    const staleState = {
      ...loadedState,
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
    const selection = startToolSigilFontSelection(
      createToolSigilState(),
      "component-test.ttf",
    );
    const loadedState = applyToolSigilFontLoadResult(
      setToolSigilCharacters(selection.state, "★?"),
      selection.fontLoadToken,
      ok(createTestFont()),
    );
    const namedState = setToolSigilGlyphName(loadedState, "★", "");

    expect(selectToolSigilViewModel(namedState).errors).toEqual(
      expect.arrayContaining([
        {
          message: 'Missing glyph for "?".',
          type: "missing-glyph",
        },
        {
          message: 'Invalid glyph name "".',
          type: "invalid-glyph-name",
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
          "tool-sigil-preview-font-1",
        ),
      ).previewFontFamily,
    ).toBe("tool-sigil-preview-font-1");
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
        "tool-sigil-preview-font-1",
      ),
    ).toBe(currentState);
  });

  it("clears the current preview font family", () => {
    const currentState = {
      ...createToolSigilState(),
      fontLoadToken: CURRENT_FONT_LOAD_TOKEN,
      previewFontFamily: "tool-sigil-preview-font-1",
    };

    expect(
      selectToolSigilViewModel(
        clearToolSigilPreviewFontFamily(currentState, CURRENT_FONT_LOAD_TOKEN),
      ).previewFontFamily,
    ).toBe("");
  });
});
