const FIRST_FILE_INDEX = 0;

const isGlyphNameInput = (
  target: EventTarget | null,
): target is HTMLInputElement => target instanceof HTMLInputElement;

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
}>;

/** Event handlers supplied by the `<tool-sigil>` coordinator. */
export type ToolSigilControlHandlers = Readonly<{
  onCharactersInput: (characters: string) => void;
  onDownloadClick: () => void;
  onFontFileSelected: (fontFile: File | undefined) => void;
  onGlyphNameInput: (unicode: string, glyphName: string) => void;
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
});

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
  controls.downloadButton?.addEventListener(
    "click",
    eventHandlers.handleDownloadClick,
  );

  return (): void => {
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
    controls.downloadButton?.removeEventListener(
      "click",
      eventHandlers.handleDownloadClick,
    );
  };
};
