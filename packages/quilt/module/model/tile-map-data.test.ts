import {
  chunkCoordinateKey,
  createTileMapData,
  floorTileId,
  getChunkCoordinate,
  getTile,
  setTile,
  tileCoordinateToChunkIndex,
  wallTileId,
} from "./tile-map-data.ts";
import { describe, expect, test } from "vitest";

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

describe("tile map data", () => {
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

  test("supports custom chunk sizes", () => {
    const tileMapData = createTileMapData({
      chunkSize: smallChunkSize,
      height: smallMapSize,
      width: smallMapSize,
    });

    expect(tileMapData.chunkSize).toBe(smallChunkSize);
    expect(tileMapData.chunks.size).toBe(expectedSmallChunkCount);
  });

  test("creates floor-filled map data and updates tiles immutably", () => {
    const tileMapData = createTileMapData({ height: 40, width: 40 });
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
