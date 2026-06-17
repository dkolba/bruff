import { isError, isOk } from "@bruff/utils";
import { describe, expect, test } from "vitest";

import {
  createTileMapData,
  doorTileId,
  getTile,
  setTile,
  wallTileId,
} from "../model/tile-map-data.ts";
import {
  parseBroughlikeMapData,
  serializeBroughlikeMapData,
} from "./broughlike-map.ts";

const doorCoordinate = { tileX: 1, tileY: 0 };
const wallCoordinate = { tileX: 0, tileY: 1 };
const MAP_SIZE_2 = 2;
const MAP_SIZE_9 = 9;

describe("broughlike map — serialization", () => {
  test("serializes terrain through the shared broughlike map shape", () => {
    const tileMapData = setTile({
      layerId: "terrain",
      tileCoordinate: wallCoordinate,
      tileId: wallTileId,
      tileMapData: setTile({
        layerId: "terrain",
        tileCoordinate: doorCoordinate,
        tileId: doorTileId,
        tileMapData: createTileMapData({
          height: MAP_SIZE_2,
          width: MAP_SIZE_2,
        }),
      }),
    });

    expect(serializeBroughlikeMapData(tileMapData)).toStrictEqual({
      height: MAP_SIZE_2,
      rows: [
        ["floor", "door"],
        ["wall", "floor"],
      ],
      version: 1,
      width: MAP_SIZE_2,
    });
  });

  test("exports deterministic JSON that wraps terrain with shared BroughlikeMap shape", () => {
    const tileMapData = createTileMapData({
      height: MAP_SIZE_9,
      width: MAP_SIZE_9,
    });
    const serialized = serializeBroughlikeMapData(tileMapData);

    expect(JSON.stringify(serialized)).toStrictEqual(
      JSON.stringify({
        height: MAP_SIZE_9,
        rows: Array.from({ length: MAP_SIZE_9 }, () =>
          Array.from({ length: MAP_SIZE_9 }, () => "floor"),
        ),
        version: 1,
        width: MAP_SIZE_9,
      }),
    );
  });
});

describe("broughlike map — parsing", () => {
  test("parses valid broughlike map data into tile map data", () => {
    const parsed = parseBroughlikeMapData({
      height: MAP_SIZE_2,
      rows: [
        ["floor", "door"],
        ["wall", "floor"],
      ],
      version: 1,
      width: MAP_SIZE_2,
    });

    expect(isOk(parsed)).toBe(true);
    if (isOk(parsed)) {
      expect(getTile(parsed.value, doorCoordinate, "terrain")).toBe(doorTileId);
      expect(getTile(parsed.value, wallCoordinate, "terrain")).toBe(wallTileId);
    }
  });

  test("returns typed errors for invalid input", () => {
    const parsed = parseBroughlikeMapData({ version: 1 });

    expect(isError(parsed)).toBe(true);
    if (isError(parsed)) {
      expect(parsed.error.reason).toBe("INVALID_BROUGHLIKE_MAP_DATA");
    }
  });
});
