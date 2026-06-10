import {
  createTileMapData,
  doorTileId,
  floorTileId,
  getTile,
  setTile,
  wallTileId,
} from "../model/tile-map-data.ts";
import { describe, expect, test } from "vitest";
import { createQuiltRuntime } from "./quilt-runtime.ts";
import { createQuiltState } from "../state/quilt-state.ts";

const CANVAS_POINTER_OFFSET = 20;
const CANVAS_SIZE_64 = 64;
const CANVAS_SIZE_128 = 128;
const WALL_RGB = 17;
const OPAQUE_ALPHA = 255;

const paintedTileCoordinate = { tileX: 1, tileY: 1 };

const createRuntimeNodes = (): Readonly<{
  doorToolButton: HTMLButtonElement;
  eraseToolButton: HTMLButtonElement;
  errorRegion: HTMLDivElement;
  exportButton: HTMLButtonElement;
  floorToolButton: HTMLButtonElement;
  gridSizeSelect: HTMLSelectElement;
  importButton: HTMLButtonElement;
  importInput: HTMLInputElement;
  overlayCanvas: HTMLCanvasElement;
  paintToolButton: HTMLButtonElement;
  terrainCanvas: HTMLCanvasElement;
  wallToolButton: HTMLButtonElement;
}> => ({
  doorToolButton: document.createElement("button"),
  eraseToolButton: document.createElement("button"),
  errorRegion: document.createElement("div"),
  exportButton: document.createElement("button"),
  floorToolButton: document.createElement("button"),
  gridSizeSelect: document.createElement("select"),
  importButton: document.createElement("button"),
  importInput: document.createElement("input"),
  overlayCanvas: document.createElement("canvas"),
  paintToolButton: document.createElement("button"),
  terrainCanvas: document.createElement("canvas"),
  wallToolButton: document.createElement("button"),
});

const dispatchPointerDown = (
  overlayCanvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
): void => {
  overlayCanvas.dispatchEvent(
    new PointerEvent("pointerdown", { clientX, clientY }),
  );
};

