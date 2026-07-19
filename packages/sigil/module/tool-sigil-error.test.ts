import "../index.js";

import { describe, expect, it } from "vitest";

import { createMissingStarFontFile } from "./font-test-fixture.js";
import {
  appendToolSigil,
  requireElement,
  requireShadowRoot,
  selectDefaultMappingAndLicense,
  selectFiles,
  waitForElement,
} from "./tool-sigil-test-support.js";

const REQUIRED_SCHEMA_UNICODES = [".", "#", "+", "@", "e"];

const selectSchemaMappingAndLicense = (shadowRoot: ShadowRoot): void => {
  for (const unicode of REQUIRED_SCHEMA_UNICODES) {
    selectDefaultMappingAndLicense(shadowRoot, unicode);
  }
};

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

  it("shows exact contract validation reasons", async () => {
    const element = appendToolSigil();
    const shadowRoot = requireShadowRoot(element);
    const fileInput = requireElement<HTMLInputElement>(
      shadowRoot,
      'input[type="file"][name="font-file"]',
    );

    selectFiles(fileInput, [createMissingStarFontFile("missing.ttf")]);
    await waitForElement<HTMLElement>(shadowRoot, '[role="alert"]');
    selectSchemaMappingAndLicense(shadowRoot);

    await expectAlertText(
      shadowRoot,
      "Produced glyph JSON does not match the shared contract at floor.path: Too small: expected string to have >=1 characters",
    );

    element.remove();
  });
});
