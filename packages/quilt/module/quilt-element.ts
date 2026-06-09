/* eslint-disable capitalized-comments, no-use-before-define, wc/no-exports-with-element -- Quilt intentionally exports registration and data helpers beside the custom element. */
import { createTileMapData, type TileMapData } from "./model/tile-map-data.ts";
import {
  createQuiltRuntime,
  type QuiltRuntime,
} from "./runtime/quilt-runtime.ts";
import { createQuiltState } from "./state/quilt-state.ts";
import { createQuiltTemplate } from "./template.ts";

const QUILT_ELEMENT_NAME = "tool-quilt";
const DEFAULT_MAP_SIZE = 4;
const MIN_VIEWPORT_SIZE = 1;

const getViewportCanvasSize = (): number =>
  Math.max(
    MIN_VIEWPORT_SIZE,
    Math.floor(Math.min(globalThis.innerWidth, globalThis.innerHeight)),
  );

/** Browser custom element for editing roguelike tile maps. */
export class QuiltElement extends HTMLElement {
  public runtime: QuiltRuntime | undefined;
  private readonly resizeCanvas = (): void => {
    this.runtime?.setCanvasSize(getViewportCanvasSize());
  };

  public connectedCallback(): void {
    if (this.shadowRoot !== null) {
      return;
    }

    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.append(createQuiltTemplate().content.cloneNode(true));
    this.runtime = createRuntime(shadowRoot);
    globalThis.addEventListener("resize", this.resizeCanvas);
  }

  public disconnectedCallback(): void {
    globalThis.removeEventListener("resize", this.resizeCanvas);
    this.runtime?.disconnect();
    this.runtime = undefined;
  }
}

/** Sets map data on a mounted Quilt element. */
export const setQuiltMapData = (
  quiltElement: QuiltElement,
  tileMapData: TileMapData,
): void => {
  quiltElement.runtime?.setMapData(tileMapData);
};

/** Gets map data from a mounted Quilt element. */
export const getQuiltMapData = (quiltElement: QuiltElement): TileMapData =>
  quiltElement.runtime?.getState().tileMapData ??
  createTileMapData({ height: DEFAULT_MAP_SIZE, width: DEFAULT_MAP_SIZE });

/** Registers the Quilt custom element if it is not already defined. */
export const registerQuiltElement = (): void => {
  if (customElements.get(QUILT_ELEMENT_NAME) === undefined) {
    customElements.define(QUILT_ELEMENT_NAME, QuiltElement);
  }
};

const createRuntime = (shadowRoot: ShadowRoot): QuiltRuntime | undefined => {
  const terrainCanvas = shadowRoot.querySelector(
    '[data-quilt="terrain-canvas"]',
  );
  const overlayCanvas = shadowRoot.querySelector(
    '[data-quilt="overlay-canvas"]',
  );
  const paintToolButton = shadowRoot.querySelector('[data-quilt="paint-tool"]');
  const eraseToolButton = shadowRoot.querySelector('[data-quilt="erase-tool"]');

  /* v8 ignore next -- The template owns these selectors; fallback is defensive shell code. */
  return terrainCanvas instanceof HTMLCanvasElement &&
    overlayCanvas instanceof HTMLCanvasElement &&
    paintToolButton instanceof HTMLButtonElement &&
    eraseToolButton instanceof HTMLButtonElement
    ? createQuiltRuntime({
        canvasSize: getViewportCanvasSize(),
        eraseToolButton,
        overlayCanvas,
        paintToolButton,
        quiltState: createQuiltState({
          tileMapData: createTileMapData({
            height: DEFAULT_MAP_SIZE,
            width: DEFAULT_MAP_SIZE,
          }),
        }),
        terrainCanvas,
      })
    : undefined;
};
