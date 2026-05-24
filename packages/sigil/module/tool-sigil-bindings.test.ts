import { describe, expect, it, vi } from "vitest";
import { connectToolSigilControls } from "./tool-sigil-bindings.js";
import { requireElement } from "./tool-sigil-test-support.js";

const EMPTY_CHILD_COUNT = 0;

const createBindingShadowRoot = (): ShadowRoot => {
  const host = document.createElement("div");
  const shadowRoot = host.attachShadow({ mode: "open" });
  shadowRoot.innerHTML = `
    <input name="font-file" type="file">
    <textarea name="characters"></textarea>
    <div data-state="glyph-list"></div>
    <button type="button" data-action="download">Download JSON</button>
  `;

  return shadowRoot;
};

const appendGlyphInput = (
  glyphList: Element,
  unicode: string | null,
): HTMLInputElement => {
  const glyphInput = document.createElement("input");
  glyphInput.value = "star";
  if (unicode !== null) {
    Object.assign(glyphInput.dataset, { unicode });
  }
  glyphList.append(glyphInput);

  return glyphInput;
};

describe("connectToolSigilControls setup", () => {
  it("connects without the optional characters textarea", () => {
    const host = document.createElement("div");
    const shadowRoot = host.attachShadow({ mode: "open" });

    const disconnect = connectToolSigilControls(shadowRoot, {
      onCharactersInput: vi.fn(),
      onDownloadClick: vi.fn(),
      onFontFileSelected: vi.fn(),
      onGlyphNameInput: vi.fn(),
    });

    expect(shadowRoot.childElementCount).toBe(EMPTY_CHILD_COUNT);

    disconnect();
  });
});

describe("connectToolSigilControls glyph delegation", () => {
  it("ignores delegated glyph input events without glyph metadata", () => {
    const shadowRoot = createBindingShadowRoot();
    const glyphList = requireElement(shadowRoot, '[data-state="glyph-list"]');
    const onGlyphNameInput = vi.fn();
    const disconnect = connectToolSigilControls(shadowRoot, {
      onCharactersInput: vi.fn(),
      onDownloadClick: vi.fn(),
      onFontFileSelected: vi.fn(),
      onGlyphNameInput,
    });

    glyphList.dispatchEvent(new InputEvent("input", { bubbles: true }));
    appendGlyphInput(glyphList, null).dispatchEvent(
      new InputEvent("input", { bubbles: true }),
    );

    expect(onGlyphNameInput).not.toHaveBeenCalled();

    disconnect();
  });

  it("delegates glyph name input events", () => {
    const shadowRoot = createBindingShadowRoot();
    const glyphList = requireElement(shadowRoot, '[data-state="glyph-list"]');
    const onGlyphNameInput = vi.fn();
    const disconnect = connectToolSigilControls(shadowRoot, {
      onCharactersInput: vi.fn(),
      onDownloadClick: vi.fn(),
      onFontFileSelected: vi.fn(),
      onGlyphNameInput,
    });
    const glyphInput = appendGlyphInput(glyphList, "★");

    glyphInput.dispatchEvent(new InputEvent("input", { bubbles: true }));

    expect(onGlyphNameInput).toHaveBeenCalledWith("★", "star");

    disconnect();
  });
});
