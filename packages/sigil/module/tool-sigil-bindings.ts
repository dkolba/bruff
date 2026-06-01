import type { SigilGlyphMapping } from "./glyph-json.js";

const FIRST_FILE_INDEX = 0;
const FIRST_SELECTED_OPTION_INDEX = 0;

const isGlyphNameInput = (
  target: EventTarget | null,
): target is HTMLInputElement => target instanceof HTMLInputElement;

const isSelect = (target: EventTarget | null): target is HTMLSelectElement =>
  target instanceof HTMLSelectElement;

const queryCharacterInput = (shadowRoot: ShadowRoot): HTMLTextAreaElement =>
  shadowRoot.querySelector<HTMLTextAreaElement>(
    'textarea[name="characters"]',
  ) ?? document.createElement("textarea");

type ToolSigilControls = Readonly<{
  characterInput: HTMLTextAreaElement;
  downloadButton: HTMLButtonElement | null;
  fileInput: HTMLInputElement | null;
  glyphList: Element | null;
}>;

type ToolSigilEventHandlers = Readonly<{
  handleCharactersInput: () => void;
  handleDownloadClick: () => void;
  handleFileChange: () => void;
  handleGlyphNameInput: (event: Event) => void;
  handleGlyphSelectChange: (event: Event) => void;
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
}>;

/** Disconnects DOM listeners owned by a connected sigil control binding. */
export type DisconnectToolSigilControls = () => void;

const queryToolSigilControls = (shadowRoot: ShadowRoot): ToolSigilControls => ({
  characterInput: queryCharacterInput(shadowRoot),
  downloadButton: shadowRoot.querySelector<HTMLButtonElement>(
    'button[data-action="download"]',
  ),
  fileInput: shadowRoot.querySelector<HTMLInputElement>(
    'input[type="file"][name="font-file"]',
  ),
  glyphList: shadowRoot.querySelector('[data-state="glyph-list"]'),
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
    // eslint-disable-next-line dot-notation -- TS requires bracket access for DOMStringMap index signatures.
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
    handlers.onCharactersInput(controls.characterInput.value);
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
});

const addToolSigilEventListeners = (
  controls: ToolSigilControls,
  eventHandlers: ToolSigilEventHandlers,
): void => {
  controls.fileInput?.addEventListener(
    "change",
    eventHandlers.handleFileChange,
  );
  controls.characterInput.addEventListener(
    "input",
    eventHandlers.handleCharactersInput,
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
  controls.characterInput.removeEventListener(
    "input",
    eventHandlers.handleCharactersInput,
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
 * Connects shadow DOM controls to coordinator handlers.
 *
 * @param shadowRoot - Component shadow root containing the static template
 * @param handlers - Coordinator callbacks for user interactions
 * @returns A function that removes the connected event listeners
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
