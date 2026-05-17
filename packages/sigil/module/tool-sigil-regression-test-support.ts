import {
  appendToolSigil,
  clickDownload,
  enterCharacters,
  loadCharactersFromTestFont,
  renameGlyph,
  requireElement,
  requireShadowRoot,
  selectFiles,
  waitForComponentUpdate,
} from "./tool-sigil-test-support.js";
import {
  createMissingStarFontFile,
  createValidFontFile,
} from "./font-test-fixture.js";
import { expect } from "vitest";
import type { ToolSigil } from "./tool-sigil.js";

const DOWNLOADED_BLOB_COUNT = 1;
const PREVIEW_FONT_FAMILY_PREFIX = "tool-sigil-preview-font";

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
  const characterInput = requireElement<HTMLTextAreaElement>(
    shadowRoot,
    'textarea[name="characters"]',
  );

  selectFiles(fileInput, [
    delayFontFileBuffer(staleFontFile, deferredFontBuffer.promise),
  ]);
  enterCharacters(characterInput, "★");

  return { deferredFontBuffer, staleFontBuffer };
};

const selectNewerFont = (shadowRoot: ShadowRoot): void => {
  const fileInput = requireElement<HTMLInputElement>(
    shadowRoot,
    'input[type="file"][name="font-file"]',
  );

  selectFiles(fileInput, [createValidFontFile("newer.ttf")]);
};

const expectNewerFontSelectionState = (shadowRoot: ShadowRoot): void => {
  expect(shadowRoot.textContent).toContain("newer.ttf");
  expect(shadowRoot.textContent).not.toContain('Missing glyph for "★".');
  expect(
    requireElement<HTMLInputElement>(shadowRoot, 'input[data-unicode="★"]')
      .value,
  ).toBe("u2605");
};

const enterGlyphNameText = (
  glyphNameInput: HTMLInputElement,
  glyphName: string,
): void => {
  glyphNameInput.value = glyphName;
  glyphNameInput.dispatchEvent(new InputEvent("input", { bubbles: true }));
};

export const appendToolSigilWithShadowRoot = (): Readonly<{
  element: ToolSigil;
  shadowRoot: ShadowRoot;
}> => {
  const element = appendToolSigil();

  return { element, shadowRoot: requireShadowRoot(element) };
};

const expectMissingGlyphAlert = (shadowRoot: ShadowRoot): void => {
  const alert = requireElement<HTMLElement>(shadowRoot, '[role="alert"]');
  expect(alert.textContent).toContain('Missing glyph for "?".');
};

const expectStarGlyphRow = (shadowRoot: ShadowRoot): void => {
  expect(
    requireElement<HTMLInputElement>(shadowRoot, 'input[data-unicode="★"]')
      .value,
  ).toBe("u2605");
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
  await loadCharactersFromTestFont(shadowRoot, "★?");
  expectMissingGlyphAlert(shadowRoot);
  expectStarGlyphRow(shadowRoot);
  renameGlyph(shadowRoot, "★", "customStar");
  clickDownload(shadowRoot);

  const blobText = await requirePartialExtractionBlob(urlStubs).text();
  expect(urlStubs.createdBlobs).toHaveLength(DOWNLOADED_BLOB_COUNT);
  expect(blobText).toContain('"customStar"');
  expect(blobText).not.toContain('"?"');
};

export const expectUploadedFontPreview = async (
  shadowRoot: ShadowRoot,
): Promise<void> => {
  await loadCharactersFromTestFont(shadowRoot, "★");
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
    await waitForComponentUpdate();

    deferredFontBuffer.resolve(staleFontBuffer);
    await waitForComponentUpdate();

    expectNewerFontSelectionState(shadowRoot);
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

export const expectGlyphNameInputFocusPreserved = async (
  shadowRoot: ShadowRoot,
): Promise<void> => {
  await loadCharactersFromTestFont(shadowRoot, "★");

  const glyphNameInput = requireElement<HTMLInputElement>(
    shadowRoot,
    'input[data-unicode="★"]',
  );
  glyphNameInput.focus();

  enterGlyphNameText(glyphNameInput, "c");
  await waitForComponentUpdate();

  expect(shadowRoot.activeElement).toBe(glyphNameInput);

  enterGlyphNameText(glyphNameInput, "cu");
  await waitForComponentUpdate();

  expect(shadowRoot.activeElement).toBe(glyphNameInput);
  expect(glyphNameInput.value).toBe("cu");
};
