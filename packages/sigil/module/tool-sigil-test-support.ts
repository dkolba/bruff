/* eslint-disable unicorn/text-encoding-identifier-case -- Browser test helpers centralize reusable Sigil interactions and glyph group names such as ASCII. */
import { createValidFontFile } from "./font-test-fixture.js";
import { ToolSigil } from "./tool-sigil.js";

const COMPONENT_UPDATE_DELAY_MS = 20;

/** Appends a fresh sigil tool element. */
export const appendToolSigil = (): ToolSigil => {
  const element = new ToolSigil();

  document.body.append(element);

  return element;
};

/** Returns an attached shadow root or fails the test. */
export const requireShadowRoot = (element: ToolSigil): ShadowRoot => {
  const { shadowRoot } = element;
  if (shadowRoot === null) {
    throw new Error("Expected tool-sigil to have a shadow root.");
  }

  return shadowRoot;
};

/** Returns a matched shadow DOM element or fails the test. */
export const requireElement = <ElementType extends Element>(
  shadowRoot: ShadowRoot,
  selector: string,
): ElementType => {
  const element = shadowRoot.querySelector<ElementType>(selector);
  if (element === null) {
    throw new Error(`Expected selector "${selector}" to match an element.`);
  }

  return element;
};

/** Waits for a matched shadow DOM element. */
export const waitForElement = <ElementType extends Element>(
  shadowRoot: ShadowRoot,
  selector: string,
): Promise<ElementType> => {
  const immediateElement = shadowRoot.querySelector<ElementType>(selector);
  if (immediateElement !== null) {
    return Promise.resolve(immediateElement);
  }

  return new Promise<ElementType>((resolve) => {
    const observer = new MutationObserver((): void => {
      const element = shadowRoot.querySelector<ElementType>(selector);
      if (element === null) {
        return;
      }

      observer.disconnect();
      resolve(element);
    });
    observer.observe(shadowRoot, { childList: true, subtree: true });
  });
};

const waitForSchemaFontProcessing = (
  shadowRoot: ShadowRoot,
): Promise<Element> =>
  waitForElement(shadowRoot, 'input[data-unicode="."], [role="alert"]');

/** Waits for component microtasks and file parsing to settle in browser tests. */
export const waitForComponentUpdate = (): Promise<void> =>
  new Promise((resolve) => {
    globalThis.setTimeout(resolve, COMPONENT_UPDATE_DELAY_MS);
  });

/** Replaces a file input's selected files and dispatches change. */
export const selectFiles = (
  fileInput: HTMLInputElement,
  files: ReadonlyArray<File>,
): void => {
  const dataTransfer = new DataTransfer();
  files.reduce<DataTransfer>((currentDataTransfer, file) => {
    currentDataTransfer.items.add(file);
    return currentDataTransfer;
  }, dataTransfer);

  Object.defineProperty(fileInput, "files", {
    configurable: true,
    value: dataTransfer.files,
  });
  fileInput.dispatchEvent(new Event("change", { bubbles: true }));
};

/** Enters characters into the component textarea. */
export const enterCharacters = (
  characterInput: HTMLTextAreaElement,
  characters: string,
): void => {
  characterInput.value = characters;
  characterInput.dispatchEvent(new InputEvent("input", { bubbles: true }));
};

/** Loads the test font for the selected schema. */
export const loadCharactersFromTestFont = async (
  shadowRoot: ShadowRoot,
  characters: string,
): Promise<void> => {
  const schemaCharacters = characters;
  const fileInput = requireElement<HTMLInputElement>(
    shadowRoot,
    'input[type="file"][name="font-file"]',
  );

  if (schemaCharacters === "") {
    await waitForComponentUpdate();
  }

  selectFiles(fileInput, [createValidFontFile("component-test.ttf")]);
  await waitForSchemaFontProcessing(shadowRoot);
};

/** Renames one rendered glyph input. */
export const renameGlyph = (
  shadowRoot: ShadowRoot,
  unicode: string,
  glyphName: string,
): void => {
  const glyphNameInput = requireElement<HTMLInputElement>(
    shadowRoot,
    `input[data-unicode="${unicode}"]`,
  );

  glyphNameInput.value = glyphName;
  glyphNameInput.dispatchEvent(new InputEvent("input", { bubbles: true }));
};

/** Selects a staged shared glyph group for one source glyph row. */
export const selectGlyphGroup = (
  shadowRoot: ShadowRoot,
  unicode: string,
  groupName: string,
): void => {
  const groupSelect = requireElement<HTMLSelectElement>(
    shadowRoot,
    `select[data-action="glyph-group"][data-unicode="${unicode}"]`,
  );

  groupSelect.value = groupName;
  groupSelect.dispatchEvent(new Event("change", { bubbles: true }));
};

/** Selects a shared glyph mapping for one source glyph row. */
export const selectMappedGlyph = (
  shadowRoot: ShadowRoot,
  unicode: string,
  glyphKey: string,
): void => {
  const glyphSelect = requireElement<HTMLSelectElement>(
    shadowRoot,
    `select[data-action="mapped-glyph"][data-unicode="${unicode}"]`,
  );

  glyphSelect.value = glyphKey;
  glyphSelect.dispatchEvent(new Event("change", { bubbles: true }));
};

/** Selects a license for one source glyph row. */
export const selectLicense = (
  shadowRoot: ShadowRoot,
  unicode: string,
  licenseValue: string,
): void => {
  const licenseSelect = requireElement<HTMLSelectElement>(
    shadowRoot,
    `select[data-action="license"][data-unicode="${unicode}"]`,
  );

  licenseSelect.value = licenseValue;
  licenseSelect.dispatchEvent(new Event("change", { bubbles: true }));
};

/** Selects the default test mapping and license for one source glyph row. */
export const selectDefaultMappingAndLicense = (
  shadowRoot: ShadowRoot,
  unicode: string,
): void => {
  selectGlyphGroup(shadowRoot, unicode, "ASCII");
  selectMappedGlyph(shadowRoot, unicode, "ASTERISK");
  selectLicense(shadowRoot, unicode, "MIT");
};

/** Clicks the component download button. */
export const clickDownload = (shadowRoot: ShadowRoot): void => {
  requireElement<HTMLButtonElement>(
    shadowRoot,
    'button[data-action="download"]',
  ).click();
};

/** Dispatches a download click even when the button is disabled. */
export const forceDownloadClick = (shadowRoot: ShadowRoot): void => {
  requireElement<HTMLButtonElement>(
    shadowRoot,
    'button[data-action="download"]',
  ).dispatchEvent(new MouseEvent("click", { bubbles: true }));
};
