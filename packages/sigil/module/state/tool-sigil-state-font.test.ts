import { error } from "@bruff/utils";
import { describe, expect, it } from "vitest";

import type { SigilExtractionError } from "../glyph-json.js";
import {
  applyToolSigilFontLoadResult,
  createToolSigilState,
  selectToolSigilViewModel,
  startToolSigilFontSelection,
} from "./tool-sigil-state.js";

const invalidFontErrors: ReadonlyArray<SigilExtractionError> = [
  {
    message: 'Could not parse "broken.ttf" as a supported font.',
    type: "invalid-font",
  },
];

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
