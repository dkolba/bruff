/* eslint-disable unicorn/text-encoding-identifier-case -- State tests cover the full glyph/license state matrix and catalog names such as ASCII. */
import {
  applyToolSigilFontLoadResult,
  createToolSigilState,
  selectToolSigilDownloadGlyphMap,
  selectToolSigilViewModel,
  setToolSigilCharacters,
  setToolSigilGlyphGroup,
  setToolSigilLicense,
  setToolSigilMappedGlyph,
  startToolSigilFontSelection,
  type ToolSigilState,
} from "./tool-sigil-state.js";
import { describe, expect, it } from "vitest";
import { error, ok } from "@bruff/utils";
import { createTestFont } from "./font-test-fixture.js";
import type { SigilExtractionError } from "./glyph-json.js";
import {
  DEFAULT_SIGIL_SCHEMA_ID,
  SIGIL_SCHEMA_OPTIONS,
} from "./sigil-schema-catalog.js";

const EMPTY_COUNT = 0;

const SIGIL_GLYPH_MAP_CHARACTERS = ".#+@e";

const SIGIL_GLYPH_MAP_NAMES_BY_UNICODE = {
  "#": "wall",
  "+": "door",
  ".": "floor",
  "@": "player",
  e: "enemy",
};

const invalidFontErrors: ReadonlyArray<SigilExtractionError> = [
  {
    message: 'Could not parse "broken.ttf" as a supported font.',
    type: "invalid-font",
  },
];

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

const selectedAsteriskState = (): ToolSigilState =>
  setToolSigilMappedGlyph(
    setToolSigilGlyphGroup(createToolSigilState(), "★", "ASCII"),
    "★",
    asteriskMapping,
  );

const mappedAsteriskState = (state: ToolSigilState): ToolSigilState =>
  setToolSigilLicense(
    setToolSigilMappedGlyph(state, "★", asteriskMapping),
    "★",
    "MIT",
  );

const expectDownloadedAsteriskGlyph = (state: ToolSigilState): void => {
  const glyphMapResult = selectToolSigilDownloadGlyphMap(state);

  expect(glyphMapResult.type).toBe("ok");
  if (glyphMapResult.type === "error") {
    return;
  }
  expect(Object.keys(glyphMapResult.value)).toStrictEqual([
    "door",
    "enemy",
    "floor",
    "player",
    "wall",
    "u2605",
  ]);
  expect(
    Object.values(glyphMapResult.value).map((glyph) => glyph.unicode),
  ).toStrictEqual(["★", "★", "★", "★", "★", "★"]);
  // eslint-disable-next-line dot-notation -- TS requires bracket access for index-signature glyph maps.
  expect(glyphMapResult.value["u2605"]).toMatchObject({
    LICENSE: "MIT",
    mappedGlyph: asteriskMapping,
  });
};

describe("ToolSigil state selection", () => {
  it("creates the initial view model", () => {
    const viewModel = selectToolSigilViewModel(createToolSigilState());

    expect(viewModel).toMatchObject({
      downloadDisabled: true,
      drafts: [],
      errors: [],
      fontFileNameText: "No font selected",
      glyphCountText: "Glyphs ready: 0",
      namesByUnicode: SIGIL_GLYPH_MAP_NAMES_BY_UNICODE,
      previewFontFamily: "",
      schemaOptions: SIGIL_SCHEMA_OPTIONS,
      selectedGlyphsByUnicode: {},
      selectedLicensesByUnicode: {},
      selectedSchemaId: DEFAULT_SIGIL_SCHEMA_ID,
      stagedGlyphGroupsByUnicode: {},
    });
    expect(viewModel.glyphGroups.length).toBeGreaterThan(EMPTY_COUNT);
    expect(viewModel.licenseOptions.length).toBeGreaterThan(EMPTY_COUNT);
  });

  it("derives extraction characters from the selected schema", () => {
    expect(createToolSigilState()).toMatchObject({
      characters: SIGIL_GLYPH_MAP_CHARACTERS,
      namesByUnicode: SIGIL_GLYPH_MAP_NAMES_BY_UNICODE,
      selectedSchemaId: DEFAULT_SIGIL_SCHEMA_ID,
    });
  });
});

describe("ToolSigil loaded font view state", () => {
  it("extracts drafts from current characters when a font load succeeds", () => {
    const loadedState = loadCurrentFontState("★");

    expect(selectToolSigilViewModel(loadedState)).toMatchObject({
      downloadDisabled: true,
      fontFileNameText: "component-test.ttf",
      glyphCountText: "Glyphs ready: 1",
    });
    expectDownloadedAsteriskGlyph(mappedAsteriskState(loadedState));
  });
});

describe("ToolSigil font error state", () => {
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
