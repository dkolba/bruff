import { expect } from "vitest";

import {
  clickDownload,
  forceDownloadClick,
  loadCharactersFromTestFont,
  renameGlyph,
  selectDefaultMappingAndLicense,
} from "./tool-sigil-test-support.js";

const REQUIRED_SCHEMA_UNICODES = [".", "#", "+", "@", "e"];

const selectSchemaMappingAndLicense = (shadowRoot: ShadowRoot): void => {
  for (const unicode of REQUIRED_SCHEMA_UNICODES) {
    selectDefaultMappingAndLicense(shadowRoot, unicode);
  }
};

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

/** Stubs object URL creation and revocation. */
export const stubObjectUrls = (): ObjectUrlStubState => {
  const createdBlobs: Array<Blob> = [];
  const revokedUrls: Array<string> = [];
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  Object.defineProperties(URL, {
  	createObjectURL: {
	    configurable: true,
	    value: (blob: Blob): string => {
	      createdBlobs.push(blob);
	      return "blob:sigil-json";
	    },
	  },
  	revokeObjectURL: {
	    configurable: true,
	    value: (url: string): void => {
	      revokedUrls.push(url);
	    },
	  },
  });

  return {
    createdBlobs,
    restore: (): void => {
      Object.defineProperties(URL, {
      	createObjectURL: {
	        configurable: true,
	        value: originalCreateObjectURL,
	      },
      	revokeObjectURL: {
	        configurable: true,
	        value: originalRevokeObjectURL,
	      },
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

  document.addEventListener("click", trackClick, {capture: true});

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

/** Expects a download Blob to contain the contract glyph name. */
export const expectEditedGlyphJsonDownload = async (
  shadowRoot: ShadowRoot,
  urlStubs: ObjectUrlStubState,
): Promise<void> => {
  await loadCharactersFromTestFont(shadowRoot, ".#+@e");
  selectSchemaMappingAndLicense(shadowRoot);
  renameGlyph(shadowRoot, ".", "customFloor");
  clickDownload(shadowRoot);

  const blob = requireFirstBlob(urlStubs.createdBlobs);
  const blobText = await blob.text();
  expect(blob.type).toBe("application/json");
  expect(blobText).toContain('"floor"');
  expect(blobText).toContain('"name": "customFloor"');
  expect(blobText).not.toContain('"customFloor":');
};

/** Expects a download click to use the fixed sigil filename. */
export const expectDeterministicFilenameDownload = async (
  shadowRoot: ShadowRoot,
  clickState: DownloadClickState,
): Promise<void> => {
  await loadCharactersFromTestFont(shadowRoot, ".#+@e");
  selectSchemaMappingAndLicense(shadowRoot);
  clickDownload(shadowRoot);

  expect(clickState.downloads).toEqual(["sigil.json"]);
  expect(clickState.hrefs).toEqual(["blob:sigil-json"]);
};

/** Expects a download to revoke its temporary object URL. */
export const expectRevokedObjectUrlDownload = async (
  shadowRoot: ShadowRoot,
  urlStubs: ObjectUrlStubState,
): Promise<void> => {
  await loadCharactersFromTestFont(shadowRoot, ".#+@e");
  selectSchemaMappingAndLicense(shadowRoot);
  clickDownload(shadowRoot);

  expect(urlStubs.revokedUrls).toEqual(["blob:sigil-json"]);
};

/** Expects invalid glyph names to block JSON Blob creation. */
export const expectInvalidGlyphDownloadBlocked = async (
  shadowRoot: ShadowRoot,
  urlStubs: ObjectUrlStubState,
): Promise<void> => {
  await loadCharactersFromTestFont(shadowRoot, ".#+@e");
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
