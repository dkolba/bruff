import { describe, expect, test } from "vitest";
import { createTileMapData, wallTileId } from "../model/tile-map-data.ts";
import { createQuiltState } from "./quilt-state.ts";

describe("quilt state", () => {
  test("creates default editor state separate from map data", () => {
    const tileMapData = createTileMapData({ height: 4, width: 4 });
    const quiltState = createQuiltState({ tileMapData });

    expect(quiltState).toMatchObject({
      camera: { worldX: 0, worldY: 0, zoom: 1 },
      clipboard: { type: "empty" },
      hoveredTile: { type: "none" },
      selectedLayer: "terrain",
      selectedTileId: wallTileId,
      selectedTool: "paint",
      selection: { type: "none" },
      tileMapData,
    });
    expect(quiltState.dirtyChunks).toStrictEqual(new Set());
    expect(quiltState.undoStack).toStrictEqual([]);
    expect(quiltState.redoStack).toStrictEqual([]);
  });

  test("accepts initial state overrides", () => {
    const tileMapData = createTileMapData({ height: 4, width: 4 });
    const quiltState = createQuiltState({
      camera: { worldX: 10, worldY: 20, zoom: 2 },
      selectedTool: "erase",
      tileMapData,
    });

    expect(quiltState.camera).toStrictEqual({
      worldX: 10,
      worldY: 20,
      zoom: 2,
    });
    expect(quiltState.selectedTool).toBe("erase");
  });
});
