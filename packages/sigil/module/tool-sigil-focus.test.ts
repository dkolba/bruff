import "../index.js";
import {
  appendToolSigilWithShadowRoot,
  expectGlyphNameInputFocusPreserved,
  expectGlyphSelectFocusPreserved,
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

  it("preserves focus while changing staged glyph selects", async () => {
    const { element, shadowRoot } = appendToolSigilWithShadowRoot();

    try {
      await expectGlyphSelectFocusPreserved(shadowRoot);
    } finally {
      element.remove();
    }
  });
});
