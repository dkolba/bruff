import { describe, expect, it } from "vitest";

import { loadSigilFontFile } from "./font-file.js";
import {
  createValidFontFile,
  TEST_FONT_UNITS_PER_EM,
} from "./font-test-fixture.js";

describe("loadSigilFontFile", () => {
  it("parses a valid OpenType font file", async () => {
    const fontResult = await loadSigilFontFile(
      createValidFontFile("sigil-test.ttf"),
    );

    expect(fontResult.type).toBe("ok");
    if (fontResult.type === "ok") {
      expect(fontResult.value.unitsPerEm).toBe(TEST_FONT_UNITS_PER_EM);
      expect(fontResult.value.hasChar("★")).toBe(true);
    }
  });

  it("reports invalid font files", async () => {
    await expect(
      loadSigilFontFile(new File(["not a font"], "broken.ttf")),
    ).resolves.toStrictEqual({
      error: [
        {
          message: 'Could not parse "broken.ttf" as a supported font.',
          type: "invalid-font",
        },
      ],
      type: "error",
    });
  });

  it("rejects WOFF2 files", async () => {
    await expect(
      loadSigilFontFile(new File(["not parsed"], "compressed.woff2")),
    ).resolves.toStrictEqual({
      error: [
        {
          message: "WOFF2 fonts are not supported.",
          type: "unsupported-font-format",
        },
      ],
      type: "error",
    });
  });
});
