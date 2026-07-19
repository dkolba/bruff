import { appendText } from "./dom-text.js";
import type { RequiredGlyphSelectionView } from "./tool-sigil-state-types.js";

const selectName = (name: string): string => `required-glyph-${name}`;

const createOption = (unicode: string, label: string): HTMLOptionElement =>
  new Option(label, unicode);

const createRequiredGlyphSelect = (
  selection: RequiredGlyphSelectionView,
): HTMLSelectElement => {
  const select = document.createElement("select");
  select.name = selectName(selection.name);
  Object.assign(select.dataset, {
    action: "required-glyph-character",
    glyphName: selection.name,
  });
  select.append(
    ...selection.options.map((option) =>
      createOption(option.unicode, option.label),
    ),
  );
  select.value = selection.selectedUnicode;
  select.toggleAttribute("aria-invalid", !selection.isValid);

  return select;
};

const createRequiredGlyphLabel = (
  selection: RequiredGlyphSelectionView,
): HTMLLabelElement => {
  const label = document.createElement("label");
  appendText(label, `Source character for ${selection.name}`);
  label.append(createRequiredGlyphSelect(selection));

  return label;
};

/**
 * Renders required contract glyph source-character selects.
 *
 * @param shadowRoot - Component shadow root
 * @param selections - Required glyph selection view models
 * @returns Nothing
 */
export const renderRequiredGlyphSelections = (
  shadowRoot: ShadowRoot,
  selections: ReadonlyArray<RequiredGlyphSelectionView>,
): void => {
  shadowRoot
    .querySelector('[data-state="required-glyph-selections"]')
    ?.replaceChildren(
      ...selections.map((selection) => createRequiredGlyphLabel(selection)),
    );
};
