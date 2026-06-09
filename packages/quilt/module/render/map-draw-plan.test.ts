import {
  createOverlayDrawPlan,
  createTerrainDrawPlan,
} from "./map-draw-plan.ts";
import {
  createTileMapData,
  doorTileId,
  setTile,
  wallTileId,
} from "../model/tile-map-data.ts";
import { describe, expect, test } from "vitest";
import { createQuiltState } from "../state/quilt-state.ts";

const tileSize = 16;

describe("map draw plan", () => {
  test("projects dirty chunks into tile-level terrain draw commands", () => {
    const tileMapData = createTileMapData({ height: 40, width: 40 });
    const quiltState = createQuiltState({
      dirtyChunks: new Set(["1:0"]),
      tileMapData,
    });
    const terrainDrawPlan = createTerrainDrawPlan({ quiltState, tileSize });

    expect(terrainDrawPlan.kind).toBe("terrain");
    expect(terrainDrawPlan.commands).toHaveLength(256);
    expect(terrainDrawPlan.commands.at(0)).toStrictEqual({
      fillStyle: "#d7d0bf",
      height: 16,
      kind: "drawTerrainTile",
      width: 16,
      x: 512,
      y: 0,
    });
  });

  test("projects initial terrain when no chunks are dirty", () => {
    const tileMapData = setTile({
      layerId: "terrain",
      tileCoordinate: { tileX: 0, tileY: 1 },
      tileId: doorTileId,
      tileMapData: setTile({
        layerId: "terrain",
        tileCoordinate: { tileX: 1, tileY: 1 },
        tileId: wallTileId,
        tileMapData: createTileMapData({ height: 2, width: 2 }),
      }),
    });
    const quiltState = createQuiltState({ tileMapData });

    expect(
      createTerrainDrawPlan({ quiltState, tileSize }).commands,
    ).toContainEqual({
      fillStyle: "#111111",
      height: 16,
      kind: "drawTerrainTile",
      width: 16,
      x: 16,
      y: 16,
    });
    expect(
      createTerrainDrawPlan({ quiltState, tileSize }).commands,
    ).toContainEqual({
      fillStyle: "#8b5a2b",
      height: 16,
      kind: "drawTerrainTile",
      width: 16,
      x: 0,
      y: 16,
    });
  });

  test("falls back to origin for malformed dirty chunk keys", () => {
    const tileMapData = createTileMapData({ height: 4, width: 4 });
    const quiltState = createQuiltState({
      dirtyChunks: new Set(["bad"]),
      tileMapData,
    });

    expect(
      createTerrainDrawPlan({ quiltState, tileSize }).commands.at(0),
    ).toStrictEqual({
      fillStyle: "#d7d0bf",
      height: 16,
      kind: "drawTerrainTile",
      width: 16,
      x: 0,
      y: 0,
    });
  });

  test("projects hover and grid overlay draw commands", () => {
    const tileMapData = createTileMapData({ height: 4, width: 4 });
    const quiltState = createQuiltState({
      hoveredTile: { tileCoordinate: { tileX: 1, tileY: 2 }, type: "some" },
      tileMapData,
    });

    expect(createOverlayDrawPlan({ quiltState, tileSize })).toStrictEqual({
      commands: [
        { height: 64, kind: "drawGrid", width: 64 },
        { height: 16, kind: "drawHoverTile", width: 16, x: 16, y: 32 },
      ],
      kind: "overlay",
    });
  });

  test("omits hover command when no tile is hovered", () => {
    const quiltState = createQuiltState({
      tileMapData: createTileMapData({ height: 4, width: 4 }),
    });

    expect(
      createOverlayDrawPlan({ quiltState, tileSize }).commands,
    ).toStrictEqual([{ height: 64, kind: "drawGrid", width: 64 }]);
  });
});
