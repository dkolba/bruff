import {
  applyToolSigilFontLoadResult,
  clearToolSigilPreviewFontFamily,
  createToolSigilState,
  selectToolSigilDownloadDisabled,
  selectToolSigilDownloadGlyphMap,
  selectToolSigilViewModel,
  setToolSigilCharacters,
  setToolSigilGlyphGroup,
  setToolSigilGlyphName,
  setToolSigilLicense,
  setToolSigilMappedGlyph,
  setToolSigilPreviewFontFamily,
  startToolSigilFontSelection,
  type ToolSigilState,
} from "./tool-sigil-state.js";
import {
  connectToolSigilControls,
  type DisconnectToolSigilControls,
} from "./tool-sigil-bindings.js";
import {
  createToolSigilPreviewResource,
  type ToolSigilPreviewResource,
} from "./tool-sigil-preview-resource.js";
import {
  renderToolSigil,
  renderToolSigilSelection,
  renderToolSigilValidation,
} from "./tool-sigil-render.js";
import { loadSigilFontFile } from "./font-file.js";
import type { SigilGlyphMapping } from "./glyph-json.js";
import { TOOL_SIGIL_TEMPLATE } from "./tool-sigil-template.js";
import { triggerJsonDownload } from "./glyph-download.js";

/**
 * Development-only web component for extracting glyph JSON from uploaded fonts.
 */
// eslint-disable-next-line wc/define-tag-after-class-definition
export class ToolSigil extends HTMLElement {
  #disconnectControls: DisconnectToolSigilControls | undefined;

  #previewResource: ToolSigilPreviewResource = createToolSigilPreviewResource({
    onPreviewFontCleared: (fontLoadToken) => {
      this.#handlePreviewFontCleared(fontLoadToken);
    },
    onPreviewFontLoaded: (fontLoadToken, fontFamily) => {
      this.#handlePreviewFontLoaded(fontLoadToken, fontFamily);
    },
  });

  #state: ToolSigilState = createToolSigilState();

  connectedCallback(): void {
    const shadowRoot = this.#ensureShadowRoot();

    if (this.#disconnectControls === undefined) {
      this.#disconnectControls = connectToolSigilControls(shadowRoot, {
        onCharactersInput: (characters) => {
          this.#handleCharactersInput(characters);
        },
        onDownloadClick: () => {
          this.#handleDownloadClick();
        },
        onFontFileSelected: (fontFile) => {
          this.#handleFontFileSelected(fontFile);
        },
        onGlyphGroupChange: (unicode, groupName) => {
          this.#handleGlyphGroupChange(unicode, groupName);
        },
        onGlyphNameInput: (unicode, glyphName) => {
          this.#handleGlyphNameInput(unicode, glyphName);
        },
        onLicenseChange: (unicode, licenseValue) => {
          this.#handleLicenseChange(unicode, licenseValue);
        },
        onMappedGlyphChange: (unicode, mapping) => {
          this.#handleMappedGlyphChange(unicode, mapping);
        },
      });
    }

    this.#renderState();
  }

  disconnectedCallback(): void {
    this.#disconnectControls?.();
    this.#disconnectControls = undefined;
    this.#previewResource.disconnect();
    this.#state = clearToolSigilPreviewFontFamily(
      this.#state,
      this.#state.fontLoadToken,
    );
  }

  static template(): string {
    return TOOL_SIGIL_TEMPLATE;
  }

  #ensureShadowRoot(): ShadowRoot {
    if (this.shadowRoot !== null) {
      return this.shadowRoot;
    }

    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.innerHTML = ToolSigil.template();

    return shadowRoot;
  }

  #renderState(): void {
    renderToolSigil(
      this.#ensureShadowRoot(),
      selectToolSigilViewModel(this.#state),
    );
  }

  #renderValidationState(): void {
    renderToolSigilValidation(
      this.#ensureShadowRoot(),
      selectToolSigilViewModel(this.#state),
    );
  }

  #renderSelectionState(): void {
    renderToolSigilSelection(
      this.#ensureShadowRoot(),
      selectToolSigilViewModel(this.#state),
    );
  }

  #handleCharactersInput(characters: string): void {
    this.#state = setToolSigilCharacters(this.#state, characters);
    this.#renderState();
  }

  #handleGlyphNameInput(unicode: string, glyphName: string): void {
    this.#state = setToolSigilGlyphName(this.#state, unicode, glyphName);
    this.#renderValidationState();
  }

  #handleGlyphGroupChange(unicode: string, groupName: string): void {
    this.#state = setToolSigilGlyphGroup(this.#state, unicode, groupName);
    this.#renderSelectionState();
  }

  #handleMappedGlyphChange(unicode: string, mapping: SigilGlyphMapping): void {
    this.#state = setToolSigilMappedGlyph(this.#state, unicode, mapping);
    this.#renderSelectionState();
  }

  #handleLicenseChange(unicode: string, licenseValue: string): void {
    this.#state = setToolSigilLicense(this.#state, unicode, licenseValue);
    this.#renderSelectionState();
  }

  #handleFontFileSelected(fontFile: File | undefined): void {
    const selection = startToolSigilFontSelection(this.#state, fontFile?.name);
    this.#state = selection.state;
    this.#previewResource.clear();
    this.#renderState();

    if (fontFile === undefined) {
      return;
    }

    const previewFontFamily = this.#previewResource.load(
      fontFile,
      selection.fontLoadToken,
    );
    this.#state = setToolSigilPreviewFontFamily(
      this.#state,
      selection.fontLoadToken,
      previewFontFamily,
    );
    loadSigilFontFile(fontFile).then((fontResult) => {
      this.#handleFontLoadResult(selection.fontLoadToken, fontResult);
    });
  }

  #handleFontLoadResult(
    fontLoadToken: number,
    fontResult: Awaited<ReturnType<typeof loadSigilFontFile>>,
  ): void {
    const nextState = applyToolSigilFontLoadResult(
      this.#state,
      fontLoadToken,
      fontResult,
    );
    if (nextState === this.#state) {
      return;
    }

    this.#state = nextState;
    this.#renderState();
  }

  #handlePreviewFontLoaded(fontLoadToken: number, fontFamily: string): void {
    const nextState = setToolSigilPreviewFontFamily(
      this.#state,
      fontLoadToken,
      fontFamily,
    );
    this.#state = nextState;
    this.#renderState();
  }

  #handlePreviewFontCleared(fontLoadToken: number): void {
    this.#state = clearToolSigilPreviewFontFamily(this.#state, fontLoadToken);
  }

  #handleDownloadClick(): void {
    const glyphMapResult = selectToolSigilDownloadGlyphMap(this.#state);
    if (
      glyphMapResult.type === "error" ||
      selectToolSigilDownloadDisabled(this.#state)
    ) {
      this.#renderState();
      return;
    }

    triggerJsonDownload(glyphMapResult.value);
  }
}
