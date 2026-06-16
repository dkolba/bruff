import { describe, expect, test } from "vitest";
import {
  screenToTileCoordinate,
  screenToWorldCoordinate,
  worldToScreenCoordinate,
  worldToTileCoordinate,
} from "./coordinates.ts";

const camera = { worldX: 10, worldY: 20, zoom: 2 };
const tileSize = 16;

describe("coordinates", () => {
  test("converts screen coordinates to world coordinates", () => {
    expect(
      screenToWorldCoordinate({
        camera,
        screenCoordinate: { screenX: 20, screenY: 40 },
      }),
    ).toStrictEqual({ worldX: 20, worldY: 40 });
  });

  test("converts world coordinates to screen coordinates", () => {
    expect(
      worldToScreenCoordinate({
        camera,
        worldCoordinate: { worldX: 20, worldY: 40 },
      }),
    ).toStrictEqual({ screenX: 20, screenY: 40 });
  });

  test("converts world coordinates to tile coordinates", () => {
    expect(
      worldToTileCoordinate({
        tileSize,
        worldCoordinate: { worldX: 33, worldY: 47 },
      }),
    ).toStrictEqual({ tileX: 2, tileY: 2 });
  });

  test("converts screen coordinates to tile coordinates", () => {
    expect(
      screenToTileCoordinate({
        camera,
        screenCoordinate: { screenX: 20, screenY: 40 },
        tileSize,
      }),
    ).toStrictEqual({ tileX: 1, tileY: 2 });
  });
});
