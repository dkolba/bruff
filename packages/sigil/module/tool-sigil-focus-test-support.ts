import { expect } from "vitest";

import {
  loadCharactersFromTestFont,
  requireElement,
  selectDefaultMappingAndLicense,
  waitForElement,
} from "./tool-sigil-test-support.js";

const MINIMUM_SELECT_OPTION_COUNT = 1;

const enterGlyphNameText = (
  glyphNameInput: HTMLInputElement,
  glyphName: string,
): void => {
  glyphNameInput.value = glyphName;
  glyphNameInput.dispatchEvent(new InputEvent("input", { bubbles: true }));
};

const loadMappedFloorRow = async (shadowRoot: ShadowRoot): Promise<void> => {
  await loadCharactersFromTestFont(shadowRoot, ".");
  await waitForElement(
    shadowRoot,
    'select[data-action="glyph-group"][data-unicode="."]',
  );
  await waitForElement(
    shadowRoot,
    'select[data-action="mapped-glyph"][data-unicode="."]',
  );
  await waitForElement(
    shadowRoot,
    'select[data-action="license"][data-unicode="."]',
  );
  selectDefaultMappingAndLicense(shadowRoot, ".");
};

const enterFocusedGlyphNameText = (
  shadowRoot: ShadowRoot,
  glyphNameInput: HTMLInputElement,
  glyphName: string,
): void => {
  enterGlyphNameText(glyphNameInput, glyphName);

  expect(shadowRoot.activeElement).toBe(glyphNameInput);
};

export const expectGlyphNameInputFocusPreserved = async (
  shadowRoot: ShadowRoot,
): Promise<void> => {
  await loadMappedFloorRow(shadowRoot);
  const glyphNameInput = await waitForElement<HTMLInputElement>(
    shadowRoot,
    'input[data-unicode="."]',
  );
  glyphNameInput.focus();
  expect(shadowRoot.activeElement).toBe(glyphNameInput);

  enterFocusedGlyphNameText(shadowRoot, glyphNameInput, "c");
  enterFocusedGlyphNameText(shadowRoot, glyphNameInput, "cu");
  expect(glyphNameInput.value).toBe("cu");
};

export const expectGlyphSelectFocusPreserved = async (
  shadowRoot: ShadowRoot,
): Promise<void> => {
  await loadCharactersFromTestFont(shadowRoot, ".");

  const groupSelect = await waitForElement<HTMLSelectElement>(
    shadowRoot,
    'select[data-action="glyph-group"][data-unicode="."]',
  );
  groupSelect.focus();
  expect(shadowRoot.activeElement).toBe(groupSelect);

  groupSelect.value = "BOX";
  groupSelect.dispatchEvent(new Event("change", { bubbles: true }));

  expect(shadowRoot.activeElement).toBe(groupSelect);

  const mappedGlyphSelect = requireElement<HTMLSelectElement>(
    shadowRoot,
    'select[data-action="mapped-glyph"][data-unicode="."]',
  );
  expect(mappedGlyphSelect.options.length).toBeGreaterThan(
    MINIMUM_SELECT_OPTION_COUNT,
  );
};
