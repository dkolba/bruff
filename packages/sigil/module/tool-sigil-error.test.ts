import "../index.js";
import {
  appendToolSigil,
  loadCharactersFromTestFont,
  requireElement,
  requireShadowRoot,
  selectFiles,
  waitForComponentUpdate,
} from "./tool-sigil-test-support.js";
import { describe, expect, it } from "vitest";

const expectAlertText = (
  shadowRoot: ShadowRoot,
  expectedText: string,
): void => {
  const alert = requireElement<HTMLElement>(shadowRoot, '[role="alert"]');

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
    await waitForComponentUpdate();

    expectAlertText(
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

    await loadCharactersFromTestFont(shadowRoot, "?");

    expectAlertText(shadowRoot, 'Missing glyph for "?".');

    element.remove();
  });
});
