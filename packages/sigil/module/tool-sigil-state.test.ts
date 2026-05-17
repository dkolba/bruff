import {
  applyToolSigilFontLoadResult,
  clearToolSigilPreviewFontFamily,
  createToolSigilState,
  selectToolSigilDownloadGlyphMap,
  selectToolSigilViewModel,
  setToolSigilCharacters,
  setToolSigilGlyphName,
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
    expect(selectToolSigilViewModel(createToolSigilState())).toStrictEqual({
      downloadDisabled: true,
      drafts: [],
      errors: [],
      fontFileNameText: "No font selected",
      glyphCountText: "Glyphs ready: 0",
      namesByUnicode: {},
      previewFontFamily: "",
    });
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
      downloadDisabled: false,
      fontFileNameText: "component-test.ttf",
      glyphCountText: "Glyphs ready: 1",
    });
    const glyphMapResult = selectToolSigilDownloadGlyphMap(loadedState);

    expect(glyphMapResult.type).toBe("ok");
    if (glyphMapResult.type === "error") {
      return;
    }
    expect(Object.keys(glyphMapResult.value)).toStrictEqual(["u2605"]);
    expect(
      Object.values(glyphMapResult.value).map((glyph) => glyph.unicode),
    ).toStrictEqual(["★"]);
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

    expect(selectToolSigilViewModel(namedState).errors).toStrictEqual([
      {
        message: 'Missing glyph for "?".',
        type: "missing-glyph",
      },
      {
        message: 'Invalid glyph name "".',
        type: "invalid-glyph-name",
      },
    ]);
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
