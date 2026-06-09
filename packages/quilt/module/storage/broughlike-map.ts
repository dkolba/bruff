import {
  type BroughlikeMap,
  type BroughlikeTerrain,
  parseBroughlikeMap,
  type ParseBroughlikeMapError,
} from "@bruff/contracts";
import {
  createTileMapData,
  doorTileId,
  floorTileId,
  getTile,
  setTile,
  type TileId,
  type TileMapData,
  wallTileId,
} from "../model/tile-map-data.ts";
import { error, ok, type Result } from "@bruff/utils";

const BROUGHLIKE_MAP_VERSION = 1;
const FIRST_ROW_INDEX = 0;
const FIRST_COLUMN_INDEX = 0;

/** Quilt parse error for shared broughlike map data. */
export type ParseBroughlikeMapDataError = Readonly<{
  reason: "INVALID_BROUGHLIKE_MAP_DATA";
  source: ParseBroughlikeMapError;
}>;

const tileIdToTerrain = (tileId: TileId): BroughlikeTerrain => {
  if (tileId === wallTileId) {
    return "wall";
  }

  return tileId === doorTileId ? "door" : "floor";
};

const terrainToTileId = (terrain: BroughlikeTerrain): TileId => {
  if (terrain === "wall") {
    return wallTileId;
  }

  return terrain === "door" ? doorTileId : floorTileId;
};

const broughlikeMapToTileMapData = (
  broughlikeMap: BroughlikeMap,
): TileMapData =>
  broughlikeMap.rows.reduce(
    (tileMapData, row, tileY) =>
      row.reduce(
        (nextTileMapData, terrain, tileX) =>
          setTile({
            layerId: "terrain",
            tileCoordinate: {
              tileX: tileX + FIRST_COLUMN_INDEX,
              tileY: tileY + FIRST_ROW_INDEX,
            },
            tileId: terrainToTileId(terrain),
            tileMapData: nextTileMapData,
          }),
        tileMapData,
      ),
    createTileMapData({
      height: broughlikeMap.height,
      width: broughlikeMap.width,
    }),
  );

/** Serializes Quilt terrain data to the shared broughlike map JSON contract. */
export const serializeBroughlikeMapData = (
  tileMapData: TileMapData,
): BroughlikeMap => ({
  height: tileMapData.height,
  rows: Array.from({ length: tileMapData.height }).map((unusedRow, tileY) =>
    Array.from({ length: tileMapData.width }).map((unusedColumn, tileX) =>
      tileIdToTerrain(getTile(tileMapData, { tileX, tileY }, "terrain")),
    ),
  ),
  version: BROUGHLIKE_MAP_VERSION,
  width: tileMapData.width,
});

/** Parses shared broughlike map JSON into Quilt tile map data. */
export const parseBroughlikeMapData = (
  input: unknown,
): Result<TileMapData, ParseBroughlikeMapDataError> => {
  const parsedMap = parseBroughlikeMap(input);

  return parsedMap.type === "error"
    ? error({ reason: "INVALID_BROUGHLIKE_MAP_DATA", source: parsedMap.error })
    : ok(broughlikeMapToTileMapData(parsedMap.value));
};
