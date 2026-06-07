/* eslint-disable max-lines-per-function, sort-imports, unicorn/text-encoding-identifier-case -- State tests cover the full glyph/license state matrix and catalog names such as ASCII. */
import {
  applyToolSigilFontLoadResult,
  createToolSigilState,
  selectToolSigilViewModel,
  setToolSigilCharacters,
  setToolSigilGlyphGroup,
  setToolSigilLicense,
  setToolSigilMappedGlyph,
  setToolSigilRequiredGlyphCharacter,
  setToolSigilSchema,
  startToolSigilFontSelection,
  type ToolSigilState,
} from "./tool-sigil-state.js";
import { brand, error, ok } from "@bruff/utils";
import {
  DEFAULT_SIGIL_SCHEMA_ID,
  SIGIL_SCHEMA_OPTIONS,
} from "./sigil-schema-catalog.js";
import { createTestFont, createWallOnlyTestFont } from "./font-test-fixture.js";
import type { SigilExtractionError } from "./glyph-json.js";
import { requiredGlyphSelectionViews } from "./tool-sigil-required-glyph-selection.js";
import { describe, expect, it } from "vitest";

const EMPTY_COUNT = 0;
const FIRST_SCHEMA_OPTION_INDEX = 0;

const SIGIL_GLYPH_MAP_CHARACTERS = ".#+@e";

const ENEMY_UNICODE = "e";

const SIGIL_GLYPH_MAP_NAMES_BY_UNICODE = {
  "#": "wall",
  "+": "door",
  ".": "floor",
  "@": "player",
  [ENEMY_UNICODE]: "enemy",
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

  it("exposes required glyph defaults from the selected schema", () => {
    expect(
      createToolSigilState().schemaOptions[FIRST_SCHEMA_OPTION_INDEX]
        ?.requiredGlyphs,
    ).toStrictEqual([
      { defaultUnicode: ".", name: "floor", unicode: "." },
      { defaultUnicode: "#", name: "wall", unicode: "#" },
      { defaultUnicode: "+", name: "door", unicode: "+" },
      { defaultUnicode: "@", name: "player", unicode: "@" },
      { defaultUnicode: "e", name: "enemy", unicode: "e" },
    ]);
  });

  it("restores the default textarea value on initialization", () => {
    expect(createToolSigilState().characters).toBe(SIGIL_GLYPH_MAP_CHARACTERS);
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
      glyphCountText: "Glyphs ready: 6",
    });
  });

  it("keeps state unchanged for current and unknown schema ids", () => {
    const state = createToolSigilState();

    expect(setToolSigilSchema(state, DEFAULT_SIGIL_SCHEMA_ID)).toBe(state);
    expect(setToolSigilSchema(state, brand<"SigilSchemaId">("Unknown"))).toBe(
      state,
    );
  });
});

describe("ToolSigil schema partial font view state", () => {
  it("pre-fills every schema row when only one glyph exists in the font", () => {
    const selection = startToolSigilFontSelection(
      createToolSigilState(),
      "wall-only.ttf",
    );
    const loadedState = applyToolSigilFontLoadResult(
      selection.state,
      selection.fontLoadToken,
      ok(createWallOnlyTestFont()),
    );

    expect(loadedState.drafts.map((draft) => draft.glyph.unicode)).toEqual([
      ".",
      "#",
      "+",
      "@",
      "e",
    ]);
    expect(selectToolSigilViewModel(loadedState)).toMatchObject({
      downloadDisabled: true,
      glyphCountText: "Glyphs ready: 5",
      namesByUnicode: SIGIL_GLYPH_MAP_NAMES_BY_UNICODE,
    });
    expect(loadedState.errors.map((stateError) => stateError.message)).toEqual([
      'Missing glyph for ".".',
      'Missing glyph for "+".',
      'Missing glyph for "@".',
      'Missing glyph for "e".',
    ]);
  });
});

describe("ToolSigil schema selection view state", () => {
  it("marks required glyph selections invalid after character removal", () => {
    const state = setToolSigilCharacters(createToolSigilState(), "#");

    expect(
      requiredGlyphSelectionViews(
        state.characters,
        state.requiredGlyphSelections,
      ),
    ).toContainEqual({
      isValid: false,
      name: "floor",
      options: [{ label: "#", unicode: "#" }],
      selectedUnicode: ".",
    });
  });

  it("keeps state unchanged when required glyph selection is unchanged", () => {
    const state = createToolSigilState();

    expect(setToolSigilRequiredGlyphCharacter(state, "floor", ".")).toBe(state);
  });

  it("updates a required glyph source character selection", () => {
    const state = setToolSigilRequiredGlyphCharacter(
      createToolSigilState(),
      "floor",
      "#",
    );

    expect(state.requiredGlyphSelections).toContainEqual({
      name: "floor",
      unicode: "#",
    });
  });

  it("preserves valid required glyph selections when textarea changes", () => {
    const state = setToolSigilCharacters(createToolSigilState(), ".#+@ex");

    expect(state.requiredGlyphSelections).toStrictEqual([
      { name: "floor", unicode: "." },
      { name: "wall", unicode: "#" },
      { name: "door", unicode: "+" },
      { name: "player", unicode: "@" },
      { name: "enemy", unicode: "e" },
    ]);
  });

  it("re-extracts current font glyphs when selecting a schema", () => {
    const loadedState = loadCurrentFontState("★");
    const schemaState = setToolSigilSchema(
      {
        ...loadedState,
        selectedSchemaId: brand<"SigilSchemaId">("OtherSchema"),
      },
      DEFAULT_SIGIL_SCHEMA_ID,
    );

    expect(schemaState).toMatchObject({
      characters: SIGIL_GLYPH_MAP_CHARACTERS,
      namesByUnicode: SIGIL_GLYPH_MAP_NAMES_BY_UNICODE,
      selectedSchemaId: DEFAULT_SIGIL_SCHEMA_ID,
    });
    expect(schemaState.drafts.map((draft) => draft.glyph.unicode)).toEqual([
      ".",
      "#",
      "+",
      "@",
      "e",
    ]);
    expect(schemaState.errors).toEqual([]);
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
      "#": "MIT",
      "+": "MIT",
      ".": "MIT",
      "@": "MIT",
      [ENEMY_UNICODE]: "MIT",
      "♥": "MIT",
    });
  });
});
