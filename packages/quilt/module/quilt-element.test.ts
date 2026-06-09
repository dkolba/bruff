/* eslint-disable max-lines-per-function, no-magic-numbers -- Element lifecycle tests assert complete custom element behaviour. */
import { describe, expect, test } from "vitest";
import { createTileMapData } from "./model/tile-map-data.ts";
import {
  getQuiltMapData,
  QuiltElement,
  registerQuiltElement,
  setQuiltMapData,
} from "./quilt-element.ts";

const appendElement = (): Element => {
  registerQuiltElement();
  const quiltElement = document.createElement("tool-quilt");
  document.body.append(quiltElement);

  return quiltElement;
};

describe("quilt element", () => {
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

  test("returns default map data before runtime connects", () => {
    registerQuiltElement();
    const quiltElement = document.createElement("tool-quilt");

    if (quiltElement instanceof QuiltElement) {
      expect(getQuiltMapData(quiltElement).width).toBe(4);
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

  test("registers the custom element once", () => {
    registerQuiltElement();
    registerQuiltElement();

    expect(customElements.get("tool-quilt")).toBe(QuiltElement);
  });
});
