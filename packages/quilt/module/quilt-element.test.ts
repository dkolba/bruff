import { describe, expect, test, vi } from "vitest";
import {
  getQuiltMapData,
  registerQuiltElement,
  setQuiltMapData,
} from "./quilt-element-helpers.ts";
import { createTileMapData } from "./model/tile-map-data.ts";
import { QuiltElement } from "./quilt-element.ts";

const DEFAULT_MAP_SIZE = 4;

const appendElement = (): Element => {
  registerQuiltElement();
  const quiltElement = document.createElement("tool-quilt");
  document.body.append(quiltElement);

  return quiltElement;
};

describe("quilt element — lifecycle setup", () => {
  test("coordinates lifecycle setup without domain methods", () => {
    const quiltElement = appendElement();

    expect(
      quiltElement.shadowRoot?.querySelector('[data-quilt="terrain-canvas"]'),
    ).toBeInstanceOf(HTMLCanvasElement);
    expect(
      quiltElement.shadowRoot?.querySelector('[data-quilt="overlay-canvas"]'),
    ).toBeInstanceOf(HTMLCanvasElement);
    expect("validateQuiltMapSize" in quiltElement).toBe(false);
    expect("createPreviewFontState" in quiltElement).toBe(false);
    expect("createDownloadMapCommand" in quiltElement).toBe(false);

    quiltElement.remove();
  });

  test("connectedCallback is idempotent", () => {
    const quiltElement = appendElement();
    const { shadowRoot } = quiltElement;

    if (quiltElement instanceof QuiltElement) {
      quiltElement.connectedCallback();
    }

    const { shadowRoot: nextShadowRoot } = quiltElement;

    expect(nextShadowRoot).toBe(shadowRoot);
    quiltElement.remove();
  });
});

describe("quilt element — canvas sizing", () => {
  test("sizes canvases from the smaller viewport dimension", () => {
    const quiltElement = appendElement();
    const terrainCanvas = quiltElement.shadowRoot?.querySelector(
      '[data-quilt="terrain-canvas"]',
    );
    const viewportCanvasSize = Math.floor(
      Math.min(globalThis.innerWidth, globalThis.innerHeight),
    );

    expect(terrainCanvas).toBeInstanceOf(HTMLCanvasElement);
    if (terrainCanvas instanceof HTMLCanvasElement) {
      expect(terrainCanvas.width).toBe(viewportCanvasSize);
    }
    quiltElement.remove();
  });

  test("updates runtime canvas size on window resize", () => {
    const quiltElement = appendElement();

    globalThis.dispatchEvent(new Event("resize"));

    expect(quiltElement).toBeInstanceOf(QuiltElement);
    quiltElement.remove();
  });
});

describe("quilt element — map data helpers", () => {
  test("returns default map data before runtime connects", () => {
    registerQuiltElement();
    const quiltElement = document.createElement("tool-quilt");

    if (quiltElement instanceof QuiltElement) {
      expect(getQuiltMapData(quiltElement).width).toBe(DEFAULT_MAP_SIZE);
    }
  });

  test("sets and gets map data through external helper functions", () => {
    const quiltElement = appendElement();
    const tileMapData = createTileMapData({ height: 2, width: 2 });

    if (quiltElement instanceof QuiltElement) {
      setQuiltMapData(quiltElement, tileMapData);
      expect(getQuiltMapData(quiltElement)).toBe(tileMapData);
    }
    quiltElement.remove();
  });
});

describe("quilt element — registration", () => {
  test("registers the custom element once", () => {
    registerQuiltElement();
    registerQuiltElement();

    expect(customElements.get("tool-quilt")).toBe(QuiltElement);
  });

  test("defines the custom element when not already registered", () => {
    // eslint-disable-next-line unicorn/no-useless-undefined -- TS requires argument for typed mock
    const getSpy = vi.spyOn(customElements, "get").mockReturnValue(undefined);
    const defineSpy = vi
      .spyOn(customElements, "define")
      .mockImplementation(vi.fn());

    registerQuiltElement();

    expect(defineSpy).toHaveBeenCalledWith("tool-quilt", QuiltElement);

    getSpy.mockRestore();
    defineSpy.mockRestore();
  });
});

describe("quilt element — shadow DOM structure", () => {
  test("exposes grid-size select and terrain draw buttons from shadow DOM", () => {
    const quiltElement = appendElement();

    expect(
      quiltElement.shadowRoot?.querySelector('[data-quilt="grid-size-select"]'),
    ).toBeInstanceOf(HTMLSelectElement);
    expect(
      quiltElement.shadowRoot?.querySelector('[data-quilt="floor-tool"]'),
    ).toBeInstanceOf(HTMLButtonElement);
    expect(
      quiltElement.shadowRoot?.querySelector('[data-quilt="wall-tool"]'),
    ).toBeInstanceOf(HTMLButtonElement);
    expect(
      quiltElement.shadowRoot?.querySelector('[data-quilt="door-tool"]'),
    ).toBeInstanceOf(HTMLButtonElement);
    expect(
      quiltElement.shadowRoot?.querySelector('[data-quilt="export-button"]'),
    ).toBeInstanceOf(HTMLButtonElement);
    expect(
      quiltElement.shadowRoot?.querySelector('[data-quilt="import-button"]'),
    ).toBeInstanceOf(HTMLButtonElement);
    expect(
      quiltElement.shadowRoot?.querySelector('[data-quilt="error-region"]'),
    ).toBeInstanceOf(HTMLElement);

    quiltElement.remove();
  });
});
