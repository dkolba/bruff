import "../index.js";
import {
  appendToolSigil,
  requireElement,
  requireShadowRoot,
  selectFiles,
  waitForElement,
} from "./tool-sigil-test-support.js";
import { describe, expect, it } from "vitest";
import { createMissingStarFontFile } from "./font-test-fixture.js";

const expectAlertText = async (
  shadowRoot: ShadowRoot,
  expectedText: string,
): Promise<void> => {
  const alert = await waitForElement<HTMLElement>(shadowRoot, '[role="alert"]');

  expect(alert.textContent).toContain(expectedText);
};

describe("ToolSigil font error state", () => {
  it("shows font loading errors", async () => {
    const element = appendToolSigil();
    const shadowRoot = requireShadowRoot(element);
    const fileInput = requireElement<HTMLInputElement>(
      shadowRoot,
      'input[type="file"][name="font-file"]',
    );

    selectFiles(fileInput, [new File(["not a font"], "broken.ttf")]);

    await expectAlertText(
      shadowRoot,
      'Could not parse "broken.ttf" as a supported font.',
    );

    element.remove();
  });
});

describe("ToolSigil missing glyph error state", () => {
  it("shows missing glyph errors", async () => {
    const element = appendToolSigil();
    const shadowRoot = requireShadowRoot(element);

    const fileInput = requireElement<HTMLInputElement>(
      shadowRoot,
      'input[type="file"][name="font-file"]',
    );

    selectFiles(fileInput, [createMissingStarFontFile("missing.ttf")]);

    await expectAlertText(shadowRoot, 'Missing glyph for ".".');

    element.remove();
  });
});
