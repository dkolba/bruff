import type { SigilGlyphMapping } from "./glyph-json.js";

const FIRST_FILE_INDEX = 0;
const FIRST_SELECTED_OPTION_INDEX = 0;

const isGlyphNameInput = (
  target: EventTarget | null,
): target is HTMLInputElement => target instanceof HTMLInputElement;

const isSelect = (target: EventTarget | null): target is HTMLSelectElement =>
  target instanceof HTMLSelectElement;

type ToolSigilControls = Readonly<{
  charactersTextarea: HTMLTextAreaElement;
  downloadButton: HTMLButtonElement | null;
  fileInput: HTMLInputElement | null;
  glyphList: Element | null;
  requiredGlyphSelections: Element | null;
  schemaSelect: HTMLSelectElement;
}>;

type ToolSigilEventHandlers = Readonly<{
  handleCharactersInput: (event: Event) => void;
  handleDownloadClick: () => void;
  handleFileChange: () => void;
  handleGlyphNameInput: (event: Event) => void;
  handleGlyphSelectChange: (event: Event) => void;
  handleRequiredGlyphChange: (event: Event) => void;
  handleSchemaChange: () => void;
}>;

type GlyphSelectChange = Readonly<{
  action: string;
  glyph: string | undefined;
  glyphKey: string;
  groupName: string | undefined;
  unicode: string;
}>;

/** Event handlers supplied by the `<tool-sigil>` coordinator. */
export type ToolSigilControlHandlers = Readonly<{
  onCharactersInput: (characters: string) => void;
  onDownloadClick: () => void;
  onFontFileSelected: (fontFile: File | undefined) => void;
  onGlyphGroupChange: (unicode: string, groupName: string) => void;
  onGlyphNameInput: (unicode: string, glyphName: string) => void;
  onLicenseChange: (unicode: string, licenseValue: string) => void;
  onMappedGlyphChange: (unicode: string, mapping: SigilGlyphMapping) => void;
  onRequiredGlyphCharacterChange: (glyphName: string, unicode: string) => void;
  onSchemaChange: (schemaId: string) => void;
}>;

/** Disconnects DOM listeners owned by a connected sigil control binding. */
export type DisconnectToolSigilControls = () => void;

const queryToolSigilControls = (shadowRoot: ShadowRoot): ToolSigilControls => ({
  charactersTextarea:
    shadowRoot.querySelector<HTMLTextAreaElement>(
      'textarea[name="characters"]',
    ) ?? document.createElement("textarea"),
  downloadButton: shadowRoot.querySelector<HTMLButtonElement>(
    'button[data-action="download"]',
  ),
  fileInput: shadowRoot.querySelector<HTMLInputElement>(
    'input[type="file"][name="font-file"]',
  ),
  glyphList: shadowRoot.querySelector('[data-state="glyph-list"]'),
  requiredGlyphSelections: shadowRoot.querySelector(
    '[data-state="required-glyph-selections"]',
  ),
  schemaSelect:
    shadowRoot.querySelector<HTMLSelectElement>('select[name="schema"]') ??
    document.createElement("select"),
});

const readGlyphSelectChange = (
  target: EventTarget | null,
): GlyphSelectChange | undefined => {
  if (!isSelect(target)) {
    return undefined;
  }

  const { action, groupName, unicode } = target.dataset;
  if (unicode === undefined || action === undefined) {
    return undefined;
  }

  const selectedOption = target.selectedOptions.item(
    FIRST_SELECTED_OPTION_INDEX,
  );

  return {
    action,
    glyph: selectedOption?.dataset["glyph"],
    glyphKey: target.value,
    groupName,
    unicode,
  };
};

const dispatchGlyphSelectChange = (
  handlers: ToolSigilControlHandlers,
  selection: GlyphSelectChange,
): void => {
  if (selection.action === "glyph-group") {
    handlers.onGlyphGroupChange(selection.unicode, selection.glyphKey);
    return;
  }

  if (selection.action === "license") {
    handlers.onLicenseChange(selection.unicode, selection.glyphKey);
    return;
  }

  if (
    selection.action === "mapped-glyph" &&
    selection.groupName !== undefined &&
    selection.glyph !== undefined
  ) {
    handlers.onMappedGlyphChange(selection.unicode, {
      glyph: selection.glyph,
      glyphKey: selection.glyphKey,
      groupName: selection.groupName,
    });
  }
};

