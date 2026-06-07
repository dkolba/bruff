/* eslint-disable sort-imports, unicorn/text-encoding-identifier-case -- Download tests use shared glyph group names such as ASCII. */
import "../index.js";
import {
  applyToolSigilFontLoadResult,
  createToolSigilState,
  selectToolSigilDownloadGlyphMap,
  setToolSigilCharacters,
  setToolSigilGlyphGroup,
  setToolSigilLicense,
  setToolSigilMappedGlyph,
  startToolSigilFontSelection,
  type ToolSigilState,
} from "./tool-sigil-state.js";
import { createTestFont } from "./font-test-fixture.js";
import { ok } from "@bruff/utils";
import {
  appendToolSigil,
  clickDownload,
  loadCharactersFromTestFont,
  requireShadowRoot,
  selectDefaultMappingAndLicense,
} from "./tool-sigil-test-support.js";
import { describe, expect, it } from "vitest";
/* eslint-enable sort-imports */
import {
  expectDeterministicFilenameDownload,
  expectEditedGlyphJsonDownload,
  expectInvalidGlyphDownloadBlocked,
  expectRevokedObjectUrlDownload,
  restoreDownloadTest,
  stubObjectUrls,
  trackDownloadClicks,
} from "./tool-sigil-download-test-support.js";

const REQUIRED_SCHEMA_UNICODES = [".", "#", "+", "@", "e"];

const defaultMapping = {
  glyph: "*",
  glyphKey: "ASTERISK",
  groupName: "ASCII",
};

const mappedStateForUnicode = (
  state: ToolSigilState,
  unicode: string,
): ToolSigilState =>
  setToolSigilLicense(
    setToolSigilMappedGlyph(
      setToolSigilGlyphGroup(state, unicode, "ASCII"),
      unicode,
      defaultMapping,
    ),
    unicode,
    "MIT",
  );

const selectSchemaMappingAndLicense = (shadowRoot: ShadowRoot): void => {
  REQUIRED_SCHEMA_UNICODES.map((unicode) =>
    selectDefaultMappingAndLicense(shadowRoot, unicode),
  );
};

const expectSourceGlyphJson = (blobText: string): void => {
  expect(blobText).toContain('"unicode": "."');
  expect(blobText).toContain('"mappedGlyph"');
  expect(blobText).toContain('"groupName": "ASCII"');
  expect(blobText).toContain('"glyphKey": "ASTERISK"');
  expect(blobText).toContain('"LICENSE": "MIT"');
};

const expectDownloadedSourceGlyphJson = async (
  shadowRoot: ShadowRoot,
  createdBlobs: ReadonlyArray<Blob>,
): Promise<void> => {
  await loadCharactersFromTestFont(shadowRoot, ".#+@e");
  selectSchemaMappingAndLicense(shadowRoot);
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

describe("ToolSigil selected glyph download state", () => {
  it("omits typed glyphs that are not selected by required contract fields", () => {
    const selection = startToolSigilFontSelection(
      setToolSigilCharacters(createToolSigilState(), ".#+@e★"),
      "component-test.ttf",
    );
    const loadedState = applyToolSigilFontLoadResult(
      selection.state,
      selection.fontLoadToken,
      ok(createTestFont()),
    );
    const mappedState = REQUIRED_SCHEMA_UNICODES.reduce(
      (currentState, unicode) => mappedStateForUnicode(currentState, unicode),
      loadedState,
    );
    const glyphMapResult = selectToolSigilDownloadGlyphMap(mappedState);

    expect(glyphMapResult.type).toBe("ok");
    if (glyphMapResult.type === "error") {
      return;
    }
    expect(Object.keys(glyphMapResult.value).toSorted()).toStrictEqual([
      "door",
      "enemy",
      "floor",
      "player",
      "wall",
    ]);
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
