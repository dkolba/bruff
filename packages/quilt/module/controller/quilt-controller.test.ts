import {
  createTileMapData,
  doorTileId,
  floorTileId,
  getTile,
  setTile,
  type TileId,
  wallTileId,
} from "../model/tile-map-data.ts";
import { describe, expect, test } from "vitest";
import { createQuiltController } from "./quilt-controller.ts";
import { createQuiltState } from "../state/quilt-state.ts";

const TILE_SIZE = 16;
const ZERO_SIZE = 0;
const POINTER_POSITION = 20;

const createPointerEvent = (): PointerEvent =>
  new PointerEvent("pointerdown", {
    clientX: POINTER_POSITION,
    clientY: POINTER_POSITION,
  });

const makeController = (
  overrides: {
    onStateChange?: (s: ReturnType<typeof createQuiltState>) => void;
    selectedTerrain?: "floor" | "wall" | "door";
    selectedTileId?: TileId;
    selectedTool?: "paint" | "erase";
  } = {},
): {
  controller: ReturnType<typeof createQuiltController>;
  overlayCanvas: HTMLCanvasElement;
} => {
  const overlayCanvas = document.createElement("canvas");
  const quiltState = createQuiltState({
    selectedTerrain: overrides.selectedTerrain ?? "floor",
    selectedTileId: overrides.selectedTileId ?? wallTileId,
    selectedTool: overrides.selectedTool ?? "paint",
    tileMapData: createTileMapData({ height: 4, width: 4 }),
  });

  return {
    controller: createQuiltController({
      getTileSize: () => TILE_SIZE,
      onStateChange: overrides.onStateChange ?? ((): number => ZERO_SIZE),
      overlayCanvas,
      quiltState,
    }),
    overlayCanvas,
  };
};

describe("quilt controller — pointer input to paint", () => {
  test("converts pointer input into paint commands", () => {
    const changedStates: Array<unknown> = [];
    const { controller } = makeController({
      onStateChange: (changedState) => changedStates.push(changedState),
    });

    controller.handlePointerDown(createPointerEvent());

    expect(
      getTile(
        controller.getState().tileMapData,
        { tileX: 1, tileY: 1 },
        "terrain",
      ),
    ).toBe(wallTileId);
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
      getTileSize: () => TILE_SIZE,
      onStateChange: () => ZERO_SIZE,
      overlayCanvas,
      quiltState,
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
});

describe("quilt controller — state management", () => {
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
      getTileSize: () => TILE_SIZE,
      onStateChange: (changedState) => changedStates.push(changedState),
      overlayCanvas,
      quiltState,
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
      getTileSize: () => TILE_SIZE,
      onStateChange: () => ZERO_SIZE,
      overlayCanvas,
      quiltState,
    });

    controller.disconnect();
    overlayCanvas.dispatchEvent(createPointerEvent());

    expect(controller.getState()).toBe(quiltState);
  });
});

describe("quilt controller — terrain draw modes", () => {
  test("draws selected terrain tile when a terrain draw mode is set", () => {
    const overlayCanvas = document.createElement("canvas");
    const quiltState = createQuiltState({
      selectedTerrain: "door",
      selectedTileId: doorTileId,
      tileMapData: createTileMapData({ height: 4, width: 4 }),
    });
    const controller = createQuiltController({
      getTileSize: () => TILE_SIZE,
      onStateChange: () => ZERO_SIZE,
      overlayCanvas,
      quiltState,
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
