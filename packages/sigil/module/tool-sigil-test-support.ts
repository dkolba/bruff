import { createValidFontFile } from "./font-test-fixture.js";
import { expect } from "vitest";
import { ToolSigil } from "./tool-sigil.js";

const COMPONENT_UPDATE_DELAY_MS = 20;

/** Browser URL API stubs captured for download tests. */
export type ObjectUrlStubState = Readonly<{
  createdBlobs: ReadonlyArray<Blob>;
  restore: () => void;
  revokedUrls: ReadonlyArray<string>;
}>;

/** Captured anchor-click state for download tests. */
export type DownloadClickState = Readonly<{
  downloads: ReadonlyArray<string>;
  hrefs: ReadonlyArray<string>;
  restore: () => void;
}>;

/** Appends a fresh sigil tool element. */
export const appendToolSigil = (): ToolSigil => {
  const element = new ToolSigil();

  document.body.append(element);

  return element;
};

/** Returns an attached shadow root or fails the test. */
export const requireShadowRoot = (element: ToolSigil): ShadowRoot => {
  const { shadowRoot } = element;
  if (shadowRoot === null) {
    throw new Error("Expected tool-sigil to have a shadow root.");
  }

  return shadowRoot;
};

/** Returns a matched shadow DOM element or fails the test. */
export const requireElement = <ElementType extends Element>(
  shadowRoot: ShadowRoot,
  selector: string,
): ElementType => {
  const element = shadowRoot.querySelector<ElementType>(selector);
  if (element === null) {
    throw new Error(`Expected selector "${selector}" to match an element.`);
  }

  return element;
};

/** Waits for component microtasks and file parsing to settle in browser tests. */
export const waitForComponentUpdate = (): Promise<void> =>
  new Promise((resolve) => {
    globalThis.setTimeout(resolve, COMPONENT_UPDATE_DELAY_MS);
  });

/** Replaces a file input's selected files and dispatches change. */
export const selectFiles = (
  fileInput: HTMLInputElement,
  files: ReadonlyArray<File>,
): void => {
  const dataTransfer = new DataTransfer();
  files.reduce<DataTransfer>((currentDataTransfer, file) => {
    currentDataTransfer.items.add(file);
    return currentDataTransfer;
  }, dataTransfer);

  Object.defineProperty(fileInput, "files", {
    configurable: true,
    value: dataTransfer.files,
  });
  fileInput.dispatchEvent(new Event("change", { bubbles: true }));
};

/** Enters characters into the component textarea. */
export const enterCharacters = (
  characterInput: HTMLTextAreaElement,
  characters: string,
): void => {
  characterInput.value = characters;
  characterInput.dispatchEvent(new InputEvent("input", { bubbles: true }));
};

/** Loads the test font and enters characters. */
export const loadCharactersFromTestFont = async (
  shadowRoot: ShadowRoot,
  characters: string,
): Promise<void> => {
  const fileInput = requireElement<HTMLInputElement>(
    shadowRoot,
    'input[type="file"][name="font-file"]',
  );
  const characterInput = requireElement<HTMLTextAreaElement>(
    shadowRoot,
    'textarea[name="characters"]',
  );

  selectFiles(fileInput, [createValidFontFile("component-test.ttf")]);
  enterCharacters(characterInput, characters);
  await waitForComponentUpdate();
};

/** Renames one rendered glyph input. */
export const renameGlyph = (
  shadowRoot: ShadowRoot,
  unicode: string,
  glyphName: string,
): void => {
  const glyphNameInput = requireElement<HTMLInputElement>(
    shadowRoot,
    `input[data-unicode="${unicode}"]`,
  );

  glyphNameInput.value = glyphName;
  glyphNameInput.dispatchEvent(new InputEvent("input", { bubbles: true }));
};

/** Clicks the component download button. */
export const clickDownload = (shadowRoot: ShadowRoot): void => {
  requireElement<HTMLButtonElement>(
    shadowRoot,
    'button[data-action="download"]',
  ).click();
};

