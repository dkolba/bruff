import type { ToolSigilViewModel } from "./state/tool-sigil-state.js";

/**
Renders the schema selector options and selected value.

@param shadowRoot - Component shadow root to update
@param viewModel - Render-ready sigil tool state
*/
export const renderToolSigilSchemaSelect = (
  shadowRoot: ShadowRoot,
  viewModel: ToolSigilViewModel,
): void => {
  const schemaSelect = shadowRoot.querySelector<HTMLSelectElement>(
    'select[name="schema"]',
  );
  schemaSelect?.replaceChildren(
    ...viewModel.schemaOptions.map(
      (schemaOption) => new Option(schemaOption.label, schemaOption.id),
    ),
  );
  if (schemaSelect !== null) {
    schemaSelect.value = viewModel.selectedSchemaId;
  }
};
