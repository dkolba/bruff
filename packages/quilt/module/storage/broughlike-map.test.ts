import { describe, expect, test } from "vitest";
import { isError, isOk } from "@bruff/utils";
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

describe("broughlike map storage", () => {
  test("serializes terrain through the shared broughlike map shape", () => {
    const tileMapData = setTile({
      layerId: "terrain",
      tileCoordinate: wallCoordinate,
      tileId: wallTileId,
      tileMapData: setTile({
        layerId: "terrain",
        tileCoordinate: doorCoordinate,
        tileId: doorTileId,
        tileMapData: createTileMapData({ height: 2, width: 2 }),
      }),
    });

    expect(serializeBroughlikeMapData(tileMapData)).toStrictEqual({
      height: 2,
      rows: [
        ["floor", "door"],
        ["wall", "floor"],
      ],
      version: 1,
      width: 2,
    });
  });

  test("parses valid broughlike map data into tile map data", () => {
    const parsed = parseBroughlikeMapData({
      height: 2,
      rows: [
        ["floor", "door"],
        ["wall", "floor"],
      ],
      version: 1,
      width: 2,
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
