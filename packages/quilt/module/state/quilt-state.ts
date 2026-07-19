import type { BroughlikeTerrain, SigilGlyphBounds } from "@bruff/contracts";

import type { EditorCommand } from "../commands/editor-command.ts";
import {
  type TileCoordinate,
  type TileId,
  type TileLayerId,
  type TileMapData,
  wallTileId,
} from "../model/tile-map-data.ts";

const DEFAULT_CAMERA_WORLD_X = 0;
const DEFAULT_CAMERA_WORLD_Y = 0;
const DEFAULT_CAMERA_ZOOM = 1;

/**
 * Available Quilt editing tools.
 */
export type QuiltTool = "paint" | "erase" | "select";

/**
 * Terrain draw mode.
 */
export type QuiltTerrainDrawMode = BroughlikeTerrain;

/**
 * Glyph rendering data for one terrain tile type.
 */
export type QuiltTerrainGlyph = Readonly<{
  terrain: BroughlikeTerrain;
  path: string;
  bounds: SigilGlyphBounds;
  advanceWidth: number;
  unitsPerEm: number;
}>;

/**
 * Imported glyph rendering data keyed by terrain type.
 */
export type QuiltTerrainGlyphMap = Readonly<
  Partial<Record<BroughlikeTerrain, QuiltTerrainGlyph>>
>;

/**
 * User-visible error surfaced in the Quilt template.
 */
export type QuiltUserVisibleError = Readonly<{
  message: string;
}>;

/**
 * Quilt camera in world coordinates.
 */
export type QuiltCamera = Readonly<{
  worldX: number;
  worldY: number;
  zoom: number;
}>;

/**
 * Optional tile value used by hover and selection state.
 */
export type OptionalTileCoordinate =
  | Readonly<{ type: "none" }>
  | Readonly<{ type: "some"; tileCoordinate: TileCoordinate }>;

/**
 * Clipboard state for future tile copy operations.
 */
export type QuiltClipboard = Readonly<{ type: "empty" }>;

/**
 * Immutable transient Quilt editor state.
 */
export type QuiltState = Readonly<{
  tileMapData: TileMapData;
  selectedTool: QuiltTool;
  selectedLayer: TileLayerId;
  selectedTileId: TileId;
  selectedTerrain: QuiltTerrainDrawMode;
  terrainGlyphs: QuiltTerrainGlyphMap;
  visibleErrors: ReadonlyArray<QuiltUserVisibleError>;
  camera: QuiltCamera;
  hoveredTile: OptionalTileCoordinate;
  selection: OptionalTileCoordinate;
  clipboard: QuiltClipboard;
  undoStack: ReadonlyArray<EditorCommand>;
  redoStack: ReadonlyArray<EditorCommand>;
  dirtyChunks: ReadonlySet<string>;
}>;

/**
 * Input for creating Quilt editor state.
 */
export type CreateQuiltStateInput = Readonly<{
  tileMapData: TileMapData;
  selectedTool?: QuiltTool;
  selectedLayer?: TileLayerId;
  selectedTileId?: TileId;
  selectedTerrain?: QuiltTerrainDrawMode;
  terrainGlyphs?: QuiltTerrainGlyphMap;
  visibleErrors?: ReadonlyArray<QuiltUserVisibleError>;
  camera?: QuiltCamera;
  hoveredTile?: OptionalTileCoordinate;
  selection?: OptionalTileCoordinate;
  clipboard?: QuiltClipboard;
  undoStack?: ReadonlyArray<EditorCommand>;
  redoStack?: ReadonlyArray<EditorCommand>;
  dirtyChunks?: ReadonlySet<string>;
}>;

/**
 * Creates immutable transient Quilt editor state for a map.
 */
export const createQuiltState = (input: CreateQuiltStateInput): QuiltState => ({
  camera: input.camera ?? {
    worldX: DEFAULT_CAMERA_WORLD_X,
    worldY: DEFAULT_CAMERA_WORLD_Y,
    zoom: DEFAULT_CAMERA_ZOOM,
  },
  clipboard: input.clipboard ?? { type: "empty" },
  dirtyChunks: input.dirtyChunks ?? new Set(),
  hoveredTile: input.hoveredTile ?? { type: "none" },
  redoStack: input.redoStack ?? [],
  selectedLayer: input.selectedLayer ?? "terrain",
  selectedTerrain: input.selectedTerrain ?? "floor",
  selectedTileId: input.selectedTileId ?? wallTileId,
  selectedTool: input.selectedTool ?? "paint",
  selection: input.selection ?? { type: "none" },
  terrainGlyphs: input.terrainGlyphs ?? {},
  tileMapData: input.tileMapData,
  undoStack: input.undoStack ?? [],
  visibleErrors: input.visibleErrors ?? [],
});
