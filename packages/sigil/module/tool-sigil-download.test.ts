import "../index.js";
import {
  appendToolSigil,
  clickDownload,
  loadCharactersFromTestFont,
  requireShadowRoot,
  selectDefaultMappingAndLicense,
} from "./tool-sigil-test-support.js";
import { describe, expect, it } from "vitest";
import {
  expectDeterministicFilenameDownload,
  expectEditedGlyphJsonDownload,
  expectInvalidGlyphDownloadBlocked,
  expectRevokedObjectUrlDownload,
  restoreDownloadTest,
  stubObjectUrls,
  trackDownloadClicks,
} from "./tool-sigil-download-test-support.js";

const expectSourceGlyphJson = (blobText: string): void => {
  expect(blobText).toContain('"unicode": "★"');
  expect(blobText).toContain('"mappedGlyph"');
  expect(blobText).toContain('"groupName": "ASCII"');
  expect(blobText).toContain('"glyphKey": "ASTERISK"');
  expect(blobText).toContain('"LICENSE": "MIT"');
};

const expectDownloadedSourceGlyphJson = async (
  shadowRoot: ShadowRoot,
  createdBlobs: ReadonlyArray<Blob>,
): Promise<void> => {
  await loadCharactersFromTestFont(shadowRoot, "★");
  selectDefaultMappingAndLicense(shadowRoot, "★");
  clickDownload(shadowRoot);

  const [blob] = createdBlobs;
  expect(blob).toBeInstanceOf(Blob);
  if (blob === undefined) {
    return;
  }
  expectSourceGlyphJson(await blob.text());
};

describe("ToolSigil edited glyph download state", () => {
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
});

describe("ToolSigil source glyph download state", () => {
  it("creates JSON entries with source unicode, mappedGlyph, and LICENSE", async () => {
    const urlStubs = stubObjectUrls();
    const element = appendToolSigil();
    const shadowRoot = requireShadowRoot(element);

    try {
      await expectDownloadedSourceGlyphJson(shadowRoot, urlStubs.createdBlobs);
    } finally {
      restoreDownloadTest(element, urlStubs);
    }
  });
});

describe("ToolSigil download command state", () => {
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
});

describe("ToolSigil invalid download state", () => {
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
