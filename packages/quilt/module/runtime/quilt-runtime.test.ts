import { describe, expect, test } from "vitest";

import {
  createTileMapData,
  floorTileId,
  getTile,
  setTile,
  wallTileId,
} from "../model/tile-map-data.ts";
import { createQuiltState } from "../state/quilt-state.ts";
import { adaptCanvasContext } from "./canvas-context-adapter.ts";
import { createQuiltRuntime } from "./quilt-runtime.ts";

const CANVAS_POINTER_OFFSET = 20;
const CANVAS_SIZE_64 = 64;
const CANVAS_SIZE_128 = 128;
const WALL_RGB = 17;
const OPAQUE_ALPHA = 255;
const MAP_SIZE_4 = 4;
const TILE_X_1 = 1;
const TILE_Y_1 = 1;
const PIXEL_REQUEST = 1;

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

const renderPixelColor = (
  canvas: HTMLCanvasElement | null,
  pixelX: number,
  pixelY: number,
): ReadonlyArray<number> =>
  canvas === null
    ? []
    : [
        ...(canvas
          .getContext("2d")
          ?.getImageData(pixelX, pixelY, PIXEL_REQUEST, PIXEL_REQUEST).data ??
          []),
      ];

const makeRuntime = (
  nodes: ReturnType<typeof createRuntimeNodes>,
  canvasSize: number,
): ReturnType<typeof createQuiltRuntime> =>
  createQuiltRuntime({
    ...nodes,
    canvasSize,
    quiltState: createQuiltState({
      tileMapData: createTileMapData({ height: MAP_SIZE_4, width: MAP_SIZE_4 }),
    }),
  });

describe("quilt runtime — pointer wiring", () => {
  test("creates runtime state and pointer wiring", () => {
    const runtimeNodes = createRuntimeNodes();
    const runtime = makeRuntime(runtimeNodes, CANVAS_SIZE_64);

    dispatchPointerDown(
      runtimeNodes.overlayCanvas,
      CANVAS_POINTER_OFFSET,
      CANVAS_POINTER_OFFSET,
    );

    expect(
      getTile(runtime.getState().tileMapData, paintedTileCoordinate, "terrain"),
    ).toBe(wallTileId);
  });

  test("renders terrain after pointer-driven paint", () => {
    const runtimeNodes = createRuntimeNodes();
    const runtime = makeRuntime(runtimeNodes, CANVAS_SIZE_64);

    dispatchPointerDown(
      runtimeNodes.overlayCanvas,
      CANVAS_POINTER_OFFSET,
      CANVAS_POINTER_OFFSET,
    );

    expect(runtime.getState().dirtyChunks).toStrictEqual(new Set(["0:0"]));
    expect(
      renderPixelColor(
        runtimeNodes.terrainCanvas,
        CANVAS_POINTER_OFFSET,
        CANVAS_POINTER_OFFSET,
      ),
    ).toStrictEqual([WALL_RGB, WALL_RGB, WALL_RGB, OPAQUE_ALPHA]);
  });
});

describe("quilt runtime — erase tool", () => {
  test("selects erase tool from runtime controls", () => {
    const runtimeNodes = createRuntimeNodes();
    const tileMapData = setTile({
      layerId: "terrain",
      tileCoordinate: paintedTileCoordinate,
      tileId: wallTileId,
      tileMapData: createTileMapData({ height: MAP_SIZE_4, width: MAP_SIZE_4 }),
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
});

describe("canvas context adapter", () => {
  test("delegates fillStyle getter to the native context", () => {
    const canvas = document.createElement("canvas");
    const nativeContext = canvas.getContext("2d");
    if (nativeContext === null) {
      throw new Error("Could not get 2d context");
    }
    nativeContext.fillStyle = "#ff0000";

    const adapted = adaptCanvasContext(nativeContext);

    expect(adapted.fillStyle).toBe("#ff0000");
  });
});

describe("quilt runtime — canvas sizing", () => {
  test("sizes canvases and scales map tiles to fill the square viewport", () => {
    const runtimeNodes = createRuntimeNodes();
    const runtime = makeRuntime(runtimeNodes, CANVAS_SIZE_128);

    dispatchPointerDown(
      runtimeNodes.overlayCanvas,
      CANVAS_POINTER_OFFSET * TILE_X_1 + CANVAS_POINTER_OFFSET,
      CANVAS_POINTER_OFFSET * TILE_X_1 + CANVAS_POINTER_OFFSET,
    );

    expect(runtime).toBeDefined();
    const expectedBufferSize =
      CANVAS_SIZE_128 * (globalThis.devicePixelRatio ?? TILE_X_1);
    expect(runtimeNodes.terrainCanvas.width).toBe(expectedBufferSize);
    expect(runtimeNodes.terrainCanvas.style.width).toBe(`${CANVAS_SIZE_128}px`);
  });

  test("resizes canvases after runtime creation", () => {
    const runtimeNodes = createRuntimeNodes();
    const runtime = makeRuntime(runtimeNodes, CANVAS_SIZE_64);

    runtime.setCanvasSize(CANVAS_SIZE_128);

    const resizedBufferSize =
      CANVAS_SIZE_128 * (globalThis.devicePixelRatio ?? TILE_X_1);
    expect(runtimeNodes.overlayCanvas.width).toBe(resizedBufferSize);
    expect(runtimeNodes.overlayCanvas.style.height).toBe(
      `${CANVAS_SIZE_128}px`,
    );
  });
});
