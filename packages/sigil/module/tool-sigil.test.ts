import "../index.js";
import {
  appendToolSigil,
  enterCharacters,
  expectDeterministicFilenameDownload,
  expectEditedGlyphJsonDownload,
  expectInvalidGlyphDownloadBlocked,
  expectRevokedObjectUrlDownload,
  loadCharactersFromTestFont,
  requireElement,
  requireShadowRoot,
  restoreDownloadTest,
  selectFiles,
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
