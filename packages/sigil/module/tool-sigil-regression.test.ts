import "../index.js";
import {
  appendToolSigilWithShadowRoot,
  expectNewerFontSelectionToWin,
  expectPartialGlyphJsonDownload,
  expectRejectedStalePreviewLoadIgnored,
  expectUploadedFontPreview,
} from "./tool-sigil-regression-test-support.js";
import { describe, it } from "vitest";
import {
  restoreDownloadTest,
  stubObjectUrls,
} from "./tool-sigil-download-test-support.js";

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
