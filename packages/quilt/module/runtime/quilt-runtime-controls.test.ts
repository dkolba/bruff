import { describe, expect, test } from "vitest";

import {
  createTileMapData,
  doorTileId,
  floorTileId,
  getTile,
  wallTileId,
} from "../model/tile-map-data.ts";
import { createQuiltState } from "../state/quilt-state.ts";
import { createQuiltRuntime } from "./quilt-runtime.ts";

const CANVAS_POINTER_OFFSET = 20;
const CANVAS_SIZE_64 = 64;
const MAP_SIZE_2 = 2;
const MAP_SIZE_4 = 4;
const MAP_SIZE_9 = 9;
const TILE_X_1 = 1;
const TILE_Y_1 = 1;

const paintedTileCoordinate = { tileX: TILE_X_1, tileY: TILE_Y_1 };

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

const makeRuntime = (
  nodes: ReturnType<typeof createRuntimeNodes>,
  overrides?: Partial<ReturnType<typeof createQuiltState>>,
): ReturnType<typeof createQuiltRuntime> =>
  createQuiltRuntime({
    ...nodes,
    canvasSize: CANVAS_SIZE_64,
    quiltState: createQuiltState({
      tileMapData: createTileMapData({ height: MAP_SIZE_4, width: MAP_SIZE_4 }),
      ...overrides,
    }),
  });

const assertTerrain = (
  runtime: ReturnType<typeof createQuiltRuntime>,
  expectedTerrain: string,
  expectedTileId: number,
): void => {
  expect(runtime.getState().selectedTerrain).toBe(expectedTerrain);
  expect(runtime.getState().selectedTileId).toBe(expectedTileId);
};

describe("quilt runtime — paint/erase tool selection", () => {
  test("selects paint tool from runtime controls", () => {
    const runtimeNodes = createRuntimeNodes();
    const runtime = makeRuntime(runtimeNodes, { selectedTool: "erase" });

    runtimeNodes.paintToolButton.click();

    expect(runtime.getState().selectedTool).toBe("paint");
  });
});

describe("quilt runtime — terrain draw buttons", () => {
  test("selects terrain draw mode from terrain buttons", () => {
    const runtimeNodes = createRuntimeNodes();
    const runtime = makeRuntime(runtimeNodes);

    runtimeNodes.wallToolButton.click();
    assertTerrain(runtime, "wall", wallTileId);

    runtimeNodes.doorToolButton.click();
    assertTerrain(runtime, "door", doorTileId);

    runtimeNodes.floorToolButton.click();
    assertTerrain(runtime, "floor", floorTileId);
  });

  test("draws selected terrain when pointer clicks after terrain button", () => {
    const runtimeNodes = createRuntimeNodes();
    const runtime = makeRuntime(runtimeNodes);

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
});

describe("quilt runtime — grid resize", () => {
  test("resizes map from grid-size select", () => {
    const runtimeNodes = createRuntimeNodes();
    const gridSizeOption = document.createElement("option");
    gridSizeOption.value = String(MAP_SIZE_9);
    runtimeNodes.gridSizeSelect.append(gridSizeOption);
    runtimeNodes.gridSizeSelect.value = String(MAP_SIZE_9);
    const runtime = makeRuntime(runtimeNodes);

    runtimeNodes.gridSizeSelect.dispatchEvent(new Event("change"));

    expect(runtime.getState().tileMapData.width).toBe(MAP_SIZE_9);
    expect(runtime.getState().tileMapData.height).toBe(MAP_SIZE_9);
  });

  test("ignores invalid grid size values", () => {
    const runtimeNodes = createRuntimeNodes();
    runtimeNodes.gridSizeSelect.value = "invalid";
    const tileMapData = createTileMapData({
      height: MAP_SIZE_4,
      width: MAP_SIZE_4,
    });
    const runtime = createQuiltRuntime({
      ...runtimeNodes,
      canvasSize: CANVAS_SIZE_64,
      quiltState: createQuiltState({ tileMapData }),
    });

    runtimeNodes.gridSizeSelect.dispatchEvent(new Event("change"));

    expect(runtime.getState().tileMapData.width).toBe(MAP_SIZE_4);
    expect(runtime.getState().tileMapData.height).toBe(MAP_SIZE_4);
  });
});

describe("quilt runtime — lifecycle", () => {
  test("sets map data and tears down controller", () => {
    const runtimeNodes = createRuntimeNodes();
    const runtime = makeRuntime(runtimeNodes);
    const tileMapData = createTileMapData({
      height: MAP_SIZE_2,
      width: MAP_SIZE_2,
    });

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
});
