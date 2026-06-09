import { brand, type Brand } from "@bruff/utils";
import type { EntityId, MapEntity } from "../entities/map-entity.ts";

const MAP_DATA_VERSION = Number("1");
const DEFAULT_CHUNK_SIZE = Number("32");
const CHUNK_KEY_SEPARATOR = ":";
const FLOOR_TILE_INDEX = Number("0");
const WALL_TILE_INDEX = Number("1");
const DOOR_TILE_INDEX = Number("2");
const EMPTY_OBJECT_TILE = FLOOR_TILE_INDEX;
const EMPTY_FLAGS_TILE = FLOOR_TILE_INDEX;
const TILE_INDEX_OFFSET = WALL_TILE_INDEX;

/** Branded numeric tile identifier. */
export type TileId = Brand<number, "TileId">;

/** Integer tile coordinate in map space. */
export type TileCoordinate = Readonly<{
  tileX: number;
  tileY: number;
}>;

/** Integer chunk coordinate in map space. */
export type ChunkCoordinate = Readonly<{
  chunkX: number;
  chunkY: number;
}>;

/** Supported tile layer identifiers. */
export type TileLayerId = "terrain" | "object" | "flags";

/** Immutable map chunk with cache-friendly typed-array layers. */
export type TileChunk = Readonly<{
  chunkCoordinate: ChunkCoordinate;
  terrainLayer: Uint8Array;
  objectLayer: Uint16Array;
  flagsLayer: Uint32Array;
}>;

/** Chunked map data used by Quilt. */
export type TileMapData = Readonly<{
  version: typeof MAP_DATA_VERSION;
  width: number;
  height: number;
  chunkSize: number;
  chunks: ReadonlyMap<string, TileChunk>;
  entities: ReadonlyMap<EntityId, MapEntity>;
}>;

/** Input for creating empty tile map data. */
export type CreateTileMapDataInput = Readonly<{
  width: number;
  height: number;
  chunkSize?: number;
}>;

/** Input for updating a single map tile. */
export type SetTileInput = Readonly<{
  tileMapData: TileMapData;
  tileCoordinate: TileCoordinate;
  layerId: TileLayerId;
  tileId: TileId;
}>;

/** Input for reading a tile layer value. */
type ReadChunkLayerInput = Readonly<{
  chunk: TileChunk;
  layerId: TileLayerId;
  layerIndex: number;
}>;

/** Input for writing a tile layer value. */
type WriteChunkLayerInput = Readonly<{
  chunk: TileChunk;
  layerId: TileLayerId;
  layerIndex: number;
  tileId: TileId;
}>;

/** Terrain tile ID for floor cells. */
export const floorTileId: TileId = brand<"TileId", number>(FLOOR_TILE_INDEX);

/** Terrain tile ID for wall cells. */
export const wallTileId: TileId = brand<"TileId", number>(WALL_TILE_INDEX);

/** Terrain tile ID for door cells. */
export const doorTileId: TileId = brand<"TileId", number>(DOOR_TILE_INDEX);

/** Converts a tile coordinate to its owning chunk coordinate. */
export const getChunkCoordinate = (
  tileCoordinate: TileCoordinate,
  chunkSize: number,
): ChunkCoordinate => ({
  chunkX: Math.floor(tileCoordinate.tileX / chunkSize),
  chunkY: Math.floor(tileCoordinate.tileY / chunkSize),
});

/** Creates a stable string key for a chunk coordinate. */
export const chunkCoordinateKey = (chunkCoordinate: ChunkCoordinate): string =>
  `${chunkCoordinate.chunkX}${CHUNK_KEY_SEPARATOR}${chunkCoordinate.chunkY}`;

const modulo = (number: number, divisor: number): number =>
  ((number % divisor) + divisor) % divisor;

const createTileChunk = (
  chunkCoordinate: ChunkCoordinate,
  chunkSize: number,
): TileChunk => ({
  chunkCoordinate,
  flagsLayer: new Uint32Array(chunkSize * chunkSize).fill(EMPTY_FLAGS_TILE),
  objectLayer: new Uint16Array(chunkSize * chunkSize).fill(EMPTY_OBJECT_TILE),
  terrainLayer: new Uint8Array(chunkSize * chunkSize).fill(floorTileId),
});

const createChunkCoordinates = (
  width: number,
  height: number,
  chunkSize: number,
): ReadonlyArray<ChunkCoordinate> =>
  Array.from({ length: Math.ceil(width / chunkSize) }).flatMap(
    (unusedColumn, chunkX) =>
      Array.from({ length: Math.ceil(height / chunkSize) }).map(
        (unusedRow, chunkY) => ({ chunkX, chunkY }),
      ),
  );

const getTileChunk = (
  tileMapData: TileMapData,
  tileCoordinate: TileCoordinate,
): TileChunk => {
  const chunkCoordinate = getChunkCoordinate(
    tileCoordinate,
    tileMapData.chunkSize,
  );
  const chunk = tileMapData.chunks.get(chunkCoordinateKey(chunkCoordinate));

  return chunk ?? createTileChunk(chunkCoordinate, tileMapData.chunkSize);
};

