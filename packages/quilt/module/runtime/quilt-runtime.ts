import { createQuiltController } from "../controller/quilt-controller.ts";
import {
  floorTileId,
  wallTileId,
  type TileMapData,
} from "../model/tile-map-data.ts";
import {
  executeOverlayDrawPlan,
  executeTerrainDrawPlan,
} from "../render/canvas-renderer.ts";
import {
  createOverlayDrawPlan,
  createTerrainDrawPlan,
} from "../render/map-draw-plan.ts";
import { createQuiltState, type QuiltState } from "../state/quilt-state.ts";

const CANVAS_PIXEL_UNIT = "px";

/** Input for creating mounted Quilt runtime wiring. */
export type CreateQuiltRuntimeInput = Readonly<{
  terrainCanvas: HTMLCanvasElement;
  overlayCanvas: HTMLCanvasElement;
  paintToolButton: HTMLButtonElement;
  eraseToolButton: HTMLButtonElement;
  quiltState: QuiltState;
  canvasSize: number;
}>;

/** Mounted Quilt runtime handles owned by the Web Component shell. */
export type QuiltRuntime = Readonly<{
  getState: () => QuiltState;
  setState: (quiltState: QuiltState) => void;
  setMapData: (tileMapData: TileMapData) => void;
  setCanvasSize: (canvasSize: number) => void;
  disconnect: () => void;
}>;

type RuntimeCanvasInput = Readonly<{
  terrainCanvas: HTMLCanvasElement;
  overlayCanvas: HTMLCanvasElement;
}>;

const resizeCanvas = (canvas: HTMLCanvasElement, canvasSize: number): void => {
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  canvas.style.width = `${canvasSize}${CANVAS_PIXEL_UNIT}`;
  canvas.style.height = `${canvasSize}${CANVAS_PIXEL_UNIT}`;
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

const renderQuiltState = (
  input: RuntimeCanvasInput,
  quiltState: QuiltState,
  canvasSize: number,
): void => {
  const terrainContext = input.terrainCanvas.getContext("2d");
  const overlayContext = input.overlayCanvas.getContext("2d");

  /* v8 ignore next -- Browser canvas support is required for Quilt; null is defensive shell handling. */
  if (terrainContext === null || overlayContext === null) {
    return;
  }

  executeTerrainDrawPlan(
    terrainContext,
    createTerrainDrawPlan({
      quiltState,
      tileSize: getTileSize(quiltState, canvasSize),
    }),
  );
  executeOverlayDrawPlan(
    overlayContext,
    createOverlayDrawPlan({
      quiltState,
      tileSize: getTileSize(quiltState, canvasSize),
    }),
  );
};

/** Creates mounted runtime wiring and teardown handles for Quilt. */
export const createQuiltRuntime = (
  input: CreateQuiltRuntimeInput,
): QuiltRuntime => {
  let currentCanvasSize = input.canvasSize;
  resizeCanvases(input, currentCanvasSize);
  renderQuiltState(input, input.quiltState, currentCanvasSize);
  const controller = createQuiltController({
    getTileSize: (quiltState) => getTileSize(quiltState, currentCanvasSize),
    onStateChange: (quiltState) =>
      renderQuiltState(input, quiltState, currentCanvasSize),
    overlayCanvas: input.overlayCanvas,
    quiltState: input.quiltState,
  });
  const selectPaintTool = (): void => {
    controller.setState({
      ...controller.getState(),
      selectedTileId: wallTileId,
      selectedTool: "paint",
    });
  };
  const selectEraseTool = (): void => {
    controller.setState({
      ...controller.getState(),
      selectedTileId: floorTileId,
      selectedTool: "erase",
    });
  };

  input.paintToolButton.addEventListener("click", selectPaintTool);
  input.eraseToolButton.addEventListener("click", selectEraseTool);

  return {
    disconnect: (): void => {
      controller.disconnect();
      input.paintToolButton.removeEventListener("click", selectPaintTool);
      input.eraseToolButton.removeEventListener("click", selectEraseTool);
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
