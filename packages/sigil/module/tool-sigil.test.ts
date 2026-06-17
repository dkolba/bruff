/* eslint-disable unicorn/text-encoding-identifier-case -- Component integration tests cover the full Sigil browser workflow and glyph group names such as ASCII. */
import "../index.js";

import { describe, expect, it } from "vitest";

import { createValidFontFile } from "./font-test-fixture.js";
import { registerToolSigil } from "./register-tool-sigil.js";
import { ToolSigil } from "./tool-sigil.js";
import {
  appendToolSigil,
  loadCharactersFromTestFont,
  requireElement,
  requireShadowRoot,
  selectFiles,
  selectGlyphGroup,
  selectLicense,
  selectMappedGlyph,
  waitForComponentUpdate,
} from "./tool-sigil-test-support.js";

const EXPECTED_REQUIRED_GLYPH_NAMES = [
  "floor",
  "wall",
  "door",
  "player",
  "enemy",
];

const selectedOptionValues = (
  select: HTMLSelectElement,
): ReadonlyArray<string> => [...select.options].map((option) => option.value);

const expectInitialGlyphMappingOptions = (shadowRoot: ShadowRoot): void => {
  const groupSelect = requireElement<HTMLSelectElement>(
    shadowRoot,
    'select[data-action="glyph-group"][data-unicode="."]',
  );
  const glyphSelect = requireElement<HTMLSelectElement>(
    shadowRoot,
    'select[data-action="mapped-glyph"][data-unicode="."]',
  );

  expect(selectedOptionValues(groupSelect)).toContain("ASCII");
  expect(selectedOptionValues(glyphSelect)).toContain("ASTERISK");
};

const clearGlyphName = (glyphNameInput: HTMLInputElement): void => {
  glyphNameInput.value = "";
  glyphNameInput.dispatchEvent(new InputEvent("input", { bubbles: true }));
};

const renderedGlyphNames = (shadowRoot: ShadowRoot): ReadonlyArray<string> =>
  [
    ...shadowRoot.querySelectorAll<HTMLInputElement>(
      '[data-state="glyph-list"] input',
    ),
  ].map((input) => input.value);

const expectBoxGlyphMappingOptions = (shadowRoot: ShadowRoot): void => {
  const glyphSelect = requireElement<HTMLSelectElement>(
    shadowRoot,
    'select[data-action="mapped-glyph"][data-unicode="."]',
  );

  expect(selectedOptionValues(glyphSelect)).toContain("H");
  expect(selectedOptionValues(glyphSelect)).not.toContain("ASTERISK");
};

describe("ToolSigil registration", () => {
  it("registers <tool-sigil> as a custom element", () => {
    expect(customElements.get("tool-sigil")).toBe(ToolSigil);
  });

  it("keeps an existing custom element registration", () => {
    registerToolSigil();

    expect(customElements.get("tool-sigil")).toBe(ToolSigil);
  });
});

describe("ToolSigil placeholder", () => {
  it("renders a minimal accessible placeholder", () => {
    const element = document.createElement("tool-sigil");

    document.body.append(element);

    const heading = element.shadowRoot?.querySelector("h1");
    expect(element).toBeInstanceOf(ToolSigil);
    expect(heading?.textContent).toBe("Sigil Tool");
    expect(heading?.id).toBe("sigil-tool-title");

    element.remove();
  });

  it("does not recreate the shadow root when reconnected", () => {
    const element = new ToolSigil();

    document.body.append(element);
    const { shadowRoot } = element;
    element.connectedCallback();
    const { shadowRoot: nextShadowRoot } = element;

    expect(nextShadowRoot).toBe(shadowRoot);

    element.remove();
  });
});

describe("ToolSigil font input state", () => {
  it("shows the selected font file", async () => {
    const element = appendToolSigil();
    const shadowRoot = requireShadowRoot(element);
    const fileInput = requireElement<HTMLInputElement>(
      shadowRoot,
      'input[type="file"][name="font-file"]',
    );

    selectFiles(fileInput, [createValidFontFile("component-test.ttf")]);
    await waitForComponentUpdate();

    expect(shadowRoot.textContent).toContain("component-test.ttf");

    element.remove();
  });

  it("clears the selected font file", async () => {
    const element = appendToolSigil();
    const shadowRoot = requireShadowRoot(element);
    const fileInput = requireElement<HTMLInputElement>(
      shadowRoot,
      'input[type="file"][name="font-file"]',
    );

    selectFiles(fileInput, []);
    await waitForComponentUpdate();

    expect(shadowRoot.textContent).toContain("No font selected");

    element.remove();
  });
});

describe("ToolSigil schema input state", () => {
  it("preselects the SigilGlyphMap schema", () => {
    const element = appendToolSigil();
    const shadowRoot = requireShadowRoot(element);
    const schemaSelect = requireElement<HTMLSelectElement>(
      shadowRoot,
      'select[name="schema"]',
    );

    expect(schemaSelect.value).toBe("SigilGlyphMap");
    schemaSelect.dispatchEvent(new Event("change", { bubbles: true }));
    expect(schemaSelect.value).toBe("SigilGlyphMap");

    element.remove();
  });
});

