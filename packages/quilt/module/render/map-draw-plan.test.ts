import { describe, expect, test } from "vitest";

import {
  createTileMapData,
  doorTileId,
  setTile,
  wallTileId,
} from "../model/tile-map-data.ts";
import {
  createQuiltState,
  type QuiltTerrainGlyphMap,
} from "../state/quilt-state.ts";
import {
  createOverlayDrawPlan,
  createTerrainDrawPlan,
} from "./map-draw-plan.ts";

const TILE_SIZE = 16;
const CHUNK_TILE_COUNT = 256;
const CHUNK_PIXEL_OFFSET = 512;
const MAP_SIZE_40 = 40;
const SMALL_MAP = 4;
const TINY_MAP = 2;
const GRID_PIXEL_64 = 64;
const HOVER_X_OFFSET = 1;
const HOVER_Y_OFFSET = 2;
const ORIGIN = 0;

describe("map draw plan — dirty chunk projection", () => {
  test("projects dirty chunks into tile-level terrain draw commands", () => {
    const tileMapData = createTileMapData({
      height: MAP_SIZE_40,
      width: MAP_SIZE_40,
    });
    const quiltState = createQuiltState({
      dirtyChunks: new Set(["1:0"]),
      tileMapData,
    });
    const terrainDrawPlan = createTerrainDrawPlan({
      quiltState,
      tileSize: TILE_SIZE,
    });

    expect(terrainDrawPlan.kind).toBe("terrain");
    expect(terrainDrawPlan.commands).toHaveLength(CHUNK_TILE_COUNT);
    expect(terrainDrawPlan.commands.at(ORIGIN)).toStrictEqual({
      fillStyle: "#d7d0bf",
      kind: "drawTerrainTile",
      pixelHeight: TILE_SIZE,
      pixelWidth: TILE_SIZE,
      pixelX: CHUNK_PIXEL_OFFSET,
      pixelY: ORIGIN,
    });
  });

  test("falls back to origin for malformed dirty chunk keys", () => {
    const tileMapData = createTileMapData({
      height: SMALL_MAP,
      width: SMALL_MAP,
    });
    const quiltState = createQuiltState({
      dirtyChunks: new Set(["bad"]),
      tileMapData,
    });
    expect(
      createTerrainDrawPlan({ quiltState, tileSize: TILE_SIZE }).commands.at(
        ORIGIN,
      ),
    ).toStrictEqual({
      fillStyle: "#d7d0bf",
      kind: "drawTerrainTile",
      pixelHeight: TILE_SIZE,
      pixelWidth: TILE_SIZE,
      pixelX: ORIGIN,
      pixelY: ORIGIN,
    });
  });
});

describe("map draw plan — initial terrain projection", () => {
  test("projects initial terrain when no chunks are dirty", () => {
    const tileMapData = setTile({
      layerId: "terrain",
      tileCoordinate: { tileX: 0, tileY: 1 },
      tileId: doorTileId,
      tileMapData: setTile({
        layerId: "terrain",
        tileCoordinate: { tileX: 1, tileY: 1 },
        tileId: wallTileId,
        tileMapData: createTileMapData({ height: TINY_MAP, width: TINY_MAP }),
      }),
    });
    const quiltState = createQuiltState({ tileMapData });

    expect(
      createTerrainDrawPlan({ quiltState, tileSize: TILE_SIZE }).commands,
    ).toContainEqual({
      fillStyle: "#111111",
      kind: "drawTerrainTile",
      pixelHeight: TILE_SIZE,
      pixelWidth: TILE_SIZE,
      pixelX: TILE_SIZE,
      pixelY: TILE_SIZE,
    });
    expect(
      createTerrainDrawPlan({ quiltState, tileSize: TILE_SIZE }).commands,
    ).toContainEqual({
      fillStyle: "#8b5a2b",
      kind: "drawTerrainTile",
      pixelHeight: TILE_SIZE,
      pixelWidth: TILE_SIZE,
      pixelX: ORIGIN,
      pixelY: TILE_SIZE,
    });
  });
});