describe("quilt runtime", () => {
  test("creates runtime state and pointer wiring", () => {
    const runtimeNodes = createRuntimeNodes();
    const runtime = createQuiltRuntime({
      ...runtimeNodes,
      canvasSize: CANVAS_SIZE_64,
      quiltState: createQuiltState({
        tileMapData: createTileMapData({ height: 4, width: 4 }),
      }),
    });

    dispatchPointerDown(
      runtimeNodes.overlayCanvas,
      CANVAS_POINTER_OFFSET,
      CANVAS_POINTER_OFFSET,
    );

    expect(
      getTile(runtime.getState().tileMapData, paintedTileCoordinate, "terrain"),
    ).toBe(wallTileId);
  });

  test("sizes canvases and scales map tiles to fill the square viewport", () => {
    const runtimeNodes = createRuntimeNodes();
    const runtime = createQuiltRuntime({
      ...runtimeNodes,
      canvasSize: CANVAS_SIZE_128,
      quiltState: createQuiltState({
        tileMapData: createTileMapData({ height: 4, width: 4 }),
      }),
    });

    dispatchPointerDown(runtimeNodes.overlayCanvas, 40, 40);

    const expectedBufferSize =
      CANVAS_SIZE_128 * (globalThis.devicePixelRatio ?? 1);
    expect(runtimeNodes.terrainCanvas.width).toBe(expectedBufferSize);
    expect(runtimeNodes.terrainCanvas.style.width).toBe(`${CANVAS_SIZE_128}px`);
    expect(
      getTile(
        runtime.getState().tileMapData,
        { tileX: 1, tileY: 1 },
        "terrain",
      ),
    ).toBe(wallTileId);
  });

  test("renders terrain after pointer-driven paint", () => {
    const runtimeNodes = createRuntimeNodes();
    const runtime = createQuiltRuntime({
      ...runtimeNodes,
      canvasSize: CANVAS_SIZE_64,
      quiltState: createQuiltState({
        tileMapData: createTileMapData({ height: 4, width: 4 }),
      }),
    });
    const terrainContext = runtimeNodes.terrainCanvas.getContext("2d");

    dispatchPointerDown(
      runtimeNodes.overlayCanvas,
      CANVAS_POINTER_OFFSET,
      CANVAS_POINTER_OFFSET,
    );

    expect(runtime.getState().dirtyChunks).toStrictEqual(new Set(["0:0"]));
    expect(
      terrainContext === null
        ? []
        : [
            ...terrainContext.getImageData(
              CANVAS_POINTER_OFFSET,
              CANVAS_POINTER_OFFSET,
              1,
              1,
            ).data,
          ],
    ).toStrictEqual([WALL_RGB, WALL_RGB, WALL_RGB, OPAQUE_ALPHA]);
  });

  test("selects erase tool from runtime controls", () => {
    const runtimeNodes = createRuntimeNodes();
    const tileMapData = setTile({
      layerId: "terrain",
      tileCoordinate: paintedTileCoordinate,
      tileId: wallTileId,
      tileMapData: createTileMapData({ height: 4, width: 4 }),
    });
    const runtime = createQuiltRuntime({
      ...runtimeNodes,
      canvasSize: CANVAS_SIZE_64,
      quiltState: createQuiltState({ tileMapData }),
    });

    runtimeNodes.eraseToolButton.click();
    dispatchPointerDown(
      runtimeNodes.overlayCanvas,
      CANVAS_POINTER_OFFSET,
      CANVAS_POINTER_OFFSET,
    );

    expect(
      getTile(runtime.getState().tileMapData, paintedTileCoordinate, "terrain"),
    ).toBe(floorTileId);
  });

  test("resizes canvases after runtime creation", () => {
    const runtimeNodes = createRuntimeNodes();
    const runtime = createQuiltRuntime({
      ...runtimeNodes,
      canvasSize: CANVAS_SIZE_64,
      quiltState: createQuiltState({
        tileMapData: createTileMapData({ height: 4, width: 4 }),
      }),
    });

    runtime.setCanvasSize(CANVAS_SIZE_128);

    const resizedBufferSize =
      CANVAS_SIZE_128 * (globalThis.devicePixelRatio ?? 1);
    expect(runtimeNodes.overlayCanvas.width).toBe(resizedBufferSize);
    expect(runtimeNodes.overlayCanvas.style.height).toBe(
      `${CANVAS_SIZE_128}px`,
    );
  });

  test("selects paint tool from runtime controls", () => {
    const runtimeNodes = createRuntimeNodes();
    const runtime = createQuiltRuntime({
      ...runtimeNodes,
      canvasSize: CANVAS_SIZE_64,
      quiltState: createQuiltState({
        selectedTool: "erase",
        tileMapData: createTileMapData({ height: 4, width: 4 }),
      }),
    });

    runtimeNodes.paintToolButton.click();

    expect(runtime.getState().selectedTool).toBe("paint");
  });

  test("selects terrain draw mode from terrain buttons", () => {
    const runtimeNodes = createRuntimeNodes();
    const runtime = createQuiltRuntime({
      ...runtimeNodes,
      canvasSize: CANVAS_SIZE_64,
      quiltState: createQuiltState({
        tileMapData: createTileMapData({ height: 4, width: 4 }),
      }),
    });

    runtimeNodes.wallToolButton.click();
    expect(runtime.getState().selectedTerrain).toBe("wall");
    expect(runtime.getState().selectedTileId).toBe(wallTileId);

    runtimeNodes.doorToolButton.click();
    expect(runtime.getState().selectedTerrain).toBe("door");
    expect(runtime.getState().selectedTileId).toBe(doorTileId);

    runtimeNodes.floorToolButton.click();
    expect(runtime.getState().selectedTerrain).toBe("floor");
    expect(runtime.getState().selectedTileId).toBe(floorTileId);
  });

  test("draws selected terrain when pointer clicks after terrain button", () => {
    const runtimeNodes = createRuntimeNodes();
    const runtime = createQuiltRuntime({
      ...runtimeNodes,
      canvasSize: CANVAS_SIZE_64,
      quiltState: createQuiltState({
        tileMapData: createTileMapData({ height: 4, width: 4 }),
      }),
    });

    runtimeNodes.doorToolButton.click();
    dispatchPointerDown(
      runtimeNodes.overlayCanvas,
      CANVAS_POINTER_OFFSET,
      CANVAS_POINTER_OFFSET,
    );

    expect(
      getTile(runtime.getState().tileMapData, paintedTileCoordinate, "terrain"),
    ).toBe(doorTileId);
  });

  test("resizes map from grid-size select", () => {
    const runtimeNodes = createRuntimeNodes();
    const gridSizeOption = document.createElement("option");
    gridSizeOption.value = "9";
    runtimeNodes.gridSizeSelect.append(gridSizeOption);
    runtimeNodes.gridSizeSelect.value = "9";

    const runtime = createQuiltRuntime({
      ...runtimeNodes,
      canvasSize: CANVAS_SIZE_64,
      quiltState: createQuiltState({
        tileMapData: createTileMapData({ height: 4, width: 4 }),
      }),
    });

    runtimeNodes.gridSizeSelect.dispatchEvent(new Event("change"));

    expect(runtime.getState().tileMapData.width).toBe(9);
    expect(runtime.getState().tileMapData.height).toBe(9);
  });

  test("sets map data and tears down controller", () => {
    const runtimeNodes = createRuntimeNodes();
    const runtime = createQuiltRuntime({
      ...runtimeNodes,
      canvasSize: CANVAS_SIZE_64,
      quiltState: createQuiltState({
        tileMapData: createTileMapData({ height: 4, width: 4 }),
      }),
    });
    const tileMapData = createTileMapData({ height: 2, width: 2 });

    runtime.setMapData(tileMapData);
    runtime.disconnect();
    runtimeNodes.eraseToolButton.click();
    dispatchPointerDown(
      runtimeNodes.overlayCanvas,
      CANVAS_POINTER_OFFSET,
      CANVAS_POINTER_OFFSET,
    );

    expect(runtime.getState().tileMapData).toBe(tileMapData);
  });

  test("ignores invalid grid size values", () => {
    const runtimeNodes = createRuntimeNodes();
    runtimeNodes.gridSizeSelect.value = "invalid";

    const tileMapData = createTileMapData({ height: 4, width: 4 });
    const runtime = createQuiltRuntime({
      ...runtimeNodes,
      canvasSize: CANVAS_SIZE_64,
      quiltState: createQuiltState({ tileMapData }),
    });

    runtimeNodes.gridSizeSelect.dispatchEvent(new Event("change"));

    expect(runtime.getState().tileMapData.width).toBe(4);
    expect(runtime.getState().tileMapData.height).toBe(4);
  });
});
