/* eslint-disable unicorn/text-encoding-identifier-case -- Render tests use small literal view models for glyph catalog UI states. */
import {
  DEFAULT_SIGIL_SCHEMA_ID,
  SIGIL_SCHEMA_OPTIONS,
} from "./sigil-schema-catalog.js";
import { describe, expect, it } from "vitest";
import {
  renderToolSigil,
  renderToolSigilSelection,
} from "./tool-sigil-render.js";
import { requireElement } from "./tool-sigil-test-support.js";
import type { ToolSigilViewModel } from "./tool-sigil-state.js";

const EMPTY_CHILD_COUNT = 0;
const EMPTY_CATALOG_MAPPED_GLYPH_OPTION_COUNT = 1;

const viewModel = (
  override: Partial<ToolSigilViewModel> = {},
): ToolSigilViewModel => ({
  characters: ".#+@e",
  contractIssues: [],
  downloadDisabled: true,
  drafts: [
    {
      defaultName: "u2605",
      glyph: {
        advanceWidth: 600,
        bounds: {
          x1: 0,
          x2: 600,
          y1: 0,
          y2: 1000,
        },
        path: "M0 0L600 0Z",
        unicode: "★",
        unitsPerEm: 1000,
      },
    },
  ],
  errors: [],
  fontFileNameText: "component-test.ttf",
  glyphCountText: "Glyphs ready: 1",
  glyphGroups: [],
  licenseOptions: [],
  namesByUnicode: {},
  previewFontFamily: "",
  requiredGlyphSelections: [
    {
      isValid: true,
      name: "floor",
      options: [{ label: ".", unicode: "." }],
      selectedUnicode: ".",
    },
  ],
  schemaOptions: SIGIL_SCHEMA_OPTIONS,
  selectedGlyphsByUnicode: {},
  selectedLicensesByUnicode: {},
  selectedSchemaId: DEFAULT_SIGIL_SCHEMA_ID,
  stagedGlyphGroupsByUnicode: {},
  ...override,
});

const createRenderShadowRoot = (): ShadowRoot => {
  const host = document.createElement("div");
  const shadowRoot = host.attachShadow({ mode: "open" });
  shadowRoot.innerHTML = `
    <p data-state="font-file-name"></p>
    <select name="schema"></select>
    <textarea name="characters"></textarea>
    <div data-state="required-glyph-selections"></div>
    <p data-state="summary"></p>
    <div data-state="glyph-list"></div>
    <div data-state="errors"></div>
    <button type="button" data-action="download">Download JSON</button>
  `;

  return shadowRoot;
};

const glyphCatalogViewModel = (): Pick<
  ToolSigilViewModel,
  "glyphGroups" | "licenseOptions"
> => ({
  glyphGroups: [
    {
      glyphs: [
        {
          glyph: "*",
          glyphKey: "ASTERISK",
          groupName: "ASCII",
          label: "ASTERISK *",
        },
      ],
      groupName: "ASCII",
      label: "ASCII",
    },
  ],
  licenseOptions: [
    {
      id: "mit",
      label: "MIT License (MIT)",
      name: "MIT License",
      spdxId: "MIT",
      value: "MIT",
    },
  ],
});

describe("renderToolSigil", () => {
  it("renders the preselected schema selector with textarea mappings", () => {
    const shadowRoot = createRenderShadowRoot();

    renderToolSigil(shadowRoot, viewModel());

    const schemaSelect = requireElement<HTMLSelectElement>(
      shadowRoot,
      'select[name="schema"]',
    );
    expect(schemaSelect.value).toBe("SigilGlyphMap");
    expect([...schemaSelect.options].map((option) => option.text)).toEqual([
      "SigilGlyphMap",
    ]);
    expect(
      requireElement<HTMLTextAreaElement>(
        shadowRoot,
        'textarea[name="characters"]',
      ).value,
    ).toBe(".#+@e");
    expect(
      requireElement<HTMLSelectElement>(
        shadowRoot,
        'select[data-action="required-glyph-character"][data-glyph-name="floor"]',
      ).value,
    ).toBe(".");
  });

  it("skips missing optional schema select", () => {
    const host = document.createElement("div");
    const shadowRoot = host.attachShadow({ mode: "open" });

    renderToolSigil(shadowRoot, viewModel());

    expect(shadowRoot.childElementCount).toBe(EMPTY_CHILD_COUNT);
  });
});

describe("renderToolSigil validation and catalog fallbacks", () => {
  it("renders contract issue messages", () => {
    const shadowRoot = createRenderShadowRoot();

    renderToolSigil(
      shadowRoot,
      viewModel({
        contractIssues: [{ message: "bad field", path: "floor.path" }],
      }),
    );

    expect(
      requireElement<HTMLElement>(shadowRoot, '[role="alert"]').textContent,
    ).toContain("floor.path: bad field");
  });

  it("renders empty catalog selection fallbacks", () => {
    const shadowRoot = createRenderShadowRoot();

    renderToolSigil(shadowRoot, viewModel());

    expect(
      requireElement<HTMLSelectElement>(
        shadowRoot,
        'select[data-action="glyph-group"][data-unicode="★"]',
      ).value,
    ).toBe("");
    expect(
      requireElement<HTMLSelectElement>(
        shadowRoot,
        'select[data-action="mapped-glyph"][data-unicode="★"]',
      ).options.length,
    ).toBe(EMPTY_CATALOG_MAPPED_GLYPH_OPTION_COUNT);
  });
});

describe("renderToolSigilSelection optional controls", () => {
  it("skips missing optional row controls", () => {
    const shadowRoot = createRenderShadowRoot();

    renderToolSigil(shadowRoot, viewModel());
    renderToolSigilSelection(shadowRoot, viewModel());
    requireElement<HTMLSelectElement>(
      shadowRoot,
      'select[data-action="glyph-group"][data-unicode="★"]',
    ).remove();
    requireElement<HTMLSelectElement>(
      shadowRoot,
      'select[data-action="license"][data-unicode="★"]',
    ).remove();

    renderToolSigilSelection(shadowRoot, viewModel());

    expect(
      requireElement<HTMLButtonElement>(
        shadowRoot,
        'button[data-action="download"]',
      ).disabled,
    ).toBe(true);
  });
});

describe("renderToolSigilSelection row values", () => {
  it("updates existing row control values", () => {
    const shadowRoot = createRenderShadowRoot();
    const { glyphGroups, licenseOptions } = glyphCatalogViewModel();

    renderToolSigil(shadowRoot, viewModel({ glyphGroups, licenseOptions }));
    renderToolSigilSelection(
      shadowRoot,
      viewModel({
        glyphGroups,
        licenseOptions,
        selectedLicensesByUnicode: {
          "★": "MIT",
        },
        stagedGlyphGroupsByUnicode: {
          "★": "ASCII",
        },
      }),
    );

    expect(
      requireElement<HTMLSelectElement>(
        shadowRoot,
        'select[data-action="glyph-group"][data-unicode="★"]',
      ).value,
    ).toBe("ASCII");
  });
});
