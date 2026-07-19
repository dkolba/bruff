import { ToolSigil } from "./tool-sigil.js";

const TOOL_SIGIL_TAG_NAME = "tool-sigil";

/**
Defines the `<tool-sigil>` custom element when it has not already been
registered in the current document.

@returns Nothing
*/
export const registerToolSigil = (): void => {
  if (!customElements.get(TOOL_SIGIL_TAG_NAME)) {
    customElements.define(TOOL_SIGIL_TAG_NAME, ToolSigil);
  }
};