/** Dispatches a download click even when the button is disabled. */
export const forceDownloadClick = (shadowRoot: ShadowRoot): void => {
  requireElement<HTMLButtonElement>(
    shadowRoot,
    'button[data-action="download"]',
  ).dispatchEvent(new MouseEvent("click", { bubbles: true }));
};

/** Stubs object URL creation and revocation. */
export const stubObjectUrls = (): ObjectUrlStubState => {
  const createdBlobs: Array<Blob> = [];
  const revokedUrls: Array<string> = [];
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: (blob: Blob): string => {
      createdBlobs.push(blob);
      return "blob:sigil-json";
    },
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: (url: string): void => {
      revokedUrls.push(url);
    },
  });

  return {
    createdBlobs,
    restore: (): void => {
      Object.defineProperty(URL, "createObjectURL", {
        configurable: true,
        value: originalCreateObjectURL,
      });
      Object.defineProperty(URL, "revokeObjectURL", {
        configurable: true,
        value: originalRevokeObjectURL,
      });
    },
    revokedUrls,
  };
};

/** Captures clicked anchor download metadata. */
export const trackDownloadClicks = (): DownloadClickState => {
  const downloads: Array<string> = [];
  const hrefs: Array<string> = [];
  const trackClick = (event: MouseEvent): void => {
    const { target } = event;
    if (!(target instanceof HTMLAnchorElement)) {
      return;
    }

    downloads.push(target.download);
    hrefs.push(target.href);
    event.preventDefault();
  };

  document.addEventListener("click", trackClick, true);

  return {
    downloads,
    hrefs,
    restore: (): void => {
      document.removeEventListener("click", trackClick, true);
    },
  };
};

const requireFirstBlob = (blobs: ReadonlyArray<Blob>): Blob => {
  const [blob] = blobs;
  if (blob === undefined) {
    throw new Error("Expected a JSON Blob to be created.");
  }

  return blob;
};

/** Expects a download Blob to contain an edited glyph name. */
export const expectEditedGlyphJsonDownload = async (
  shadowRoot: ShadowRoot,
  urlStubs: ObjectUrlStubState,
): Promise<void> => {
  await loadCharactersFromTestFont(shadowRoot, "★");
  renameGlyph(shadowRoot, "★", "customStar");
  clickDownload(shadowRoot);

  const blob = requireFirstBlob(urlStubs.createdBlobs);
  const blobText = await blob.text();
  expect(blob.type).toBe("application/json");
  expect(blobText).toContain('"customStar"');
  expect(blobText).not.toContain('"u2605"');
};

/** Expects a download click to use the fixed sigil filename. */
export const expectDeterministicFilenameDownload = async (
  shadowRoot: ShadowRoot,
  clickState: DownloadClickState,
): Promise<void> => {
  await loadCharactersFromTestFont(shadowRoot, "★");
  clickDownload(shadowRoot);

  expect(clickState.downloads).toEqual(["sigil.json"]);
  expect(clickState.hrefs).toEqual(["blob:sigil-json"]);
};

/** Expects a download to revoke its temporary object URL. */
export const expectRevokedObjectUrlDownload = async (
  shadowRoot: ShadowRoot,
  urlStubs: ObjectUrlStubState,
): Promise<void> => {
  await loadCharactersFromTestFont(shadowRoot, "★");
  clickDownload(shadowRoot);

  expect(urlStubs.revokedUrls).toEqual(["blob:sigil-json"]);
};

/** Expects invalid glyph names to block JSON Blob creation. */
export const expectInvalidGlyphDownloadBlocked = async (
  shadowRoot: ShadowRoot,
  urlStubs: ObjectUrlStubState,
): Promise<void> => {
  await loadCharactersFromTestFont(shadowRoot, "★");
  renameGlyph(shadowRoot, "★", "");
  forceDownloadClick(shadowRoot);

  expect(urlStubs.createdBlobs).toEqual([]);
};

/** Removes the component and restores download-related browser stubs. */
export const restoreDownloadTest = (
  element: Element,
  urlStubs: ObjectUrlStubState,
  clickState?: DownloadClickState,
): void => {
  element.remove();
  clickState?.restore();
  urlStubs.restore();
};