describe("map draw plan — overlay draw plans", () => {
  test("projects hover and grid overlay draw commands", () => {
    const tileMapData = createTileMapData({
      height: SMALL_MAP,
      width: SMALL_MAP,
    });
    const quiltState = createQuiltState({
      hoveredTile: {
        tileCoordinate: { tileX: HOVER_X_OFFSET, tileY: HOVER_Y_OFFSET },
        type: "some",
      },
      tileMapData,
    });
    expect(
      createOverlayDrawPlan({ quiltState, tileSize: TILE_SIZE }),
    ).toStrictEqual({
      commands: [
        {
          kind: "drawGrid",
          pixelHeight: GRID_PIXEL_64,
          pixelWidth: GRID_PIXEL_64,
        },
        {
          kind: "drawHoverTile",
          pixelHeight: TILE_SIZE,
          pixelWidth: TILE_SIZE,
          pixelX: TILE_SIZE,
          pixelY: TILE_SIZE * HOVER_Y_OFFSET,
        },
      ],
      kind: "overlay",
    });
  });

  test("omits hover command when no tile is hovered", () => {
    const quiltState = createQuiltState({
      tileMapData: createTileMapData({ height: SMALL_MAP, width: SMALL_MAP }),
    });

    expect(
      createOverlayDrawPlan({ quiltState, tileSize: TILE_SIZE }).commands,
    ).toStrictEqual([
      {
        kind: "drawGrid",
        pixelHeight: GRID_PIXEL_64,
        pixelWidth: GRID_PIXEL_64,
      },
    ]);
  });
});

describe("map draw plan — glyph projection", () => {
  test("projects glyph path draw commands when terrain glyphs are imported", () => {
    const terrainGlyphs: QuiltTerrainGlyphMap = {
      wall: {
        advanceWidth: 700,
        bounds: { x1: 10, x2: 690, y1: 20, y2: 720 },
        path: "M0 0L1 1Z",
        terrain: "wall",
        unitsPerEm: 1000,
      },
    };
    const tileMapData = setTile({
      layerId: "terrain",
      tileCoordinate: { tileX: ORIGIN, tileY: ORIGIN },
      tileId: wallTileId,
      tileMapData: createTileMapData({ height: SMALL_MAP, width: SMALL_MAP }),
    });
    const quiltState = createQuiltState({ terrainGlyphs, tileMapData });
    const drawPlan = createTerrainDrawPlan({ quiltState, tileSize: TILE_SIZE });
    expect(drawPlan.commands).toContainEqual({
      glyphBounds: { x1: 10, x2: 690, y1: 20, y2: 720 },
      kind: "drawTerrainGlyph",
      path: "M0 0L1 1Z",
      pixelHeight: TILE_SIZE,
      pixelWidth: TILE_SIZE,
      pixelX: ORIGIN,
      pixelY: ORIGIN,
      tileBounds: { highX: 1, highY: 1, lowX: 0, lowY: 0 },
      unitsPerEm: 1000,
    });
  });
});

describe("map draw plan — fill fallback", () => {
  test("emits fill command when no glyph is available for a terrain type", () => {
    const tileMapData = setTile({
      layerId: "terrain",
      tileCoordinate: { tileX: ORIGIN, tileY: ORIGIN },
      tileId: wallTileId,
      tileMapData: createTileMapData({ height: TINY_MAP, width: TINY_MAP }),
    });
    const quiltState = createQuiltState({ terrainGlyphs: {}, tileMapData });
    const drawPlan = createTerrainDrawPlan({ quiltState, tileSize: TILE_SIZE });
    expect(drawPlan.commands).toContainEqual({
      fillStyle: "#111111",
      kind: "drawTerrainTile",
      pixelHeight: TILE_SIZE,
      pixelWidth: TILE_SIZE,
      pixelX: ORIGIN,
      pixelY: ORIGIN,
    });
  });
});