const readUint8LayerItem = (
  layer: Uint8Array,
  layerIndex: number,
  fallbackTileId: number,
): number =>
  layer
    .subarray(layerIndex, layerIndex + TILE_INDEX_OFFSET)
    .reduce((previousTileId, tileId) => tileId, fallbackTileId);

const readUint16LayerItem = (
  layer: Uint16Array,
  layerIndex: number,
  fallbackTileId: number,
): number =>
  layer
    .subarray(layerIndex, layerIndex + TILE_INDEX_OFFSET)
    .reduce((previousTileId, tileId) => tileId, fallbackTileId);

const readUint32LayerItem = (
  layer: Uint32Array,
  layerIndex: number,
  fallbackTileId: number,
): number =>
  layer
    .subarray(layerIndex, layerIndex + TILE_INDEX_OFFSET)
    .reduce((previousTileId, tileId) => tileId, fallbackTileId);

const readChunkLayer = (input: ReadChunkLayerInput): number => {
  if (input.layerId === "object") {
    return readUint16LayerItem(
      input.chunk.objectLayer,
      input.layerIndex,
      EMPTY_OBJECT_TILE,
    );
  }

  if (input.layerId === "flags") {
    return readUint32LayerItem(
      input.chunk.flagsLayer,
      input.layerIndex,
      EMPTY_FLAGS_TILE,
    );
  }

  return readUint8LayerItem(
    input.chunk.terrainLayer,
    input.layerIndex,
    floorTileId,
  );
};

const writeObjectLayer = (input: WriteChunkLayerInput): TileChunk => {
  const objectLayer = new Uint16Array(input.chunk.objectLayer);
  objectLayer[input.layerIndex] = input.tileId;

  return { ...input.chunk, objectLayer };
};

const writeFlagsLayer = (input: WriteChunkLayerInput): TileChunk => {
  const flagsLayer = new Uint32Array(input.chunk.flagsLayer);
  flagsLayer[input.layerIndex] = input.tileId;

  return { ...input.chunk, flagsLayer };
};

const writeTerrainLayer = (input: WriteChunkLayerInput): TileChunk => {
  const terrainLayer = new Uint8Array(input.chunk.terrainLayer);
  terrainLayer[input.layerIndex] = input.tileId;

  return { ...input.chunk, terrainLayer };
};

const writeChunkLayer = (input: WriteChunkLayerInput): TileChunk => {
  if (input.layerId === "object") {
    return writeObjectLayer(input);
  }

  return input.layerId === "flags"
    ? writeFlagsLayer(input)
    : writeTerrainLayer(input);
};

/** Creates chunked map data filled with floor terrain. */
export const createTileMapData = (
  input: CreateTileMapDataInput,
): TileMapData => {
  const chunkSize = input.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const chunkCoordinates = createChunkCoordinates(
    input.width,
    input.height,
    chunkSize,
  );
  const chunks = new Map(
    chunkCoordinates.map((chunkCoordinate) => [
      chunkCoordinateKey(chunkCoordinate),
      createTileChunk(chunkCoordinate, chunkSize),
    ]),
  );

  return {
    chunkSize,
    chunks,
    entities: new Map(),
    height: input.height,
    version: MAP_DATA_VERSION,
    width: input.width,
  };
};

/** Converts a tile coordinate to a chunk-local typed-array index. */
export const tileCoordinateToChunkIndex = (
  tileCoordinate: TileCoordinate,
  chunkSize: number,
): number => {
  const localX = modulo(tileCoordinate.tileX, chunkSize);
  const localY = modulo(tileCoordinate.tileY, chunkSize);

  return localY * chunkSize + localX;
};

/** Reads a tile ID from a map layer. */
export const getTile = (
  tileMapData: TileMapData,
  tileCoordinate: TileCoordinate,
  layerId: TileLayerId,
): TileId => {
  const chunk = getTileChunk(tileMapData, tileCoordinate);
  const layerIndex = tileCoordinateToChunkIndex(
    tileCoordinate,
    tileMapData.chunkSize,
  );
  const tileId = readChunkLayer({ chunk, layerId, layerIndex });

  return brand<"TileId", number>(tileId);
};

/** Returns map data with one tile updated by replacing the owning chunk. */
export const setTile = (input: SetTileInput): TileMapData => {
  const chunkCoordinate = getChunkCoordinate(
    input.tileCoordinate,
    input.tileMapData.chunkSize,
  );
  const chunkKey = chunkCoordinateKey(chunkCoordinate);
  const chunk = getTileChunk(input.tileMapData, input.tileCoordinate);
  const layerIndex = tileCoordinateToChunkIndex(
    input.tileCoordinate,
    input.tileMapData.chunkSize,
  );
  const nextChunks = new Map(input.tileMapData.chunks);

  nextChunks.set(
    chunkKey,
    writeChunkLayer({
      chunk,
      layerId: input.layerId,
      layerIndex,
      tileId: input.tileId,
    }),
  );

  return { ...input.tileMapData, chunks: nextChunks };
};
