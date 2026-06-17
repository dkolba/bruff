import { describe, expect, test } from "vitest";

import {
  chunkCoordinateKey,
  createTileMapData,
  doorTileId,
  floorTileId,
  getChunkCoordinate,
  getTile,
  QUILT_GRID_SIZES,
  resizeTileMapData,
  setTile,
  tileCoordinateToChunkIndex,
  wallTileId,
} from "./tile-map-data.ts";

const defaultChunkSize = 32;
const nextChunkTileX = 33;
const thirdChunkTileY = 65;
const expectedChunkLocalIndex = 33;
const smallMapSize = 4;
const smallChunkSize = 2;
const expectedSmallChunkCount = 4;
const changedTileCoordinate = { tileX: 33, tileY: 2 };
const objectTileCoordinate = { tileX: 1, tileY: 1 };
const missingTileCoordinate = { tileX: 99, tileY: 99 };
const mediumMapSize = 40;
const largeMapSize = 9;
const firstGridSize = 4;
const secondGridSize = 5;
const thirdGridSize = 6;
const fourthGridSize = 7;
const fifthGridSize = 8;
const lastGridSize = 9;

describe("tile map data — chunk coordinates", () => {
  test("maps tile coordinates to deterministic chunk coordinates", () => {
    expect(
      getChunkCoordinate(
        { tileX: nextChunkTileX, tileY: thirdChunkTileY },
        defaultChunkSize,
      ),
    ).toStrictEqual({ chunkX: 1, chunkY: 2 });
  });

  test("derives stable chunk keys", () => {
    expect(chunkCoordinateKey({ chunkX: 3, chunkY: 4 })).toBe("3:4");
  });

  test("maps tile coordinates to chunk-local typed array indexes", () => {
    expect(
      tileCoordinateToChunkIndex(
        { tileX: nextChunkTileX, tileY: thirdChunkTileY },
        defaultChunkSize,
      ),
    ).toBe(expectedChunkLocalIndex);
  });
});

describe("tile map data — chunk size configuration", () => {
  test("supports custom chunk sizes", () => {
    const tileMapData = createTileMapData({
      chunkSize: smallChunkSize,
      height: smallMapSize,
      width: smallMapSize,
    });

    expect(tileMapData.chunkSize).toBe(smallChunkSize);
    expect(tileMapData.chunks.size).toBe(expectedSmallChunkCount);
  });
});

describe("tile map data — creation and immutable updates", () => {
  test("creates floor-filled map data and updates tiles immutably", () => {
    const tileMapData = createTileMapData({
      height: mediumMapSize,
      width: mediumMapSize,
    });
    const nextTileMapData = setTile({
      layerId: "terrain",
      tileCoordinate: changedTileCoordinate,
      tileId: wallTileId,
      tileMapData,
    });

    expect(getTile(tileMapData, changedTileCoordinate, "terrain")).toBe(
      floorTileId,
    );
    expect(getTile(nextTileMapData, changedTileCoordinate, "terrain")).toBe(
      wallTileId,
    );
    expect(nextTileMapData.chunks.get("1:0")).not.toBe(
      tileMapData.chunks.get("1:0"),
    );
    expect(nextTileMapData.chunks.get("0:0")).toBe(
      tileMapData.chunks.get("0:0"),
    );
  });

  test("reads missing chunks as floor-filled chunks", () => {
    const tileMapData = createTileMapData({ height: 1, width: 1 });

    expect(getTile(tileMapData, missingTileCoordinate, "terrain")).toBe(
      floorTileId,
    );
  });
});

describe("tile map data — grid sizes", () => {
  test("exports supported grid sizes for Quilt controls", () => {
    expect(QUILT_GRID_SIZES).toStrictEqual([
      firstGridSize,
      secondGridSize,
      thirdGridSize,
      fourthGridSize,
      fifthGridSize,
      lastGridSize,
    ]);
  });
});

describe("tile map data — resize larger", () => {
  test("resizes larger maps while preserving terrain coordinates", () => {
    const tileMapData = setTile({
      layerId: "terrain",
      tileCoordinate: { tileX: 3, tileY: 3 },
      tileId: wallTileId,
      tileMapData: createTileMapData({
        height: smallMapSize,
        width: smallMapSize,
      }),
    });
    const nextTileMapData = resizeTileMapData({
      height: largeMapSize,
      tileMapData,
      width: largeMapSize,
    });

    expect(getTile(nextTileMapData, { tileX: 3, tileY: 3 }, "terrain")).toBe(
      wallTileId,
    );
    expect(getTile(nextTileMapData, { tileX: 8, tileY: 8 }, "terrain")).toBe(
      floorTileId,
    );
  });
});

describe("tile map data — resize smaller", () => {
  test("resizes smaller maps while discarding out-of-bounds terrain", () => {
    const tileMapData = setTile({
      layerId: "terrain",
      tileCoordinate: { tileX: 8, tileY: 8 },
      tileId: doorTileId,
      tileMapData: setTile({
        layerId: "terrain",
        tileCoordinate: { tileX: 3, tileY: 3 },
        tileId: wallTileId,
        tileMapData: createTileMapData({
          height: largeMapSize,
          width: largeMapSize,
        }),
      }),
    });
    const nextTileMapData = resizeTileMapData({
      height: smallMapSize,
      tileMapData,
      width: smallMapSize,
    });

    expect(nextTileMapData.width).toBe(smallMapSize);
    expect(nextTileMapData.height).toBe(smallMapSize);
    expect(getTile(nextTileMapData, { tileX: 3, tileY: 3 }, "terrain")).toBe(
      wallTileId,
    );
    expect(getTile(nextTileMapData, { tileX: 8, tileY: 8 }, "terrain")).toBe(
      floorTileId,
    );
  });
});

describe("tile map data — layer isolation", () => {
  test("updates object and flag layers independently", () => {
    const tileMapData = createTileMapData({
      height: smallMapSize,
      width: smallMapSize,
    });
    const objectMapData = setTile({
      layerId: "object",
      tileCoordinate: objectTileCoordinate,
      tileId: wallTileId,
      tileMapData,
    });
    const flagsMapData = setTile({
      layerId: "flags",
      tileCoordinate: objectTileCoordinate,
      tileId: wallTileId,
      tileMapData: objectMapData,
    });

    expect(getTile(flagsMapData, objectTileCoordinate, "object")).toBe(
      wallTileId,
    );
    expect(getTile(flagsMapData, objectTileCoordinate, "flags")).toBe(
      wallTileId,
    );
    expect(getTile(flagsMapData, objectTileCoordinate, "terrain")).toBe(
      floorTileId,
    );
  });
});
