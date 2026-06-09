import type { EditorCommand } from "../commands/editor-command.ts";
import {
  wallTileId,
  type TileCoordinate,
  type TileId,
  type TileLayerId,
  type TileMapData,
} from "../model/tile-map-data.ts";

const DEFAULT_CAMERA_WORLD_X = 0;
const DEFAULT_CAMERA_WORLD_Y = 0;
const DEFAULT_CAMERA_ZOOM = 1;

/** Available Quilt editing tools. */
export type QuiltTool = "paint" | "erase" | "select";

/** Quilt camera in world coordinates. */
export type QuiltCamera = Readonly<{
  worldX: number;
  worldY: number;
  zoom: number;
}>;

/** Optional tile value used by hover and selection state. */
export type OptionalTileCoordinate =
  | Readonly<{ type: "none" }>
  | Readonly<{ type: "some"; tileCoordinate: TileCoordinate }>;

/** Clipboard state for future tile copy operations. */
export type QuiltClipboard = Readonly<{ type: "empty" }>;

/** Immutable transient Quilt editor state. */
export type QuiltState = Readonly<{
  tileMapData: TileMapData;
  selectedTool: QuiltTool;
  selectedLayer: TileLayerId;
  selectedTileId: TileId;
  camera: QuiltCamera;
  hoveredTile: OptionalTileCoordinate;
  selection: OptionalTileCoordinate;
  clipboard: QuiltClipboard;
  undoStack: ReadonlyArray<EditorCommand>;
  redoStack: ReadonlyArray<EditorCommand>;
  dirtyChunks: ReadonlySet<string>;
}>;

/** Input for creating Quilt editor state. */
export type CreateQuiltStateInput = Readonly<{
  tileMapData: TileMapData;
  selectedTool?: QuiltTool;
  selectedLayer?: TileLayerId;
  selectedTileId?: TileId;
  camera?: QuiltCamera;
  hoveredTile?: OptionalTileCoordinate;
  selection?: OptionalTileCoordinate;
  clipboard?: QuiltClipboard;
  undoStack?: ReadonlyArray<EditorCommand>;
  redoStack?: ReadonlyArray<EditorCommand>;
  dirtyChunks?: ReadonlySet<string>;
}>;

/** Creates immutable transient Quilt editor state for a map. */
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
  selectedTileId: input.selectedTileId ?? wallTileId,
  selectedTool: input.selectedTool ?? "paint",
  selection: input.selection ?? { type: "none" },
  tileMapData: input.tileMapData,
  undoStack: input.undoStack ?? [],
});
