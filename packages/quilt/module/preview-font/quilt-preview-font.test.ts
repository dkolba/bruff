import { describe, expect, test } from "vitest";

import { createPreviewFontState } from "./quilt-preview-font.ts";

describe("quilt preview font", () => {
  test("creates unloaded preview font state", () => {
    expect(createPreviewFontState()).toStrictEqual({ type: "unloaded" });
  });
});
