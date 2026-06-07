import { appendText } from "./dom-text.js";
import { createErrorElements } from "./error-elements.js";
import { createGlyphPreview } from "./glyph-preview.js";
import { renderRequiredGlyphSelections } from "./tool-sigil-required-glyph-render.js";
import { renderToolSigilSchemaSelect } from "./tool-sigil-schema-render.js";
import type { SigilGlyphDraft } from "./glyph-json.js";
import type { SigilGlyphOption } from "./glyph-catalog.js";
import type { ToolSigilViewModel } from "./tool-sigil-state.js";

const textInputName = (unicode: string): string => `glyph-name-${unicode}`;
const glyphGroupSelectName = (unicode: string): string =>
  `glyph-group-${unicode}`;
const mappedGlyphSelectName = (unicode: string): string =>
  `mapped-glyph-${unicode}`;
const licenseSelectName = (unicode: string): string => `license-${unicode}`;

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

const createPlaceholderOption = (label: string): HTMLOptionElement =>
  new Option(label, "");

const createGlyphGroupSelect = (
  draft: SigilGlyphDraft,
  viewModel: ToolSigilViewModel,
): HTMLSelectElement => {
  const select = document.createElement("select");
  select.name = glyphGroupSelectName(draft.glyph.unicode);
  Object.assign(select.dataset, {
    action: "glyph-group",
    unicode: draft.glyph.unicode,
  });
  select.append(
    ...viewModel.glyphGroups.map(
      (group) => new Option(group.label, group.groupName),
    ),
  );
  select.value =
    viewModel.stagedGlyphGroupsByUnicode[draft.glyph.unicode] ?? "";

  return select;
};

const createGlyphGroupLabel = (
  draft: SigilGlyphDraft,
  viewModel: ToolSigilViewModel,
): HTMLLabelElement => {
  const label = document.createElement("label");
  appendText(label, `Glyph group for ${draft.glyph.unicode}`);
  label.append(createGlyphGroupSelect(draft, viewModel));

  return label;
};

const glyphOptionsForDraft = (
  draft: SigilGlyphDraft,
  viewModel: ToolSigilViewModel,
): ReadonlyArray<SigilGlyphOption> =>
  viewModel.glyphGroups.find(
    (group) =>
      group.groupName ===
      viewModel.stagedGlyphGroupsByUnicode[draft.glyph.unicode],
  )?.glyphs ?? [];

const createMappedGlyphSelect = (
  draft: SigilGlyphDraft,
  viewModel: ToolSigilViewModel,
): HTMLSelectElement => {
  const groupName = viewModel.stagedGlyphGroupsByUnicode[draft.glyph.unicode];
  const select = document.createElement("select");
  select.name = mappedGlyphSelectName(draft.glyph.unicode);
  Object.assign(select.dataset, {
    action: "mapped-glyph",
    groupName,
    unicode: draft.glyph.unicode,
  });
  select.append(createPlaceholderOption("Select glyph"));
  select.append(
    ...glyphOptionsForDraft(draft, viewModel).map((glyphOption) => {
      const option = new Option(glyphOption.label, glyphOption.glyphKey);
      Object.assign(option.dataset, { glyph: glyphOption.glyph });
      return option;
    }),
  );
  select.value =
    viewModel.selectedGlyphsByUnicode[draft.glyph.unicode]?.glyphKey ?? "";

  return select;
};

const createMappedGlyphLabel = (
  draft: SigilGlyphDraft,
  viewModel: ToolSigilViewModel,
): HTMLLabelElement => {
  const label = document.createElement("label");
  appendText(label, `Mapped glyph for ${draft.glyph.unicode}`);
  label.append(createMappedGlyphSelect(draft, viewModel));

  return label;
};

const createLicenseSelect = (
  draft: SigilGlyphDraft,
  viewModel: ToolSigilViewModel,
): HTMLSelectElement => {
  const select = document.createElement("select");
  select.name = licenseSelectName(draft.glyph.unicode);
  Object.assign(select.dataset, {
    action: "license",
    unicode: draft.glyph.unicode,
  });
  select.append(createPlaceholderOption("Select LICENSE"));
  select.append(
    ...viewModel.licenseOptions.map(
      (licenseOption) => new Option(licenseOption.label, licenseOption.value),
    ),
  );
  select.value = viewModel.selectedLicensesByUnicode[draft.glyph.unicode] ?? "";

  return select;
};

