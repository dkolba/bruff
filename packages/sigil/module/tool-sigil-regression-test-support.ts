import {
  appendToolSigil,
  clickDownload,
  loadCharactersFromTestFont,
  renameGlyph,
  requireElement,
  requireShadowRoot,
  selectDefaultMappingAndLicense,
  selectFiles,
  waitForComponentUpdate,
  waitForElement,
} from "./tool-sigil-test-support.js";
import {
  createMissingStarFontFile,
  createValidFontFile,
} from "./font-test-fixture.js";
import { expect } from "vitest";
import type { ToolSigil } from "./tool-sigil.js";

const DOWNLOADED_BLOB_COUNT = 1;
const PREVIEW_FONT_FAMILY_PREFIX = "tool-sigil-preview-font";
const REQUIRED_SCHEMA_UNICODES = [".", "#", "+", "@", "e"];

type CreatedBlobState = Readonly<{
  createdBlobs: ReadonlyArray<Blob>;
}>;

type DeferredFontBuffer = Readonly<{
  promise: Promise<ArrayBuffer>;
  resolve: (fontBuffer: ArrayBuffer) => void;
}>;

type StaleFontSelection = Readonly<{
  deferredFontBuffer: DeferredFontBuffer;
  staleFontBuffer: ArrayBuffer;
}>;

type RestoreBrowserStub = () => void;

type StubFontFaceLoad = () => RestoreBrowserStub;

const stubFontFaceLoad = (
  loadFontFace: (fontFace: FontFace) => Promise<FontFace>,
): RestoreBrowserStub => {
  const originalFontFace = globalThis.FontFace;

  class StubFontFace extends originalFontFace {
    override load(): Promise<FontFace> {
      return loadFontFace(this);
    }
  }

  Object.defineProperty(globalThis, "FontFace", {
    configurable: true,
    value: StubFontFace,
  });

  return (): void => {
    Object.defineProperty(globalThis, "FontFace", {
      configurable: true,
      value: originalFontFace,
    });
  };
};

const stubFastFontFaceLoad = (): RestoreBrowserStub =>
  stubFontFaceLoad((fontFace) => Promise.resolve(fontFace));

const stubRejectedFontFaceLoad = (): RestoreBrowserStub =>
  stubFontFaceLoad(() => Promise.reject(new Error("Rejected test font face.")));

const resolveDeferredFontBuffer = (
  resolveFontBuffer: ((fontBuffer: ArrayBuffer) => void) | null,
  fontBuffer: ArrayBuffer,
): void => {
  if (resolveFontBuffer === null) {
    return;
  }

  resolveFontBuffer(fontBuffer);
};

const createDeferredFontBuffer = (): DeferredFontBuffer => {
  let resolveFontBuffer: ((fontBuffer: ArrayBuffer) => void) | null = null;
  const promise = new Promise<ArrayBuffer>((resolve) => {
    resolveFontBuffer = resolve;
  });

  return {
    promise,
    resolve: (fontBuffer: ArrayBuffer): void => {
      resolveDeferredFontBuffer(resolveFontBuffer, fontBuffer);
    },
  };
};

const delayFontFileBuffer = (
  fontFile: File,
  fontBufferPromise: Promise<ArrayBuffer>,
): File => {
  Object.defineProperty(fontFile, "arrayBuffer", {
    configurable: true,
    value: (): Promise<ArrayBuffer> => fontBufferPromise,
  });

  return fontFile;
};

const loadDelayedStaleFontSelection = async (
  shadowRoot: ShadowRoot,
): Promise<StaleFontSelection> => {
  const staleFontFile = createMissingStarFontFile("older.ttf");
  const staleFontBuffer = await staleFontFile.arrayBuffer();
  const deferredFontBuffer = createDeferredFontBuffer();
  const fileInput = requireElement<HTMLInputElement>(
    shadowRoot,
    'input[type="file"][name="font-file"]',
  );
  selectFiles(fileInput, [
    delayFontFileBuffer(staleFontFile, deferredFontBuffer.promise),
  ]);

  return { deferredFontBuffer, staleFontBuffer };
};

