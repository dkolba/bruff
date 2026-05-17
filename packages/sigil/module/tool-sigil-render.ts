import { appendText } from "./dom-text.js";
import { createErrorElements } from "./error-elements.js";
import { createGlyphPreview } from "./glyph-preview.js";
import type { SigilGlyphDraft } from "./glyph-json.js";
import type { ToolSigilViewModel } from "./tool-sigil-state.js";

const textInputName = (unicode: string): string => `glyph-name-${unicode}`;

const replaceText = (element: Element | null, text: string): void => {
  element?.replaceChildren(document.createTextNode(text));
};

const createGlyphNameInput = (
  draft: SigilGlyphDraft,
  namesByUnicode: Readonly<Record<string, string>>,
): HTMLInputElement => {
  const input = document.createElement("input");
  input.name = textInputName(draft.glyph.unicode);
  input.type = "text";
  Object.assign(input.dataset, { unicode: draft.glyph.unicode });
  input.value = namesByUnicode[draft.glyph.unicode] ?? draft.defaultName;

  return input;
};

const createGlyphNameLabel = (
  draft: SigilGlyphDraft,
  namesByUnicode: Readonly<Record<string, string>>,
): HTMLLabelElement => {
  const label = document.createElement("label");
  appendText(label, `Name for ${draft.glyph.unicode}`);
  label.append(createGlyphNameInput(draft, namesByUnicode));

  return label;
};

const createGlyphRow = (
  draft: SigilGlyphDraft,
  viewModel: ToolSigilViewModel,
): HTMLElement => {
  const row = document.createElement("div");
  row.setAttribute("class", "glyph-row");
  row.append(
    createGlyphPreview(draft, viewModel.previewFontFamily),
    createGlyphNameLabel(draft, viewModel.namesByUnicode),
  );

  return row;
};

const renderDownloadButton = (
  shadowRoot: ShadowRoot,
  viewModel: ToolSigilViewModel,
): void => {
  const downloadButton = shadowRoot.querySelector<HTMLButtonElement>(
    'button[data-action="download"]',
  );
  downloadButton?.toggleAttribute("disabled", viewModel.downloadDisabled);
};

const renderErrors = (
  shadowRoot: ShadowRoot,
  viewModel: ToolSigilViewModel,
): void => {
  shadowRoot
    .querySelector('[data-state="errors"]')
    ?.replaceChildren(...createErrorElements(viewModel.errors));
};

/**
 * Renders validation-only regions without replacing focused glyph inputs.
 *
 * @param shadowRoot - Component shadow root to update
 * @param viewModel - Render-ready sigil tool state
 */
export const renderToolSigilValidation = (
  shadowRoot: ShadowRoot,
  viewModel: ToolSigilViewModel,
): void => {
  renderErrors(shadowRoot, viewModel);
  renderDownloadButton(shadowRoot, viewModel);
};

/**
 * Renders the complete sigil tool state into the component shadow root.
 *
 * @param shadowRoot - Component shadow root to update
 * @param viewModel - Render-ready sigil tool state
 */
export const renderToolSigil = (
  shadowRoot: ShadowRoot,
  viewModel: ToolSigilViewModel,
): void => {
  replaceText(
    shadowRoot.querySelector('[data-state="font-file-name"]'),
    viewModel.fontFileNameText,
  );
  replaceText(
    shadowRoot.querySelector('[data-state="summary"]'),
    viewModel.glyphCountText,
  );
  shadowRoot
    .querySelector('[data-state="glyph-list"]')
    ?.replaceChildren(
      ...viewModel.drafts.map((draft) => createGlyphRow(draft, viewModel)),
    );
  renderToolSigilValidation(shadowRoot, viewModel);
};
