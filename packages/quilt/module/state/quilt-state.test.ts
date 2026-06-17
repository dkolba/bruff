import { describe, expect, test } from "vitest";

import { createTileMapData, wallTileId } from "../model/tile-map-data.ts";
import { createQuiltState } from "./quilt-state.ts";

const MAP_SIZE_4 = 4;

describe("quilt state — defaults", () => {
  test("creates default editor state separate from map data", () => {
    const tileMapData = createTileMapData({
      height: MAP_SIZE_4,
      width: MAP_SIZE_4,
    });
    const quiltState = createQuiltState({ tileMapData });

    expect(quiltState).toMatchObject({
      camera: { worldX: 0, worldY: 0, zoom: 1 },
      clipboard: { type: "empty" },
      hoveredTile: { type: "none" },
      selectedLayer: "terrain",
      selectedTerrain: "floor",
      selectedTileId: wallTileId,
      selectedTool: "paint",
      selection: { type: "none" },
      terrainGlyphs: {},
      tileMapData,
      visibleErrors: [],
    });
    expect(quiltState.dirtyChunks).toStrictEqual(new Set());
    expect(quiltState.undoStack).toStrictEqual([]);
    expect(quiltState.redoStack).toStrictEqual([]);
  });
});

describe("quilt state — overrides", () => {
  test("accepts initial state overrides", () => {
    const tileMapData = createTileMapData({
      height: MAP_SIZE_4,
      width: MAP_SIZE_4,
    });
    const quiltState = createQuiltState({
      camera: { worldX: 10, worldY: 20, zoom: 2 },
      selectedTerrain: "door",
      selectedTool: "erase",
      terrainGlyphs: {
        wall: {
          advanceWidth: 700,
          bounds: { x1: 0, x2: 0, y1: 0, y2: 0 },
          path: "M0 0Z",
          terrain: "wall" as const,
          unitsPerEm: 1000,
        },
      },
      tileMapData,
      visibleErrors: [{ message: "test error" }],
    });

    expect(quiltState.camera).toStrictEqual({
      worldX: 10,
      worldY: 20,
      zoom: 2,
    });
    expect(quiltState.selectedTool).toBe("erase");
    expect(quiltState.selectedTerrain).toBe("door");
    expect(quiltState.terrainGlyphs).toStrictEqual({
      wall: {
        advanceWidth: 700,
        bounds: { x1: 0, x2: 0, y1: 0, y2: 0 },
        path: "M0 0Z",
        terrain: "wall",
        unitsPerEm: 1000,
      },
    });
    expect(quiltState.visibleErrors).toStrictEqual([{ message: "test error" }]);
  });
});
