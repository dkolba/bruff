import {
  createTileMapData,
  doorTileId,
  floorTileId,
  getTile,
  setTile,
  wallTileId,
} from "../model/tile-map-data.ts";
import { describe, expect, test } from "vitest";
import { createQuiltController } from "./quilt-controller.ts";
import { createQuiltState } from "../state/quilt-state.ts";

const createPointerEvent = (): PointerEvent =>
  new PointerEvent("pointerdown", { clientX: 20, clientY: 20 });

describe("quilt controller", () => {
  test("converts pointer input into paint commands", () => {
    const overlayCanvas = document.createElement("canvas");
    const changedStates: Array<unknown> = [];
    const quiltState = createQuiltState({
      tileMapData: createTileMapData({ height: 4, width: 4 }),
    });
    const controller = createQuiltController({
      onStateChange: (changedState) => changedStates.push(changedState),
      overlayCanvas,
      quiltState,
      getTileSize: () => 16,
    });

    controller.handlePointerDown(createPointerEvent());

    expect(
      getTile(
        controller.getState().tileMapData,
        { tileX: 1, tileY: 1 },
        "terrain",
      ),
    ).toBe(wallTileId);
    expect(overlayCanvas.getAttribute("data-quilt-painted-tile")).toBe("1:1");
    expect(changedStates).toStrictEqual([controller.getState()]);
  });

  test("erases through pointer input when erase tool is selected", () => {
    const overlayCanvas = document.createElement("canvas");
    const paintedMapData = setTile({
      layerId: "terrain",
      tileCoordinate: { tileX: 1, tileY: 1 },
      tileId: wallTileId,
      tileMapData: createTileMapData({ height: 4, width: 4 }),
    });
    const quiltState = createQuiltState({
      selectedTool: "erase",
      tileMapData: paintedMapData,
    });
    const controller = createQuiltController({
      onStateChange: () => 0,
      overlayCanvas,
      quiltState,
      getTileSize: () => 16,
    });

    controller.handlePointerDown(createPointerEvent());

    expect(
      getTile(
        controller.getState().tileMapData,
        { tileX: 1, tileY: 1 },
        "terrain",
      ),
    ).toBe(floorTileId);
  });

  test("updates controlled state explicitly", () => {
    const overlayCanvas = document.createElement("canvas");
    const changedStates: Array<unknown> = [];
    const quiltState = createQuiltState({
      tileMapData: createTileMapData({ height: 4, width: 4 }),
    });
    const nextState = createQuiltState({
      selectedTool: "erase",
      tileMapData: createTileMapData({ height: 4, width: 4 }),
    });
    const controller = createQuiltController({
      onStateChange: (changedState) => changedStates.push(changedState),
      overlayCanvas,
      quiltState,
      getTileSize: () => 16,
    });

    controller.setState(nextState);

    expect(controller.getState()).toBe(nextState);
    expect(changedStates).toStrictEqual([nextState]);
  });

  test("disconnect removes pointer listener", () => {
    const overlayCanvas = document.createElement("canvas");
    const quiltState = createQuiltState({
      tileMapData: createTileMapData({ height: 4, width: 4 }),
    });
    const controller = createQuiltController({
      onStateChange: () => 0,
      overlayCanvas,
      quiltState,
      getTileSize: () => 16,
    });

    controller.disconnect();
    overlayCanvas.dispatchEvent(createPointerEvent());

    expect(controller.getState()).toBe(quiltState);
  });

  test("draws selected terrain tile when a terrain draw mode is set", () => {
    const overlayCanvas = document.createElement("canvas");
    const quiltState = createQuiltState({
      selectedTerrain: "door",
      selectedTileId: doorTileId,
      tileMapData: createTileMapData({ height: 4, width: 4 }),
    });
    const controller = createQuiltController({
      onStateChange: () => 0,
      overlayCanvas,
      quiltState,
      getTileSize: () => 16,
    });

    controller.handlePointerDown(createPointerEvent());

    expect(
      getTile(
        controller.getState().tileMapData,
        { tileX: 1, tileY: 1 },
        "terrain",
      ),
    ).toBe(doorTileId);
  });
});
