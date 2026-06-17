import { describe, expect, it } from "vitest";

import { waitForElement } from "./tool-sigil-test-support.js";

describe("waitForElement", () => {
  it("resolves when a matching shadow DOM element is added later", async () => {
    const host = document.createElement("div");
    const shadowRoot = host.attachShadow({ mode: "open" });
    const input = document.createElement("input");
    input.name = "glyph-name";

    const pendingInput = waitForElement<HTMLInputElement>(
      shadowRoot,
      'input[name="glyph-name"]',
    );
    shadowRoot.append(input);

    await expect(pendingInput).resolves.toBe(input);
  });
});
