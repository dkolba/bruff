/* eslint-disable max-lines-per-function -- Controller factory keeps pointer wiring closure-local and testable. */
import { createPaintTilesCommand } from "../commands/editor-command.ts";
import { floorTileId, getTile } from "../model/tile-map-data.ts";
import { screenToTileCoordinate } from "../render/coordinates.ts";
import { executeEditorCommand } from "../state/execute-editor-command.ts";
import type { QuiltState } from "../state/quilt-state.ts";

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

/** Creates controller wiring that turns pointer input into editor commands. */
export const createQuiltController = (
  input: CreateQuiltControllerInput,
): QuiltController => {
  let currentState = input.quiltState;
  const handlePointerDown = (pointerEvent: PointerEvent): void => {
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

    currentState = executeEditorCommand(currentState, command);
    input.onStateChange(currentState);
    // eslint-disable-next-line dot-notation -- TypeScript requires bracket access for DOMStringMap with noPropertyAccessFromIndexSignature.
    input.overlayCanvas.dataset["quiltPaintedTile"] =
      `${tileCoordinate.tileX}:${tileCoordinate.tileY}`;
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
