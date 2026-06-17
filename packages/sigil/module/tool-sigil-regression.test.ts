import "../index.js";

import { describe, it } from "vitest";

import {
  restoreDownloadTest,
  stubObjectUrls,
} from "./tool-sigil-download-test-support.js";
import {
  appendToolSigilWithShadowRoot,
  expectNewerFontSelectionToWin,
  expectPartialGlyphJsonDownload,
  expectRejectedStalePreviewLoadIgnored,
  expectTypedCharacterSelectionDownload,
  expectUploadedFontPreview,
} from "./tool-sigil-regression-test-support.js";

const STALE_FONT_LOAD_TEST_TIMEOUT_MS = 30_000;

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

describe("ToolSigil typed character selection export", () => {
  it("exports the character selected for a required contract glyph", async () => {
    const urlStubs = stubObjectUrls();
    const { element, shadowRoot } = appendToolSigilWithShadowRoot();

    try {
      await expectTypedCharacterSelectionDownload(shadowRoot, urlStubs);
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
  it(
    "ignores older font-load completion after a newer selection",
    async () => {
      const { element, shadowRoot } = appendToolSigilWithShadowRoot();

      try {
        await expectNewerFontSelectionToWin(shadowRoot);
      } finally {
        element.remove();
      }
    },
    STALE_FONT_LOAD_TEST_TIMEOUT_MS,
  );

  it(
    "ignores older preview-load rejection after a newer selection",
    async () => {
      const { element, shadowRoot } = appendToolSigilWithShadowRoot();

      try {
        await expectRejectedStalePreviewLoadIgnored(shadowRoot);
      } finally {
        element.remove();
      }
    },
    STALE_FONT_LOAD_TEST_TIMEOUT_MS,
  );
});
