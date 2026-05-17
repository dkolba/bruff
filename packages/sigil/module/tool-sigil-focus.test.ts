import "../index.js";
import {
  appendToolSigilWithShadowRoot,
  expectGlyphNameInputFocusPreserved,
} from "./tool-sigil-regression-test-support.js";
import { describe, it } from "vitest";

describe("ToolSigil glyph-name focus state", () => {
  it("preserves focus while typing a multi-character glyph name", async () => {
    const { element, shadowRoot } = appendToolSigilWithShadowRoot();

    try {
      await expectGlyphNameInputFocusPreserved(shadowRoot);
    } finally {
      element.remove();
    }
  });
});
