import { floorTileId, getTile } from "../model/tile-map-data.ts";
import { createPaintTilesCommand } from "../commands/editor-command.ts";
import { executeEditorCommand } from "../state/execute-editor-command.ts";
import type { QuiltState } from "../state/quilt-state.ts";
import { screenToTileCoordinate } from "../render/coordinates.ts";

/** Input for creating Quilt pointer controller wiring. */
export type CreateQuiltControllerInput = Readonly<{
  overlayCanvas: HTMLCanvasElement;
  quiltState: QuiltState;
  getTileSize: (quiltState: QuiltState) => number;
  onStateChange: (quiltState: QuiltState) => void;
}>;

/** Runtime controller for pointer-to-command wiring. */
export type QuiltController = Readonly<{
  handlePointerDown: (pointerEvent: PointerEvent) => void;
  getState: () => QuiltState;
  setState: (quiltState: QuiltState) => void;
  disconnect: () => void;
}>;

type PointerPaintResult = Readonly<{
  paintedCoordinate: `${number}:${number}`;
  quiltState: QuiltState;
}>;

const computePointerPaint = (
  input: CreateQuiltControllerInput,
  currentState: QuiltState,
  pointerEvent: PointerEvent,
): PointerPaintResult => {
  const canvasBounds = input.overlayCanvas.getBoundingClientRect();
  const tileCoordinate = screenToTileCoordinate({
    camera: currentState.camera,
    screenCoordinate: {
      screenX: pointerEvent.clientX - canvasBounds.left,
      screenY: pointerEvent.clientY - canvasBounds.top,
    },
    tileSize: input.getTileSize(currentState),
  });
  const beforeTileId = getTile(
    currentState.tileMapData,
    tileCoordinate,
    currentState.selectedLayer,
  );
  const command = createPaintTilesCommand({
    changes: [
      {
        afterTileId:
          currentState.selectedTool === "erase"
            ? floorTileId
            : currentState.selectedTileId,
        beforeTileId,
        coordinate: tileCoordinate,
        layerId: currentState.selectedLayer,
      },
    ],
  });

  return {
    paintedCoordinate: `${tileCoordinate.tileX}:${tileCoordinate.tileY}`,
    quiltState: executeEditorCommand(currentState, command),
  };
};

/** Creates controller wiring that turns pointer input into editor commands. */
export const createQuiltController = (
  input: CreateQuiltControllerInput,
): QuiltController => {
  let currentState = input.quiltState;
  const handlePointerDown = (pointerEvent: PointerEvent): void => {
    const paintResult = computePointerPaint(input, currentState, pointerEvent);
    currentState = paintResult.quiltState;
    // eslint-disable-next-line dot-notation -- TS noPropertyAccessFromIndexSignature
    input.overlayCanvas.dataset["quiltPaintedTile"] =
      paintResult.paintedCoordinate;
    input.onStateChange(currentState);
  };
  const disconnect = (): void => {
    input.overlayCanvas.removeEventListener("pointerdown", handlePointerDown);
  };

  input.overlayCanvas.addEventListener("pointerdown", handlePointerDown);

  return {
    disconnect,
    getState: () => currentState,
    handlePointerDown,
    setState: (quiltState: QuiltState): void => {
      currentState = quiltState;
      input.onStateChange(currentState);
    },
  };
};
