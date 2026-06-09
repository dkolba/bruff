import { brand } from "@bruff/utils";
import type { TileId } from "./tile-map-data.ts";

const TILE_INDEX_OFFSET = 1;

/** Typed arrays supported by Quilt tile layers. */
export type TileLayer = Uint8Array | Uint16Array | Uint32Array;

/** Input for reading one tile layer value. */
export type ReadTileLayerInput = Readonly<{
  layer: TileLayer;
  layerIndex: number;
  fallbackTileId: TileId;
}>;

/** Input for writing one tile layer value. */
export type WriteTileLayerInput = Readonly<{
  layer: TileLayer;
  layerIndex: number;
  tileId: TileId;
}>;

const readUint8Layer = (
  layer: Uint8Array,
  layerIndex: number,
  fallbackTileId: TileId,
): TileId => {
  const tileId = layer
    .subarray(layerIndex, layerIndex + TILE_INDEX_OFFSET)
    .reduce((previousTileId, currentTileId) => currentTileId, fallbackTileId);

  return brand<"TileId", number>(tileId);
};

const readUint16Layer = (
  layer: Uint16Array,
  layerIndex: number,
  fallbackTileId: TileId,
): TileId => {
  const tileId = layer
    .subarray(layerIndex, layerIndex + TILE_INDEX_OFFSET)
    .reduce((previousTileId, currentTileId) => currentTileId, fallbackTileId);

  return brand<"TileId", number>(tileId);
};

const readUint32Layer = (
  layer: Uint32Array,
  layerIndex: number,
  fallbackTileId: TileId,
): TileId => {
  const tileId = layer
    .subarray(layerIndex, layerIndex + TILE_INDEX_OFFSET)
    .reduce((previousTileId, currentTileId) => currentTileId, fallbackTileId);

  return brand<"TileId", number>(tileId);
};

const writeUint8Layer = (input: WriteTileLayerInput): Uint8Array => {
  const layer = new Uint8Array(input.layer);
  layer[input.layerIndex] = input.tileId;

  return layer;
};

const writeUint16Layer = (input: WriteTileLayerInput): Uint16Array => {
  const layer = new Uint16Array(input.layer);
  layer[input.layerIndex] = input.tileId;

  return layer;
};

const writeUint32Layer = (input: WriteTileLayerInput): Uint32Array => {
  const layer = new Uint32Array(input.layer);
  layer[input.layerIndex] = input.tileId;

  return layer;
};

/** Reads a tile ID from a typed-array layer. */
export const readTileLayer = (input: ReadTileLayerInput): TileId => {
  if (input.layer instanceof Uint16Array) {
    return readUint16Layer(input.layer, input.layerIndex, input.fallbackTileId);
  }

  return input.layer instanceof Uint32Array
    ? readUint32Layer(input.layer, input.layerIndex, input.fallbackTileId)
    : readUint8Layer(input.layer, input.layerIndex, input.fallbackTileId);
};

/** Returns a copied typed-array layer with one tile changed. */
export const writeTileLayer = (input: WriteTileLayerInput): TileLayer => {
  if (input.layer instanceof Uint16Array) {
    return writeUint16Layer(input);
  }

  return input.layer instanceof Uint32Array
    ? writeUint32Layer(input)
    : writeUint8Layer(input);
};
