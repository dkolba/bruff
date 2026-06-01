/* eslint-disable max-lines, max-lines-per-function, max-statements, unicorn/text-encoding-identifier-case -- Component integration tests cover the full Sigil browser workflow and glyph group names such as ASCII. */
import "../index.js";
import {
  appendToolSigil,
  clickDownload,
  enterCharacters,
  expectDeterministicFilenameDownload,
  expectEditedGlyphJsonDownload,
  expectInvalidGlyphDownloadBlocked,
  expectRevokedObjectUrlDownload,
  loadCharactersFromTestFont,
  requireElement,
  requireShadowRoot,
  restoreDownloadTest,
  selectDefaultMappingAndLicense,
  selectFiles,
  selectGlyphGroup,
  selectLicense,
  selectMappedGlyph,
  stubObjectUrls,
  trackDownloadClicks,
  waitForComponentUpdate,
} from "./tool-sigil-test-support.js";
import {
  appendToolSigilWithShadowRoot,
  expectNewerFontSelectionToWin,
  expectPartialGlyphJsonDownload,
  expectRejectedStalePreviewLoadIgnored,
  expectUploadedFontPreview,
} from "./tool-sigil-regression-test-support.js";
import { describe, expect, it } from "vitest";
import { createValidFontFile } from "./font-test-fixture.js";
import { registerToolSigil } from "./register-tool-sigil.js";
import { ToolSigil } from "./tool-sigil.js";

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

describe("ToolSigil input state", () => {
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

  it("keeps character input state", () => {
    const element = appendToolSigil();
    const shadowRoot = requireShadowRoot(element);
    const characterInput = requireElement<HTMLTextAreaElement>(
      shadowRoot,
      'textarea[name="characters"]',
    );

    enterCharacters(characterInput, "★");

    expect(characterInput.value).toBe("★");

    element.remove();
  });
});

describe("ToolSigil glyph-name state", () => {
  it("renders editable glyph-name fields", async () => {
    const element = appendToolSigil();
    const shadowRoot = requireShadowRoot(element);

    await loadCharactersFromTestFont(shadowRoot, "★");

    const glyphNameInput = requireElement<HTMLInputElement>(
      shadowRoot,
      'input[data-unicode="★"]',
    );
    expect(glyphNameInput.value).toBe("u2605");
    glyphNameInput.value = "";
    glyphNameInput.dispatchEvent(new InputEvent("input", { bubbles: true }));

    const alert = requireElement<HTMLElement>(shadowRoot, '[role="alert"]');
    expect(alert.textContent).toContain('Invalid glyph name "".');

    element.remove();
  });
});

describe("ToolSigil glyph mapping state", () => {
  it("renders staged glyph group selects and filtered glyph selects", async () => {
    const element = appendToolSigil();
    const shadowRoot = requireShadowRoot(element);

    await loadCharactersFromTestFont(shadowRoot, "★");

    const groupSelect = requireElement<HTMLSelectElement>(
      shadowRoot,
      'select[data-action="glyph-group"][data-unicode="★"]',
    );
    const glyphSelect = requireElement<HTMLSelectElement>(
      shadowRoot,
      'select[data-action="mapped-glyph"][data-unicode="★"]',
    );
    expect([...groupSelect.options].map((option) => option.value)).toContain(
      "ASCII",
    );
    expect([...glyphSelect.options].map((option) => option.value)).toContain(
      "ASTERISK",
    );
    selectGlyphGroup(shadowRoot, "★", "BOX");
    expect([...glyphSelect.options].map((option) => option.value)).toContain(
      "H",
    );
    expect(
      [...glyphSelect.options].map((option) => option.value),
    ).not.toContain("ASTERISK");

    element.remove();
  });
});

