import { describe, expect, test } from "vitest";
import { floorTileId, wallTileId } from "./tile-map-data.ts";
import { readTileLayer, writeTileLayer } from "./tile-layer.ts";

describe("tile layer", () => {
  test("reads typed-array layer values as tile IDs", () => {
    const layer = new Uint8Array([floorTileId, wallTileId]);

    expect(
      readTileLayer({ fallbackTileId: floorTileId, layer, layerIndex: 1 }),
    ).toBe(wallTileId);
  });

  test("reads uint16 layer values", () => {
    const layer = new Uint16Array([floorTileId, wallTileId]);

    expect(
      readTileLayer({ fallbackTileId: floorTileId, layer, layerIndex: 1 }),
    ).toBe(wallTileId);
  });

  test("reads uint32 layer values", () => {
    const layer = new Uint32Array([floorTileId, wallTileId]);

    expect(
      readTileLayer({ fallbackTileId: floorTileId, layer, layerIndex: 1 }),
    ).toBe(wallTileId);
  });

  test("uses the fallback tile ID when an index is outside the layer", () => {
    const layer = new Uint8Array([wallTileId]);

    expect(
      readTileLayer({ fallbackTileId: floorTileId, layer, layerIndex: 4 }),
    ).toBe(floorTileId);
  });

  test("writes uint16 layer values immutably", () => {
    const layer = new Uint16Array([floorTileId, floorTileId]);
    const nextLayer = writeTileLayer({
      layer,
      layerIndex: 1,
      tileId: wallTileId,
    });

    expect(nextLayer).toBeInstanceOf(Uint16Array);
    expect([...nextLayer]).toStrictEqual([floorTileId, wallTileId]);
  });

  test("writes uint32 layer values immutably", () => {
    const layer = new Uint32Array([floorTileId, floorTileId]);
    const nextLayer = writeTileLayer({
      layer,
      layerIndex: 1,
      tileId: wallTileId,
    });

    expect(nextLayer).toBeInstanceOf(Uint32Array);
    expect([...nextLayer]).toStrictEqual([floorTileId, wallTileId]);
  });

  test("writes typed-array layer values immutably", () => {
    const layer = new Uint8Array([floorTileId, floorTileId]);
    const nextLayer = writeTileLayer({
      layer,
      layerIndex: 1,
      tileId: wallTileId,
    });

    expect([...layer]).toStrictEqual([floorTileId, floorTileId]);
    expect([...nextLayer]).toStrictEqual([floorTileId, wallTileId]);
  });
});