const createToolSigilEventHandlers = (
  controls: ToolSigilControls,
  handlers: ToolSigilControlHandlers,
): ToolSigilEventHandlers => ({
  handleCharactersInput: (): void => {
    handlers.onCharactersInput(controls.charactersTextarea.value);
  },
  handleDownloadClick: (): void => {
    handlers.onDownloadClick();
  },
  handleFileChange: (): void => {
    handlers.onFontFileSelected(controls.fileInput?.files?.[FIRST_FILE_INDEX]);
  },
  handleGlyphNameInput: (event: Event): void => {
    if (!isGlyphNameInput(event.target)) {
      return;
    }

    const { unicode } = event.target.dataset;
    if (unicode === undefined) {
      return;
    }

    handlers.onGlyphNameInput(unicode, event.target.value);
  },
  handleGlyphSelectChange: (event: Event): void => {
    const selection = readGlyphSelectChange(event.target);
    if (selection === undefined) {
      return;
    }

    dispatchGlyphSelectChange(handlers, selection);
  },
  handleRequiredGlyphChange: (event: Event): void => {
    if (!isSelect(event.target)) {
      return;
    }

    const { action, glyphName } = event.target.dataset;
    if (action === "required-glyph-character" && glyphName !== undefined) {
      handlers.onRequiredGlyphCharacterChange(glyphName, event.target.value);
    }
  },
  handleSchemaChange: (): void => {
    handlers.onSchemaChange(controls.schemaSelect.value);
  },
});

const addToolSigilEventListeners = (
  controls: ToolSigilControls,
  eventHandlers: ToolSigilEventHandlers,
): void => {
  controls.fileInput?.addEventListener(
    "change",
    eventHandlers.handleFileChange,
  );
  controls.charactersTextarea.addEventListener(
    "input",
    eventHandlers.handleCharactersInput,
  );
  controls.schemaSelect.addEventListener(
    "change",
    eventHandlers.handleSchemaChange,
  );
  controls.requiredGlyphSelections?.addEventListener(
    "change",
    eventHandlers.handleRequiredGlyphChange,
  );
  controls.glyphList?.addEventListener(
    "input",
    eventHandlers.handleGlyphNameInput,
  );
  controls.glyphList?.addEventListener(
    "change",
    eventHandlers.handleGlyphSelectChange,
  );
  controls.downloadButton?.addEventListener(
    "click",
    eventHandlers.handleDownloadClick,
  );
};

const removeToolSigilEventListeners = (
  controls: ToolSigilControls,
  eventHandlers: ToolSigilEventHandlers,
): void => {
  controls.fileInput?.removeEventListener(
    "change",
    eventHandlers.handleFileChange,
  );
  controls.charactersTextarea.removeEventListener(
    "input",
    eventHandlers.handleCharactersInput,
  );
  controls.schemaSelect.removeEventListener(
    "change",
    eventHandlers.handleSchemaChange,
  );
  controls.requiredGlyphSelections?.removeEventListener(
    "change",
    eventHandlers.handleRequiredGlyphChange,
  );
  controls.glyphList?.removeEventListener(
    "input",
    eventHandlers.handleGlyphNameInput,
  );
  controls.glyphList?.removeEventListener(
    "change",
    eventHandlers.handleGlyphSelectChange,
  );
  controls.downloadButton?.removeEventListener(
    "click",
    eventHandlers.handleDownloadClick,
  );
};

/**
Connects shadow DOM controls to coordinator handlers.

@param shadowRoot - Component shadow root containing the static template
@param handlers - Coordinator callbacks for user interactions
@returns A function that removes the connected event listeners
*/
export const connectToolSigilControls = (
  shadowRoot: ShadowRoot,
  handlers: ToolSigilControlHandlers,
): DisconnectToolSigilControls => {
  const controls = queryToolSigilControls(shadowRoot);
  const eventHandlers = createToolSigilEventHandlers(controls, handlers);

  addToolSigilEventListeners(controls, eventHandlers);

  return (): void => {
    removeToolSigilEventListeners(controls, eventHandlers);
  };
};
