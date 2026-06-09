import type {
  TileCoordinate,
  TileId,
  TileLayerId,
} from "../model/tile-map-data.ts";

/** One tile layer change captured by a paint command. */
export type PaintTileChange = Readonly<{
  coordinate: TileCoordinate;
  layerId: TileLayerId;
  beforeTileId: TileId;
  afterTileId: TileId;
}>;

/** Undoable command for painting one or more tiles. */
export type PaintTilesCommand = Readonly<{
  type: "PAINT_TILES";
  changes: ReadonlyArray<PaintTileChange>;
}>;

/** Quilt editor command ADT. */
export type EditorCommand = PaintTilesCommand;

/** Input for creating a paint command. */
export type CreatePaintTilesCommandInput = Readonly<{
  changes: ReadonlyArray<PaintTileChange>;
}>;

/** Creates a plain-data paint tiles command. */
export const createPaintTilesCommand = (
  input: CreatePaintTilesCommandInput,
): PaintTilesCommand => ({
  changes: input.changes,
  type: "PAINT_TILES",
});
