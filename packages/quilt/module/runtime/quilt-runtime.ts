import { createQuiltController } from "../controller/quilt-controller.ts";
import type { TileMapData } from "../model/tile-map-data.ts";
import {
  executeOverlayDrawPlan,
  executeTerrainDrawPlan,
} from "../render/canvas-renderer.ts";
import {
  createOverlayDrawPlan,
  createTerrainDrawPlan,
} from "../render/map-draw-plan.ts";
import { createQuiltState, type QuiltState } from "../state/quilt-state.ts";
import { adaptCanvasContext } from "./canvas-context-adapter.ts";
import { handleImportFileChange } from "./quilt-runtime-io.ts";
import { attachCanvasToolListeners } from "./quilt-toolbar-listeners.ts";

const CANVAS_PIXEL_UNIT = "px";
const CANVAS_ORIGIN = 0;
const DEFAULT_DEVICE_PIXEL_RATIO = 1;

/** Input for creating mounted Quilt runtime wiring. */
export type CreateQuiltRuntimeInput = Readonly<{
  canvasSize: number;
  doorToolButton: HTMLButtonElement;
  eraseToolButton: HTMLButtonElement;
  errorRegion: HTMLElement;
  exportButton: HTMLButtonElement;
  floorToolButton: HTMLButtonElement;
  gridSizeSelect: HTMLSelectElement;
  importButton: HTMLButtonElement;
  importInput: HTMLInputElement;
  overlayCanvas: HTMLCanvasElement;
  paintToolButton: HTMLButtonElement;
  quiltState: QuiltState;
  terrainCanvas: HTMLCanvasElement;
  wallToolButton: HTMLButtonElement;
}>;

/** Mounted Quilt runtime handles owned by the Web Component shell. */
export type QuiltRuntime = Readonly<{
  disconnect: () => void;
  getState: () => QuiltState;
  setCanvasSize: (canvasSize: number) => void;
  setMapData: (tileMapData: TileMapData) => void;
  setState: (quiltState: QuiltState) => void;
}>;

type RuntimeCanvasInput = Readonly<{
  overlayCanvas: HTMLCanvasElement;
  terrainCanvas: HTMLCanvasElement;
}>;

const resizeCanvas = (canvas: HTMLCanvasElement, canvasSize: number): void => {
  /* v8 ignore next -- devicePixelRatio is always ≥1 in browser environments. */
  const dpr = globalThis.devicePixelRatio || DEFAULT_DEVICE_PIXEL_RATIO;
  canvas.width = canvasSize * dpr;
  canvas.height = canvasSize * dpr;
  canvas.style.width = `${canvasSize}${CANVAS_PIXEL_UNIT}`;
  canvas.style.height = `${canvasSize}${CANVAS_PIXEL_UNIT}`;
  canvas.getContext("2d")?.scale(dpr, dpr);
};

const resizeCanvases = (
  input: RuntimeCanvasInput,
  canvasSize: number,
): void => {
  resizeCanvas(input.terrainCanvas, canvasSize);
  resizeCanvas(input.overlayCanvas, canvasSize);
};

const getTileSize = (quiltState: QuiltState, canvasSize: number): number =>
  canvasSize /
  Math.max(quiltState.tileMapData.width, quiltState.tileMapData.height);

const renderErrors = (
  errorRegion: HTMLElement,
  quiltState: QuiltState,
): void => {
  errorRegion.textContent =
    quiltState.visibleErrors.length === CANVAS_ORIGIN
      ? ""
      : quiltState.visibleErrors.map((error) => error.message).join("\n");
};

const renderQuiltState = (
  input: RuntimeCanvasInput & { errorRegion: HTMLElement },
  quiltState: QuiltState,
  canvasSize: number,
): void => {
  const terrainContext = input.terrainCanvas.getContext("2d");
  const overlayContext = input.overlayCanvas.getContext("2d");

  renderErrors(input.errorRegion, quiltState);

  /* v8 ignore next -- Browser canvas support is required for Quilt; null is defensive shell handling. */
  if (terrainContext === null || overlayContext === null) {
    return;
  }

  executeTerrainDrawPlan(
    adaptCanvasContext(terrainContext),
    createTerrainDrawPlan({
      quiltState,
      tileSize: getTileSize(quiltState, canvasSize),
    }),
  );
  executeOverlayDrawPlan(
    adaptCanvasContext(overlayContext),
    createOverlayDrawPlan({
      quiltState,
      tileSize: getTileSize(quiltState, canvasSize),
    }),
  );
};

const createController = (
  input: CreateQuiltRuntimeInput,
  canvasSize: number,
): ReturnType<typeof createQuiltController> =>
  createQuiltController({
    getTileSize: (quiltState) => getTileSize(quiltState, canvasSize),
    onStateChange: (quiltState) =>
      renderQuiltState(input, quiltState, canvasSize),
    overlayCanvas: input.overlayCanvas,
    quiltState: input.quiltState,
  });

/** Creates mounted runtime wiring and teardown handles for Quilt. */
export const createQuiltRuntime = (
  input: CreateQuiltRuntimeInput,
): QuiltRuntime => {
  let currentCanvasSize = input.canvasSize;
  resizeCanvases(input, currentCanvasSize);
  renderQuiltState(input, input.quiltState, currentCanvasSize);
  const controller = createController(input, currentCanvasSize);
  const onImportFileChange = (importInput: HTMLInputElement): void => {
    handleImportFileChange(importInput, controller);
  };
  const detachListeners = attachCanvasToolListeners(
    {
      doorToolButton: input.doorToolButton,
      eraseToolButton: input.eraseToolButton,
      exportButton: input.exportButton,
      floorToolButton: input.floorToolButton,
      gridSizeSelect: input.gridSizeSelect,
      importButton: input.importButton,
      importInput: input.importInput,
      paintToolButton: input.paintToolButton,
      wallToolButton: input.wallToolButton,
    },
    controller,
    onImportFileChange,
  );

  return {
    disconnect: (): void => {
      controller.disconnect();
      for (const detach of detachListeners) {
        detach();
      }
    },
    getState: controller.getState,
    setCanvasSize: (canvasSize: number): void => {
      currentCanvasSize = canvasSize;
      resizeCanvases(input, currentCanvasSize);
      renderQuiltState(input, controller.getState(), currentCanvasSize);
    },
    setMapData: (tileMapData: TileMapData): void => {
      controller.setState(createQuiltState({ tileMapData }));
    },
    setState: controller.setState,
  };
};
