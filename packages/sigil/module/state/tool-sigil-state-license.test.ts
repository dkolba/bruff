/* eslint-disable sort-imports -- State split keeps dependency groups readable. */
import {
  applyToolSigilFontLoadResult,
  createToolSigilState,
  selectToolSigilViewModel,
  setToolSigilCharacters,
  setToolSigilLicense,
  startToolSigilFontSelection,
} from "./tool-sigil-state.js";
import { ENEMY_UNICODE } from "./tool-sigil-state-test-support.js";
import { createTestFont } from "../font-test-fixture.js";
import { describe, expect, it } from "vitest";
import { ok } from "@bruff/utils";

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
