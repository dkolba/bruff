/* eslint-disable unicorn/text-encoding-identifier-case -- State test support uses catalog names such as ASCII. */
import { ok } from "@bruff/utils";

import { createTestFont } from "../font-test-fixture.js";
import {
  applyToolSigilFontLoadResult,
  createToolSigilState,
  setToolSigilCharacters,
  setToolSigilGlyphGroup,
  setToolSigilMappedGlyph,
  startToolSigilFontSelection,
  type ToolSigilState,
} from "./tool-sigil-state.js";

export const EMPTY_COUNT = 0;

export const SIGIL_GLYPH_MAP_CHARACTERS = ".#+@e";

export const ENEMY_UNICODE = "e";

export const SIGIL_GLYPH_MAP_NAMES_BY_UNICODE = {
  "#": "wall",
  "+": "door",
  ".": "floor",
  "@": "player",
  [ENEMY_UNICODE]: "enemy",
};

export const asteriskMapping = {
  glyph: "*",
  glyphKey: "ASTERISK",
  groupName: "ASCII",
};

/** Loads the current test font for a character set.
@param characters - Characters requested for extraction.
@returns Tool state with the current test font loaded.
*/
export const loadCurrentFontState = (characters: string): ToolSigilState => {
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

/** Builds a state with an asterisk glyph selected.
@returns State with ASCII asterisk mapping selected.
*/
export const selectedAsteriskState = (): ToolSigilState =>
  setToolSigilMappedGlyph(
    setToolSigilGlyphGroup(createToolSigilState(), "★", "ASCII"),
    "★",
    asteriskMapping,
  );
