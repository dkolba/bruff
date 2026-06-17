import { describe, expect, it } from "vitest";

import { renderRequiredGlyphSelections } from "./tool-sigil-required-glyph-render.js";
import { requireElement } from "./tool-sigil-test-support.js";

const createShadowRoot = (): ShadowRoot => {
  const host = document.createElement("div");
  const shadowRoot = host.attachShadow({ mode: "open" });
  shadowRoot.innerHTML = '<div data-state="required-glyph-selections"></div>';

  return shadowRoot;
};

describe("renderRequiredGlyphSelections", () => {
  it("renders source-character options for required glyphs", () => {
    const shadowRoot = createShadowRoot();

    renderRequiredGlyphSelections(shadowRoot, [
      {
        isValid: true,
        name: "floor",
        options: [
          { label: ".", unicode: "." },
          { label: "#", unicode: "#" },
        ],
        selectedUnicode: ".",
      },
    ]);

    const select = requireElement<HTMLSelectElement>(
      shadowRoot,
      'select[data-action="required-glyph-character"][data-glyph-name="floor"]',
    );
    expect(select.value).toBe(".");
    expect([...select.options].map((option) => option.value)).toStrictEqual([
      ".",
      "#",
    ]);
  });

  it("marks invalid selections", () => {
    const shadowRoot = createShadowRoot();

    renderRequiredGlyphSelections(shadowRoot, [
      {
        isValid: false,
        name: "floor",
        options: [{ label: "#", unicode: "#" }],
        selectedUnicode: ".",
      },
    ]);

    expect(
      requireElement<HTMLSelectElement>(
        shadowRoot,
        'select[data-action="required-glyph-character"]',
      ).hasAttribute("aria-invalid"),
    ).toBe(true);
  });
});
