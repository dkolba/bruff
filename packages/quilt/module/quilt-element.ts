import {
  createQuiltRuntime,
  type QuiltRuntime,
} from "./runtime/quilt-runtime.ts";
import { createQuiltState } from "./state/quilt-state.ts";
import { createQuiltTemplate } from "./template.ts";
import { createTileMapData } from "./model/tile-map-data.ts";

const QUILT_ELEMENT_NAME = "tool-quilt";
const DEFAULT_MAP_SIZE = 4;
const MIN_VIEWPORT_SIZE = 1;

const getViewportCanvasSize = (): number =>
  Math.max(
    MIN_VIEWPORT_SIZE,
    Math.floor(Math.min(globalThis.innerWidth, globalThis.innerHeight)),
  );

const queryElement = <T extends Element>(
  shadowRoot: ShadowRoot,
  selector: string,
): T | null => shadowRoot.querySelector<T>(selector);

const isCanvas = (element: unknown): element is HTMLCanvasElement =>
  element instanceof HTMLCanvasElement;
const isButton = (element: unknown): element is HTMLButtonElement =>
  element instanceof HTMLButtonElement;
const isSelect = (element: unknown): element is HTMLSelectElement =>
  element instanceof HTMLSelectElement;
const isInput = (element: unknown): element is HTMLInputElement =>
  element instanceof HTMLInputElement;
const isElement = (element: unknown): element is HTMLElement =>
  element instanceof HTMLElement;

const allElementsValid = (shadowRoot: ShadowRoot): boolean =>
  isCanvas(queryElement(shadowRoot, '[data-quilt="terrain-canvas"]')) &&
  isCanvas(queryElement(shadowRoot, '[data-quilt="overlay-canvas"]')) &&
  isButton(queryElement(shadowRoot, '[data-quilt="paint-tool"]')) &&
  isButton(queryElement(shadowRoot, '[data-quilt="erase-tool"]')) &&
  isButton(queryElement(shadowRoot, '[data-quilt="floor-tool"]')) &&
  isButton(queryElement(shadowRoot, '[data-quilt="wall-tool"]')) &&
  isButton(queryElement(shadowRoot, '[data-quilt="door-tool"]')) &&
  isSelect(queryElement(shadowRoot, '[data-quilt="grid-size-select"]')) &&
  isButton(queryElement(shadowRoot, '[data-quilt="export-button"]')) &&
  isButton(queryElement(shadowRoot, '[data-quilt="import-button"]')) &&
  isInput(queryElement(shadowRoot, '[data-quilt="import-input"]')) &&
  isElement(queryElement(shadowRoot, '[data-quilt="error-region"]'));

/* v8 ignore next -- The template owns these selectors; fallback is defensive shell code. */
const createRuntime = (shadowRoot: ShadowRoot): QuiltRuntime | undefined =>
  allElementsValid(shadowRoot)
    ? createQuiltRuntime({
        canvasSize: getViewportCanvasSize(),
        doorToolButton: shadowRoot.querySelector('[data-quilt="door-tool"]')!,
        eraseToolButton: shadowRoot.querySelector('[data-quilt="erase-tool"]')!,
        errorRegion: shadowRoot.querySelector('[data-quilt="error-region"]')!,
        exportButton: shadowRoot.querySelector('[data-quilt="export-button"]')!,
        floorToolButton: shadowRoot.querySelector('[data-quilt="floor-tool"]')!,
        gridSizeSelect: shadowRoot.querySelector(
          '[data-quilt="grid-size-select"]',
        )!,
        importButton: shadowRoot.querySelector('[data-quilt="import-button"]')!,
        importInput: shadowRoot.querySelector('[data-quilt="import-input"]')!,
        overlayCanvas: shadowRoot.querySelector(
          '[data-quilt="overlay-canvas"]',
        )!,
        paintToolButton: shadowRoot.querySelector('[data-quilt="paint-tool"]')!,
        quiltState: createQuiltState({
          tileMapData: createTileMapData({
            height: DEFAULT_MAP_SIZE,
            width: DEFAULT_MAP_SIZE,
          }),
        }),
        terrainCanvas: shadowRoot.querySelector(
          '[data-quilt="terrain-canvas"]',
        )!,
        wallToolButton: shadowRoot.querySelector('[data-quilt="wall-tool"]')!,
      })
    : undefined;

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

customElements.define(QUILT_ELEMENT_NAME, QuiltElement);
