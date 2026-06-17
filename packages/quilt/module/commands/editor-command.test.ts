import { describe, expect, test } from "vitest";

import {
  createTileMapData,
  floorTileId,
  wallTileId,
} from "../model/tile-map-data.ts";
import {
  createPaintTilesCommand,
  createResizeMapCommand,
} from "./editor-command.ts";

const tileCoordinate = { tileX: 1, tileY: 2 };

describe("editor command", () => {
  test("creates paint tile command data", () => {
    expect(
      createPaintTilesCommand({
        changes: [
          {
            afterTileId: wallTileId,
            beforeTileId: floorTileId,
            coordinate: tileCoordinate,
            layerId: "terrain",
          },
        ],
      }),
    ).toStrictEqual({
      changes: [
        {
          afterTileId: wallTileId,
          beforeTileId: floorTileId,
          coordinate: tileCoordinate,
          layerId: "terrain",
        },
      ],
      type: "PAINT_TILES",
    });
  });

  test("creates resize map command data with before and after snapshots", () => {
    const beforeTileMapData = createTileMapData({ height: 4, width: 4 });
    const afterTileMapData = createTileMapData({ height: 9, width: 9 });

    expect(
      createResizeMapCommand({ afterTileMapData, beforeTileMapData }),
    ).toStrictEqual({
      afterTileMapData,
      beforeTileMapData,
      type: "RESIZE_MAP",
    });
  });
});
