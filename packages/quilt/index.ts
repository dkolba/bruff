export { QuiltElement } from "./module/quilt-element.ts";
export {
  getQuiltMapData,
  registerQuiltElement,
  setQuiltMapData,
} from "./module/quilt-element-helpers.ts";

export {
  chunkCoordinateKey,
  createTileMapData,
  doorTileId,
  floorTileId,
  getChunkCoordinate,
  getTile,
  QUILT_GRID_SIZES,
  resizeTileMapData,
  setTile,
  tileCoordinateToChunkIndex,
  wallTileId,
  type ChunkCoordinate,
  type CreateTileMapDataInput,
  type QuiltGridSize,
  type ResizeTileMapDataInput,
  type SetTileInput,
  type TileChunk,
  type TileCoordinate,
  type TileId,
  type TileLayerId,
  type TileMapData,
} from "./module/model/tile-map-data.ts";

export {
  createQuiltState,
  type QuiltState,
  type QuiltTerrainDrawMode,
  type QuiltTerrainGlyph,
  type QuiltTerrainGlyphMap,
  type QuiltUserVisibleError,
} from "./module/state/quilt-state.ts";

export {
  executeEditorCommand,
  redoEditorCommand,
  undoEditorCommand,
} from "./module/state/execute-editor-command.ts";

export {
  createPaintTilesCommand,
  createResizeMapCommand,
  type EditorCommand,
  type PaintTileChange,
  type PaintTilesCommand,
  type ResizeMapCommand,
} from "./module/commands/editor-command.ts";

export {
  parseBroughlikeMapData,
  serializeBroughlikeMapData,
  type ParseBroughlikeMapDataError,
} from "./module/storage/broughlike-map.ts";

export {
  parseQuiltTerrainGlyphs,
  type ParseQuiltTerrainGlyphsError,
} from "./module/storage/sigil-glyph-map.ts";

export type { BroughlikeMap, BroughlikeTerrain } from "@bruff/contracts";
