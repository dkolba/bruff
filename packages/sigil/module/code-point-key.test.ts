import { describe, expect, it } from "vitest";
import { codePointKey } from "./code-point-key.js";

describe("codePointKey", () => {
  it("creates a lowercase BMP code point key", () => {
    expect(codePointKey("★")).toBe("u2605");
  });

  it("creates a lowercase supplementary-plane code point key", () => {
    expect(codePointKey("🚀")).toBe("u1f680");
  });

  it("creates a visible key for whitespace", () => {
    expect(codePointKey(" ")).toBe("u20");
  });

  it("creates a stable fallback key for empty input", () => {
    expect(codePointKey("")).toBe("u");
  });

  it("keeps duplicate input deterministic after caller dedupe", () => {
    const uniqueKeys = [...new Set("★★")].map((character) =>
      codePointKey(character),
    );

    expect(uniqueKeys).toStrictEqual(["u2605"]);
  });
});
