import { brand } from "@bruff/utils";
import { describe, expect, it } from "vitest";

import {
  DEFAULT_SIGIL_SCHEMA_ID,
  SIGIL_SCHEMA_OPTIONS,
} from "../sigil-schema-catalog.js";
import {
  createToolSigilState,
  selectToolSigilViewModel,
  setToolSigilSchema,
} from "./tool-sigil-state.js";
import {
  EMPTY_COUNT,
  loadCurrentFontState,
  SIGIL_GLYPH_MAP_CHARACTERS,
  SIGIL_GLYPH_MAP_NAMES_BY_UNICODE,
} from "./tool-sigil-state-test-support.js";

const FIRST_SCHEMA_OPTION_INDEX = 0;
const SCHEMA_AND_INPUT_GLYPH_READY_TEXT = "Glyphs ready: 6";

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
      glyphCountText: SCHEMA_AND_INPUT_GLYPH_READY_TEXT,
    });
  });

  it("maps required glyph selections to typed characters by schema order", () => {
    const loadedState = loadCurrentFontState("🌫️🔲🚪👺🤡");

    expect(loadedState.requiredGlyphSelections).toStrictEqual([
      { name: "floor", unicode: "🌫️" },
      { name: "wall", unicode: "🔲" },
      { name: "door", unicode: "🚪" },
      { name: "player", unicode: "👺" },
      { name: "enemy", unicode: "🤡" },
    ]);
  });

  it("does not append stale schema defaults after all required glyphs are replaced", () => {
    const viewModel = selectToolSigilViewModel(
      loadCurrentFontState("🌫️🔲🚪👺🤡"),
    );

    expect(viewModel.drafts.map((draft) => draft.glyph.unicode)).toStrictEqual([
      "🌫️",
      "🔲",
      "🚪",
      "👺",
      "🤡",
    ]);
  });

  it("preserves later required selections when replacement characters deduplicate", () => {
    const loadedState = loadCurrentFontState("★★★★★");

    expect(loadedState.requiredGlyphSelections).toStrictEqual([
      { name: "floor", unicode: "★" },
      { name: "wall", unicode: "#" },
      { name: "door", unicode: "+" },
      { name: "player", unicode: "@" },
      { name: "enemy", unicode: "e" },
    ]);
  });
});

describe("ToolSigil schema selection state", () => {
  it("keeps state unchanged for current and unknown schema ids", () => {
    const state = createToolSigilState();

    expect(setToolSigilSchema(state, DEFAULT_SIGIL_SCHEMA_ID)).toBe(state);
    expect(setToolSigilSchema(state, brand<"SigilSchemaId">("Unknown"))).toBe(
      state,
    );
  });
});
