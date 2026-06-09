import {
  createTileMapData,
  floorTileId,
  getTile,
  setTile,
  wallTileId,
} from "../model/tile-map-data.ts";
import { describe, expect, test } from "vitest";
import { createQuiltState } from "../state/quilt-state.ts";
import { createQuiltRuntime } from "./quilt-runtime.ts";

const paintedTileCoordinate = { tileX: 1, tileY: 1 };

const createRuntimeNodes = (): Readonly<{
  eraseToolButton: HTMLButtonElement;
  overlayCanvas: HTMLCanvasElement;
  paintToolButton: HTMLButtonElement;
  terrainCanvas: HTMLCanvasElement;
}> => ({
  eraseToolButton: document.createElement("button"),
  overlayCanvas: document.createElement("canvas"),
  paintToolButton: document.createElement("button"),
  terrainCanvas: document.createElement("canvas"),
});

describe("quilt runtime", () => {
  test("creates runtime state and pointer wiring", () => {
    const runtimeNodes = createRuntimeNodes();
    const runtime = createQuiltRuntime({
      ...runtimeNodes,
      quiltState: createQuiltState({
        tileMapData: createTileMapData({ height: 4, width: 4 }),
      }),
      canvasSize: 64,
    });

    runtimeNodes.overlayCanvas.dispatchEvent(
      new PointerEvent("pointerdown", { clientX: 20, clientY: 20 }),
    );

    expect(
      getTile(runtime.getState().tileMapData, paintedTileCoordinate, "terrain"),
    ).toBe(wallTileId);
  });

  test("sizes canvases and scales map tiles to fill the square viewport", () => {
    const runtimeNodes = createRuntimeNodes();
    const runtime = createQuiltRuntime({
      ...runtimeNodes,
      canvasSize: 128,
      quiltState: createQuiltState({
        tileMapData: createTileMapData({ height: 4, width: 4 }),
      }),
    });

    runtimeNodes.overlayCanvas.dispatchEvent(
      new PointerEvent("pointerdown", { clientX: 40, clientY: 40 }),
    );

    expect(runtimeNodes.terrainCanvas.width).toBe(128);
    expect(runtimeNodes.terrainCanvas.style.width).toBe("128px");
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
      quiltState: createQuiltState({
        tileMapData: createTileMapData({ height: 4, width: 4 }),
      }),
      canvasSize: 64,
    });
    const terrainContext = runtimeNodes.terrainCanvas.getContext("2d");

    runtimeNodes.overlayCanvas.dispatchEvent(
      new PointerEvent("pointerdown", { clientX: 20, clientY: 20 }),
    );

    expect(runtime.getState().dirtyChunks).toStrictEqual(new Set(["0:0"]));
    expect(
      terrainContext === null
        ? []
        : [...terrainContext.getImageData(20, 20, 1, 1).data],
    ).toStrictEqual([17, 17, 17, 255]);
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
      quiltState: createQuiltState({ tileMapData }),
      canvasSize: 64,
    });

    runtimeNodes.eraseToolButton.click();
    runtimeNodes.overlayCanvas.dispatchEvent(
      new PointerEvent("pointerdown", { clientX: 20, clientY: 20 }),
    );

    expect(
      getTile(runtime.getState().tileMapData, paintedTileCoordinate, "terrain"),
    ).toBe(floorTileId);
  });

  test("resizes canvases after runtime creation", () => {
    const runtimeNodes = createRuntimeNodes();
    const runtime = createQuiltRuntime({
      ...runtimeNodes,
      canvasSize: 64,
      quiltState: createQuiltState({
        tileMapData: createTileMapData({ height: 4, width: 4 }),
      }),
    });

    runtime.setCanvasSize(128);

    expect(runtimeNodes.overlayCanvas.width).toBe(128);
    expect(runtimeNodes.overlayCanvas.style.height).toBe("128px");
  });

  test("selects paint tool from runtime controls", () => {
    const runtimeNodes = createRuntimeNodes();
    const runtime = createQuiltRuntime({
      ...runtimeNodes,
      quiltState: createQuiltState({
        selectedTool: "erase",
        tileMapData: createTileMapData({ height: 4, width: 4 }),
      }),
      canvasSize: 64,
    });

    runtimeNodes.paintToolButton.click();

    expect(runtime.getState().selectedTool).toBe("paint");
  });

  test("sets map data and tears down controller", () => {
    const runtimeNodes = createRuntimeNodes();
    const runtime = createQuiltRuntime({
      ...runtimeNodes,
      quiltState: createQuiltState({
        tileMapData: createTileMapData({ height: 4, width: 4 }),
      }),
      canvasSize: 64,
    });
    const tileMapData = createTileMapData({ height: 2, width: 2 });

    runtime.setMapData(tileMapData);
    runtime.disconnect();
    runtimeNodes.eraseToolButton.click();
    runtimeNodes.overlayCanvas.dispatchEvent(
      new PointerEvent("pointerdown", { clientX: 20, clientY: 20 }),
    );

    expect(runtime.getState().tileMapData).toBe(tileMapData);
  });
});
