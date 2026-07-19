import type {
  TileCoordinate,
  TileId,
  TileLayerId,
  TileMapData,
} from "../model/tile-map-data.ts";

/**
 * One tile layer change captured by a paint command.
 */
export type PaintTileChange = Readonly<{
  coordinate: TileCoordinate;
  layerId: TileLayerId;
  beforeTileId: TileId;
  afterTileId: TileId;
}>;

/**
 * Undoable command for painting one or more tiles.
 */
export type PaintTilesCommand = Readonly<{
  type: "PAINT_TILES";
  changes: ReadonlyArray<PaintTileChange>;
}>;

/**
 * Undoable command for resizing the map grid.
 */
export type ResizeMapCommand = Readonly<{
  type: "RESIZE_MAP";
  beforeTileMapData: TileMapData;
  afterTileMapData: TileMapData;
}>;

/**
 * Quilt editor command ADT.
 */
export type EditorCommand = PaintTilesCommand | ResizeMapCommand;

/**
 * Input for creating a paint command.
 */
export type CreatePaintTilesCommandInput = Readonly<{
  changes: ReadonlyArray<PaintTileChange>;
}>;

/**
 * Input for creating a resize map command.
 */
export type CreateResizeMapCommandInput = Readonly<{
  beforeTileMapData: TileMapData;
  afterTileMapData: TileMapData;
}>;

/**
 * Creates a plain-data paint tiles command.
 */
export const createPaintTilesCommand = (
  input: CreatePaintTilesCommandInput,
): PaintTilesCommand => ({
  changes: input.changes,
  type: "PAINT_TILES",
});

/**
 * Creates a plain-data resize map command with before/after snapshots.
 */
export const createResizeMapCommand = (
  input: CreateResizeMapCommandInput,
): ResizeMapCommand => ({
  afterTileMapData: input.afterTileMapData,
  beforeTileMapData: input.beforeTileMapData,
  type: "RESIZE_MAP",
});
