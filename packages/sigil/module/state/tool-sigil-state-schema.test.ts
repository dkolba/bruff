import { brand, ok } from "@bruff/utils";
import { describe, expect, it } from "vitest";

import { createWallOnlyTestFont } from "../font-test-fixture.js";
import { DEFAULT_SIGIL_SCHEMA_ID } from "../sigil-schema-catalog.js";
import { requiredGlyphSelectionViews } from "../tool-sigil-required-glyph-selection.js";
import {
  applyToolSigilFontLoadResult,
  createToolSigilState,
  selectToolSigilViewModel,
  setToolSigilCharacters,
  setToolSigilRequiredGlyphCharacter,
  setToolSigilSchema,
  startToolSigilFontSelection,
} from "./tool-sigil-state.js";
import {
  loadCurrentFontState,
  SIGIL_GLYPH_MAP_NAMES_BY_UNICODE,
} from "./tool-sigil-state-test-support.js";

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
});

describe("ToolSigil schema font reload state", () => {
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
      characters: ".#+@e",
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