const selectNewerFont = (shadowRoot: ShadowRoot): void => {
  const fileInput = requireElement<HTMLInputElement>(
    shadowRoot,
    'input[type="file"][name="font-file"]',
  );

  selectFiles(fileInput, [createValidFontFile("newer.ttf")]);
};

const expectNewerFontSelectionState = async (
  shadowRoot: ShadowRoot,
): Promise<void> => {
  const glyphNameInput = await waitForElement<HTMLInputElement>(
    shadowRoot,
    'input[data-unicode="."]',
  );

  expect(shadowRoot.textContent).toContain("newer.ttf");
  expect(shadowRoot.textContent).not.toContain('Missing glyph for ".".');
  expect(glyphNameInput.value).toBe("floor");
};

export const appendToolSigilWithShadowRoot = (): Readonly<{
  element: ToolSigil;
  shadowRoot: ShadowRoot;
}> => {
  const element = appendToolSigil();

  return { element, shadowRoot: requireShadowRoot(element) };
};

const expectFloorGlyphRow = async (shadowRoot: ShadowRoot): Promise<void> => {
  const glyphNameInput = await waitForElement<HTMLInputElement>(
    shadowRoot,
    'input[data-unicode="."]',
  );

  expect(glyphNameInput.value).toBe("floor");
};

const requirePartialExtractionBlob = (urlStubs: CreatedBlobState): Blob => {
  const [downloadBlob] = urlStubs.createdBlobs;
  if (downloadBlob === undefined) {
    throw new Error("Expected partial extraction JSON Blob.");
  }

  return downloadBlob;
};

export const expectPartialGlyphJsonDownload = async (
  shadowRoot: ShadowRoot,
  urlStubs: CreatedBlobState,
): Promise<void> => {
  await loadCharactersFromTestFont(shadowRoot, ".");
  await expectFloorGlyphRow(shadowRoot);
  REQUIRED_SCHEMA_UNICODES.forEach((unicode) => {
    selectDefaultMappingAndLicense(shadowRoot, unicode);
  });
  renameGlyph(shadowRoot, ".", "customFloor");
  clickDownload(shadowRoot);

  const blobText = await requirePartialExtractionBlob(urlStubs).text();
  expect(urlStubs.createdBlobs).toHaveLength(DOWNLOADED_BLOB_COUNT);
  expect(blobText).toContain('"customFloor"');
  expect(blobText).toContain('"wall"');
};

export const expectUploadedFontPreview = async (
  shadowRoot: ShadowRoot,
): Promise<void> => {
  await loadCharactersFromTestFont(shadowRoot, ".");
  selectDefaultMappingAndLicense(shadowRoot, ".");
  await waitForComponentUpdate();

  const preview = requireElement<HTMLElement>(shadowRoot, ".glyph-preview");
  expect(preview.style.fontFamily).toContain(PREVIEW_FONT_FAMILY_PREFIX);
};

const expectNewerFontSelectionWithFontFaceStub = async (
  shadowRoot: ShadowRoot,
  installFontFaceStub: StubFontFaceLoad,
): Promise<void> => {
  const restoreFontFace = installFontFaceStub();

  try {
    const { deferredFontBuffer, staleFontBuffer } =
      await loadDelayedStaleFontSelection(shadowRoot);
    selectNewerFont(shadowRoot);
    await expectNewerFontSelectionState(shadowRoot);

    deferredFontBuffer.resolve(staleFontBuffer);
    await waitForComponentUpdate();

    await expectNewerFontSelectionState(shadowRoot);
  } finally {
    restoreFontFace();
  }
};

export const expectNewerFontSelectionToWin = (
  shadowRoot: ShadowRoot,
): Promise<void> =>
  expectNewerFontSelectionWithFontFaceStub(shadowRoot, stubFastFontFaceLoad);

export const expectRejectedStalePreviewLoadIgnored = (
  shadowRoot: ShadowRoot,
): Promise<void> =>
  expectNewerFontSelectionWithFontFaceStub(
    shadowRoot,
    stubRejectedFontFaceLoad,
  );