describe("ToolSigil license state", () => {
  it("renders OSI license options and applies the current value", async () => {
    const element = appendToolSigil();
    const shadowRoot = requireShadowRoot(element);

    await loadCharactersFromTestFont(shadowRoot, "★");

    const licenseSelect = requireElement<HTMLSelectElement>(
      shadowRoot,
      'select[data-action="license"][data-unicode="★"]',
    );
    expect([...licenseSelect.options].map((option) => option.value)).toEqual(
      expect.arrayContaining(["Apache-2.0", "MIT", "OFL-1.1"]),
    );
    selectLicense(shadowRoot, "★", "MIT");
    expect(licenseSelect.value).toBe("MIT");

    element.remove();
  });

  it("keeps selection rendering stable when an optional row control is absent", async () => {
    const element = appendToolSigil();
    const shadowRoot = requireShadowRoot(element);

    await loadCharactersFromTestFont(shadowRoot, "★");
    requireElement<HTMLSelectElement>(
      shadowRoot,
      'select[data-action="mapped-glyph"][data-unicode="★"]',
    ).remove();
    selectLicense(shadowRoot, "★", "MIT");

    expect(
      requireElement<HTMLSelectElement>(
        shadowRoot,
        'select[data-action="license"][data-unicode="★"]',
      ).value,
    ).toBe("MIT");

    element.remove();
  });

  it("defaults a new row to the last selected license", async () => {
    const element = appendToolSigil();
    const shadowRoot = requireShadowRoot(element);

    await loadCharactersFromTestFont(shadowRoot, "★");
    selectLicense(shadowRoot, "★", "MIT");
    await loadCharactersFromTestFont(shadowRoot, "♥");

    expect(
      requireElement<HTMLSelectElement>(
        shadowRoot,
        'select[data-action="license"][data-unicode="♥"]',
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

    await loadCharactersFromTestFont(shadowRoot, "★");
    expect(downloadButton.disabled).toBe(true);

    selectMappedGlyph(shadowRoot, "★", "ASTERISK");
    expect(downloadButton.disabled).toBe(true);

    selectLicense(shadowRoot, "★", "MIT");
    expect(downloadButton.disabled).toBe(false);

    element.remove();
  });
});

describe("ToolSigil download state", () => {
  it("creates a JSON Blob with edited glyph names", async () => {
    const urlStubs = stubObjectUrls();
    const element = appendToolSigil();
    const shadowRoot = requireShadowRoot(element);

    try {
      await expectEditedGlyphJsonDownload(shadowRoot, urlStubs);
    } finally {
      restoreDownloadTest(element, urlStubs);
    }
  });

  it("creates JSON entries with source unicode, mappedGlyph, and LICENSE", async () => {
    const urlStubs = stubObjectUrls();
    const element = appendToolSigil();
    const shadowRoot = requireShadowRoot(element);

    try {
      await loadCharactersFromTestFont(shadowRoot, "★");
      selectDefaultMappingAndLicense(shadowRoot, "★");
      clickDownload(shadowRoot);

      const [blob] = urlStubs.createdBlobs;
      expect(blob).toBeInstanceOf(Blob);
      if (blob === undefined) {
        return;
      }
      const blobText = await blob.text();
      expect(blobText).toContain('"unicode": "★"');
      expect(blobText).toContain('"mappedGlyph"');
      expect(blobText).toContain('"groupName": "ASCII"');
      expect(blobText).toContain('"glyphKey": "ASTERISK"');
      expect(blobText).toContain('"LICENSE": "MIT"');
    } finally {
      restoreDownloadTest(element, urlStubs);
    }
  });

  it("uses a deterministic sigil.json filename", async () => {
    const urlStubs = stubObjectUrls();
    const clickState = trackDownloadClicks();
    const element = appendToolSigil();
    const shadowRoot = requireShadowRoot(element);

    try {
      await expectDeterministicFilenameDownload(shadowRoot, clickState);
    } finally {
      restoreDownloadTest(element, urlStubs, clickState);
    }
  });

  it("revokes the object URL after download", async () => {
    const urlStubs = stubObjectUrls();
    const element = appendToolSigil();
    const shadowRoot = requireShadowRoot(element);

    try {
      await expectRevokedObjectUrlDownload(shadowRoot, urlStubs);
    } finally {
      restoreDownloadTest(element, urlStubs);
    }
  });

  it("does not create JSON when glyph names are invalid", async () => {
    const urlStubs = stubObjectUrls();
    const element = appendToolSigil();
    const shadowRoot = requireShadowRoot(element);

    try {
      await expectInvalidGlyphDownloadBlocked(shadowRoot, urlStubs);
    } finally {
      restoreDownloadTest(element, urlStubs);
    }
  });
});

describe("ToolSigil error state", () => {
  it("shows font loading errors", async () => {
    const element = appendToolSigil();
    const shadowRoot = requireShadowRoot(element);
    const fileInput = requireElement<HTMLInputElement>(
      shadowRoot,
      'input[type="file"][name="font-file"]',
    );

    selectFiles(fileInput, [new File(["not a font"], "broken.ttf")]);
    await waitForComponentUpdate();

    const alert = requireElement<HTMLElement>(shadowRoot, '[role="alert"]');
    expect(alert.textContent).toContain(
      'Could not parse "broken.ttf" as a supported font.',
    );

    element.remove();
  });

  it("shows missing glyph errors", async () => {
    const element = appendToolSigil();
    const shadowRoot = requireShadowRoot(element);

    await loadCharactersFromTestFont(shadowRoot, "?");

    const alert = requireElement<HTMLElement>(shadowRoot, '[role="alert"]');
    expect(alert.textContent).toContain('Missing glyph for "?".');

    element.remove();
  });
});

describe("ToolSigil partial extraction state", () => {
  it("keeps valid glyph rows downloadable while showing missing glyph errors", async () => {
    const urlStubs = stubObjectUrls();
    const { element, shadowRoot } = appendToolSigilWithShadowRoot();

    try {
      await expectPartialGlyphJsonDownload(shadowRoot, urlStubs);
    } finally {
      restoreDownloadTest(element, urlStubs);
    }
  });
});

describe("ToolSigil uploaded font preview", () => {
  it("uses the uploaded font family for glyph previews", async () => {
    const { element, shadowRoot } = appendToolSigilWithShadowRoot();

    try {
      await expectUploadedFontPreview(shadowRoot);
    } finally {
      element.remove();
    }
  });
});

describe("ToolSigil stale font load state", () => {
  it("ignores older font-load completion after a newer selection", async () => {
    const { element, shadowRoot } = appendToolSigilWithShadowRoot();

    try {
      await expectNewerFontSelectionToWin(shadowRoot);
    } finally {
      element.remove();
    }
  });

  it("ignores older preview-load rejection after a newer selection", async () => {
    const { element, shadowRoot } = appendToolSigilWithShadowRoot();

    try {
      await expectRejectedStalePreviewLoadIgnored(shadowRoot);
    } finally {
      element.remove();
    }
  });
});
