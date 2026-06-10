import {
  doorTileId,
  floorTileId,
  QUILT_GRID_SIZES,
  resizeTileMapData,
  wallTileId,
} from "../model/tile-map-data.ts";
import type { createQuiltController } from "../controller/quilt-controller.ts";
import { createResizeMapCommand } from "../commands/editor-command.ts";
import { executeEditorCommand } from "../state/execute-editor-command.ts";
import { handleExportClick } from "./quilt-runtime-io.ts";

type ToolbarController = ReturnType<typeof createQuiltController>;

export type CanvasToolbarElements = {
  doorToolButton: HTMLButtonElement;
  eraseToolButton: HTMLButtonElement;
  exportButton: HTMLButtonElement;
  floorToolButton: HTMLButtonElement;
  gridSizeSelect: HTMLSelectElement;
  importButton: HTMLButtonElement;
  importInput: HTMLInputElement;
  paintToolButton: HTMLButtonElement;
  wallToolButton: HTMLButtonElement;
};

const isValidGridSize = (value: number): boolean =>
  Number.isFinite(value) && QUILT_GRID_SIZES.includes(value);

const attachPaintToolListener = (
  elements: CanvasToolbarElements,
  controller: ToolbarController,
): (() => void) => {
  const handler = (): void => {
    controller.setState({
      ...controller.getState(),
      selectedTileId: wallTileId,
      selectedTool: "paint",
    });
  };
  elements.paintToolButton.addEventListener("click", handler);
  return (): void => {
    elements.paintToolButton.removeEventListener("click", handler);
  };
};

const attachEraseToolListener = (
  elements: CanvasToolbarElements,
  controller: ToolbarController,
): (() => void) => {
  const handler = (): void => {
    controller.setState({
      ...controller.getState(),
      selectedTileId: floorTileId,
      selectedTool: "erase",
    });
  };
  elements.eraseToolButton.addEventListener("click", handler);
  return (): void => {
    elements.eraseToolButton.removeEventListener("click", handler);
  };
};

const attachFloorToolListener = (
  elements: CanvasToolbarElements,
  controller: ToolbarController,
): (() => void) => {
  const handler = (): void => {
    controller.setState({
      ...controller.getState(),
      selectedTerrain: "floor",
      selectedTileId: floorTileId,
      selectedTool: "paint",
    });
  };
  elements.floorToolButton.addEventListener("click", handler);
  return (): void => {
    elements.floorToolButton.removeEventListener("click", handler);
  };
};

const attachWallToolListener = (
  elements: CanvasToolbarElements,
  controller: ToolbarController,
): (() => void) => {
  const handler = (): void => {
    controller.setState({
      ...controller.getState(),
      selectedTerrain: "wall",
      selectedTileId: wallTileId,
      selectedTool: "paint",
    });
  };

  elements.wallToolButton.addEventListener("click", handler);
  return (): void => {
    elements.wallToolButton.removeEventListener("click", handler);
  };
};

const attachDoorToolListener = (
  elements: CanvasToolbarElements,
  controller: ToolbarController,
): (() => void) => {
  const handler = (): void => {
    controller.setState({
      ...controller.getState(),
      selectedTerrain: "door",
      selectedTileId: doorTileId,
      selectedTool: "paint",
    });
  };
  elements.doorToolButton.addEventListener("click", handler);
  return (): void => {
    elements.doorToolButton.removeEventListener("click", handler);
  };
};

const attachGridSizeListener = (
  gridSizeSelect: HTMLSelectElement,
  controller: ToolbarController,
): (() => void) => {
  const handler = (): void => {
    const selectedSize = Number(gridSizeSelect.value);
    if (!isValidGridSize(selectedSize)) {
      return;
    }
    const beforeTileMapData = controller.getState().tileMapData;
    const afterTileMapData = resizeTileMapData({
      height: selectedSize,
      tileMapData: beforeTileMapData,
      width: selectedSize,
    });
    controller.setState(
      executeEditorCommand(
        controller.getState(),
        createResizeMapCommand({
          afterTileMapData,
          beforeTileMapData,
        }),
      ),
    );
  };
  gridSizeSelect.addEventListener("change", handler);
  return (): void => {
    gridSizeSelect.removeEventListener("change", handler);
  };
};

const attachExportListener = (
  exportButton: HTMLButtonElement,
  controller: ToolbarController,
): (() => void) => {
  const handler = (): void => {
    handleExportClick(controller);
  };
  exportButton.addEventListener("click", handler);
  return (): void => {
    exportButton.removeEventListener("click", handler);
  };
};

const attachImportButtonListener = (
  importButton: HTMLButtonElement,
  importInput: HTMLInputElement,
): (() => void) => {
  const handler = (): void => {
    importInput.click();
  };
  importButton.addEventListener("click", handler);
  return (): void => {
    importButton.removeEventListener("click", handler);
  };
};

const attachImportFileListener = (
  importInput: HTMLInputElement,
  onImportFileChange: (input: HTMLInputElement) => void,
): (() => void) => {
  const handler = (): void => {
    onImportFileChange(importInput);
  };
  importInput.addEventListener("change", handler);
  return (): void => {
    importInput.removeEventListener("change", handler);
  };
};

/** Attaches toolbar DOM event listeners and returns detach callbacks. */
export const attachCanvasToolListeners = (
  elements: CanvasToolbarElements,
  controller: ToolbarController,
  onImportFileChange: (importInput: HTMLInputElement) => void,
): ReadonlyArray<() => void> => [
  attachPaintToolListener(elements, controller),
  attachEraseToolListener(elements, controller),
  attachFloorToolListener(elements, controller),
  attachWallToolListener(elements, controller),
  attachDoorToolListener(elements, controller),
  attachGridSizeListener(elements.gridSizeSelect, controller),
  attachExportListener(elements.exportButton, controller),
  attachImportButtonListener(elements.importButton, elements.importInput),
  attachImportFileListener(elements.importInput, onImportFileChange),
];