const createLicenseLabel = (
  draft: SigilGlyphDraft,
  viewModel: ToolSigilViewModel,
): HTMLLabelElement => {
  const label = document.createElement("label");
  appendText(label, `LICENSE for ${draft.glyph.unicode}`);
  label.append(createLicenseSelect(draft, viewModel));

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
    createGlyphGroupLabel(draft, viewModel),
    createMappedGlyphLabel(draft, viewModel),
    createLicenseLabel(draft, viewModel),
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

const contractIssueErrors = (
  viewModel: ToolSigilViewModel,
): ToolSigilViewModel["errors"] =>
  viewModel.contractIssues.map((issue) => ({
    message: `${issue.path}: ${issue.message}`,
    type: "invalid-glyph-json",
  }));

const renderErrors = (
  shadowRoot: ShadowRoot,
  viewModel: ToolSigilViewModel,
): void => {
  shadowRoot
    .querySelector('[data-state="errors"]')
    ?.replaceChildren(
      ...createErrorElements([
        ...viewModel.errors,
        ...contractIssueErrors(viewModel),
      ]),
    );
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
  renderRequiredGlyphSelections(shadowRoot, viewModel.requiredGlyphSelections);
  renderErrors(shadowRoot, viewModel);
  renderDownloadButton(shadowRoot, viewModel);
};

const replaceSelectOptions = (
  select: HTMLSelectElement,
  options: ReadonlyArray<HTMLOptionElement>,
): void => {
  select.replaceChildren(...options);
};

const renderMappedGlyphSelect = (
  shadowRoot: ShadowRoot,
  draft: SigilGlyphDraft,
  viewModel: ToolSigilViewModel,
): void => {
  const select = shadowRoot.querySelector<HTMLSelectElement>(
    `select[name="${mappedGlyphSelectName(draft.glyph.unicode)}"]`,
  );
  if (select === null) {
    return;
  }

  const groupName = viewModel.stagedGlyphGroupsByUnicode[draft.glyph.unicode];
  Object.assign(select.dataset, { groupName });
  replaceSelectOptions(select, [
    createPlaceholderOption("Select glyph"),
    ...glyphOptionsForDraft(draft, viewModel).map((glyphOption) => {
      const option = new Option(glyphOption.label, glyphOption.glyphKey);
      Object.assign(option.dataset, { glyph: glyphOption.glyph });
      return option;
    }),
  ]);
  select.value =
    viewModel.selectedGlyphsByUnicode[draft.glyph.unicode]?.glyphKey ?? "";
};

/**
 * Renders selection regions without replacing glyph rows.
 *
 * @param shadowRoot - Component shadow root to update
 * @param viewModel - Render-ready sigil tool state
 */
export const renderToolSigilSelection = (
  shadowRoot: ShadowRoot,
  viewModel: ToolSigilViewModel,
): void => {
  for (const draft of viewModel.drafts) {
    const groupSelect = shadowRoot.querySelector<HTMLSelectElement>(
      `select[name="${glyphGroupSelectName(draft.glyph.unicode)}"]`,
    );
    const licenseSelect = shadowRoot.querySelector<HTMLSelectElement>(
      `select[name="${licenseSelectName(draft.glyph.unicode)}"]`,
    );

    if (groupSelect !== null) {
      groupSelect.value =
        viewModel.stagedGlyphGroupsByUnicode[draft.glyph.unicode] ?? "";
    }
    if (licenseSelect !== null) {
      licenseSelect.value =
        viewModel.selectedLicensesByUnicode[draft.glyph.unicode] ?? "";
    }
    renderMappedGlyphSelect(shadowRoot, draft, viewModel);
  }
  renderToolSigilValidation(shadowRoot, viewModel);
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
  renderToolSigilSchemaSelect(shadowRoot, viewModel);
  const charactersTextarea = shadowRoot.querySelector<HTMLTextAreaElement>(
    'textarea[name="characters"]',
  );
  if (charactersTextarea !== null) {
    charactersTextarea.value = viewModel.characters;
  }
  renderRequiredGlyphSelections(shadowRoot, viewModel.requiredGlyphSelections);
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
