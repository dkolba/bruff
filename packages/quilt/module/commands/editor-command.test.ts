import { describe, expect, test } from "vitest";
import { floorTileId, wallTileId } from "../model/tile-map-data.ts";
import { createPaintTilesCommand } from "./editor-command.ts";

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
});