describe("ToolSigil required glyph input state", () => {
  it("updates required glyph options from textarea input", () => {
    const element = appendToolSigil();
    const shadowRoot = requireShadowRoot(element);
    const textarea = requireElement<HTMLTextAreaElement>(
      shadowRoot,
      'textarea[name="characters"]',
    );

    textarea.value = "#";
    textarea.dispatchEvent(new InputEvent("input", { bubbles: true }));

    expect(
      requireElement<HTMLSelectElement>(
        shadowRoot,
        'select[data-action="required-glyph-character"][data-glyph-name="floor"]',
      ).hasAttribute("aria-invalid"),
    ).toBe(true);

    element.remove();
  });

  it("updates required glyph source character selections", () => {
    const element = appendToolSigil();
    const shadowRoot = requireShadowRoot(element);
    const select = requireElement<HTMLSelectElement>(
      shadowRoot,
      'select[data-action="required-glyph-character"][data-glyph-name="floor"]',
    );

    select.value = "#";
    select.dispatchEvent(new Event("change", { bubbles: true }));

    expect(select.value).toBe("#");

    element.remove();
  });
});

describe("ToolSigil glyph-name state", () => {
  it("renders editable glyph-name fields", async () => {
    const element = appendToolSigil();
    const shadowRoot = requireShadowRoot(element);

    await loadCharactersFromTestFont(shadowRoot, ".");

    const glyphNameInput = requireElement<HTMLInputElement>(
      shadowRoot,
      'input[data-unicode="."]',
    );
    expect(glyphNameInput.value).toBe("floor");
    expect(renderedGlyphNames(shadowRoot)).toEqual(
      EXPECTED_REQUIRED_GLYPH_NAMES,
    );
    clearGlyphName(glyphNameInput);

    expect(glyphNameInput.value).toBe("");

    element.remove();
  });
});

describe("ToolSigil glyph mapping state", () => {
  it("renders staged glyph group selects and filtered glyph selects", async () => {
    const element = appendToolSigil();
    const shadowRoot = requireShadowRoot(element);

    await loadCharactersFromTestFont(shadowRoot, ".");
    expectInitialGlyphMappingOptions(shadowRoot);
    selectGlyphGroup(shadowRoot, ".", "BOX");
    expectBoxGlyphMappingOptions(shadowRoot);

    element.remove();
  });
});

describe("ToolSigil license option state", () => {
  it("renders OSI license options and applies the current value", async () => {
    const element = appendToolSigil();
    const shadowRoot = requireShadowRoot(element);

    await loadCharactersFromTestFont(shadowRoot, ".");

    const licenseSelect = requireElement<HTMLSelectElement>(
      shadowRoot,
      'select[data-action="license"][data-unicode="."]',
    );
    expect([...licenseSelect.options].map((option) => option.value)).toEqual(
      expect.arrayContaining(["Apache-2.0", "MIT", "OFL-1.1"]),
    );
    selectLicense(shadowRoot, ".", "MIT");
    expect(licenseSelect.value).toBe("MIT");

    element.remove();
  });
});

describe("ToolSigil optional license control state", () => {
  it("keeps selection rendering stable when an optional row control is absent", async () => {
    const element = appendToolSigil();
    const shadowRoot = requireShadowRoot(element);

    await loadCharactersFromTestFont(shadowRoot, ".");
    requireElement<HTMLSelectElement>(
      shadowRoot,
      'select[data-action="mapped-glyph"][data-unicode="."]',
    ).remove();
    selectLicense(shadowRoot, ".", "MIT");

    expect(
      requireElement<HTMLSelectElement>(
        shadowRoot,
        'select[data-action="license"][data-unicode="."]',
      ).value,
    ).toBe("MIT");

    element.remove();
  });
});

describe("ToolSigil license default state", () => {
  it("defaults a new row to the last selected license", async () => {
    const element = appendToolSigil();
    const shadowRoot = requireShadowRoot(element);

    await loadCharactersFromTestFont(shadowRoot, ".");
    selectLicense(shadowRoot, ".", "MIT");
    await loadCharactersFromTestFont(shadowRoot, ".");

    expect(
      requireElement<HTMLSelectElement>(
        shadowRoot,
        'select[data-action="license"][data-unicode="."]',
      ).value,
    ).toBe("MIT");

    element.remove();
  });
});

describe("ToolSigil output state", () => {
  it("disables download until JSON is valid", () => {
    const element = appendToolSigil();
    const shadowRoot = requireShadowRoot(element);
    const downloadButton = requireElement<HTMLButtonElement>(
      shadowRoot,
      'button[data-action="download"]',
    );

    expect(downloadButton.disabled).toBe(true);

    element.remove();
  });

  it("keeps download disabled until every row has a mapped glyph and license", async () => {
    const element = appendToolSigil();
    const shadowRoot = requireShadowRoot(element);
    const downloadButton = requireElement<HTMLButtonElement>(
      shadowRoot,
      'button[data-action="download"]',
    );

    await loadCharactersFromTestFont(shadowRoot, ".");
    expect(downloadButton.disabled).toBe(true);

    selectMappedGlyph(shadowRoot, ".", "ASTERISK");
    expect(downloadButton.disabled).toBe(true);

    selectLicense(shadowRoot, ".", "MIT");
    expect(downloadButton.disabled).toBe(true);

    element.remove();
  });
});
