/* eslint-disable unicorn/text-encoding-identifier-case -- Delegation tests cover grouped glyph names such as ASCII in one DOM fixture. */
import {
  connectToolSigilControls,
  type DisconnectToolSigilControls,
  type ToolSigilControlHandlers,
} from "./tool-sigil-bindings.js";
import { describe, expect, it, vi } from "vitest";
import { requireElement } from "./tool-sigil-test-support.js";

type ConnectedBindingShadowRoot = Readonly<{
  disconnect: DisconnectToolSigilControls;
  glyphList: Element;
}>;

const EMPTY_CHILD_COUNT = 0;
const GLYPH_LIST_SELECTOR = '[data-state="glyph-list"]';

const createBindingShadowRoot = (): ShadowRoot => {
  const host = document.createElement("div");
  const shadowRoot = host.attachShadow({ mode: "open" });
  shadowRoot.innerHTML = `
    <input name="font-file" type="file">
    <select name="schema"></select>
    <div data-state="glyph-list"></div>
    <button type="button" data-action="download">Download JSON</button>
  `;

  return shadowRoot;
};

const appendSelect = (
  glyphList: Element,
  action: string,
  unicode: string | null,
): HTMLSelectElement => {
  const select = document.createElement("select");
  select.value = "ASCII";
  Object.assign(select.dataset, { action });
  if (unicode !== null) {
    Object.assign(select.dataset, { unicode });
  }
  glyphList.append(select);

  return select;
};

const appendMappedGlyphSelect = (glyphList: Element): HTMLSelectElement => {
  const select = appendSelect(glyphList, "mapped-glyph", "★");
  const option = new Option("ASTERISK *", "ASTERISK");
  Object.assign(select.dataset, { groupName: "ASCII" });
  Object.assign(option.dataset, { glyph: "*" });
  select.append(option);
  select.value = "ASTERISK";

  return select;
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

const createToolSigilHandlers = (
  handlers: Partial<ToolSigilControlHandlers> = {},
): ToolSigilControlHandlers => ({
  onDownloadClick: vi.fn(),
  onFontFileSelected: vi.fn(),
  onGlyphGroupChange: vi.fn(),
  onGlyphNameInput: vi.fn(),
  onLicenseChange: vi.fn(),
  onMappedGlyphChange: vi.fn(),
  onSchemaChange: vi.fn(),
  ...handlers,
});

const connectBindingShadowRoot = (
  handlers: Partial<ToolSigilControlHandlers>,
): ConnectedBindingShadowRoot => {
  const shadowRoot = createBindingShadowRoot();
  const glyphList = requireElement(shadowRoot, GLYPH_LIST_SELECTOR);
  const disconnect = connectToolSigilControls(
    shadowRoot,
    createToolSigilHandlers(handlers),
  );

  return { disconnect, glyphList };
};

describe("connectToolSigilControls setup", () => {
  it("connects without the optional characters textarea", () => {
    const host = document.createElement("div");
    const shadowRoot = host.attachShadow({ mode: "open" });

    const disconnect = connectToolSigilControls(
      shadowRoot,
      createToolSigilHandlers(),
    );

    expect(shadowRoot.childElementCount).toBe(EMPTY_CHILD_COUNT);

    disconnect();
  });
});

describe("connectToolSigilControls glyph delegation", () => {
  it("ignores delegated glyph input events without glyph metadata", () => {
    const onGlyphNameInput = vi.fn();
    const { disconnect, glyphList } = connectBindingShadowRoot({
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
    const onGlyphNameInput = vi.fn();
    const { disconnect, glyphList } = connectBindingShadowRoot({
      onGlyphNameInput,
    });
    const glyphInput = appendGlyphInput(glyphList, "★");

    glyphInput.dispatchEvent(new InputEvent("input", { bubbles: true }));

    expect(onGlyphNameInput).toHaveBeenCalledWith("★", "star");

    disconnect();
  });
});

describe("connectToolSigilControls selection delegation guards", () => {
  it("ignores delegated select changes without select targets or metadata", () => {
    const onGlyphGroupChange = vi.fn();
    const { disconnect, glyphList } = connectBindingShadowRoot({
      onGlyphGroupChange,
    });

    glyphList.dispatchEvent(new Event("change", { bubbles: true }));
    appendSelect(glyphList, "glyph-group", null).dispatchEvent(
      new Event("change", { bubbles: true }),
    );

    expect(onGlyphGroupChange).not.toHaveBeenCalled();

    disconnect();
  });
});

describe("connectToolSigilControls glyph group delegation", () => {
  it("delegates glyph group select changes", () => {
    const onGlyphGroupChange = vi.fn();
    const { disconnect, glyphList } = connectBindingShadowRoot({
      onGlyphGroupChange,
    });
    const select = appendSelect(glyphList, "glyph-group", "★");
    select.append(new Option("Box", "BOX"));
    select.value = "BOX";

    select.dispatchEvent(new Event("change", { bubbles: true }));

    expect(onGlyphGroupChange).toHaveBeenCalledWith("★", "BOX");

    disconnect();
  });
});

describe("connectToolSigilControls mapped value delegation", () => {
  it("ignores mapped glyph select changes without group metadata", () => {
    const onMappedGlyphChange = vi.fn();
    const { disconnect, glyphList } = connectBindingShadowRoot({
      onMappedGlyphChange,
    });
    const select = appendSelect(glyphList, "mapped-glyph", "★");
    select.append(new Option("ASTERISK *", "ASTERISK"));
    select.value = "ASTERISK";

    select.dispatchEvent(new Event("change", { bubbles: true }));

    expect(onMappedGlyphChange).not.toHaveBeenCalled();

    disconnect();
  });

  it("delegates mapped glyph select changes", () => {
    const onMappedGlyphChange = vi.fn();
    const { disconnect, glyphList } = connectBindingShadowRoot({
      onMappedGlyphChange,
    });
    const select = appendMappedGlyphSelect(glyphList);

    select.dispatchEvent(new Event("change", { bubbles: true }));

    expect(onMappedGlyphChange).toHaveBeenCalledWith("★", {
      glyph: "*",
      glyphKey: "ASTERISK",
      groupName: "ASCII",
    });

    disconnect();
  });
});

describe("connectToolSigilControls license delegation", () => {
  it("delegates license select changes", () => {
    const onLicenseChange = vi.fn();
    const { disconnect, glyphList } = connectBindingShadowRoot({
      onLicenseChange,
    });
    const select = appendSelect(glyphList, "license", "★");
    select.append(new Option("MIT License (MIT)", "MIT"));
    select.value = "MIT";

    select.dispatchEvent(new Event("change", { bubbles: true }));

    expect(onLicenseChange).toHaveBeenCalledWith("★", "MIT");

    disconnect();
  });
});
