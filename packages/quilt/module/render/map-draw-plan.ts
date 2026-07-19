import type { SigilGlyphBounds } from "@bruff/contracts";

import {
  type ChunkCoordinate,
  doorTileId,
  getTile,
  type TileCoordinate,
  type TileId,
  wallTileId,
} from "../model/tile-map-data.ts";
import type { QuiltState } from "../state/quilt-state.ts";

const CHUNK_KEY_SEPARATOR = ":";
const CHUNK_X_INDEX = 0;
const CHUNK_Y_INDEX = 1;
const FALLBACK_CHUNK_COORDINATE = 0;
const FLOOR_FILL_STYLE = "#d7d0bf";
const WALL_FILL_STYLE = "#111111";
const DOOR_FILL_STYLE = "#8b5a2b";

/** Terrain tile fill draw command. */
export type DrawTerrainTileCommand = Readonly<{
  kind: "drawTerrainTile";
  pixelX: number;
  pixelY: number;
  pixelWidth: number;
  pixelHeight: number;
  fillStyle: string;
}>;

/** Normalized tile-space bounds for glyph scaling. */
export type TileBounds = Readonly<{
  lowX: number;
  lowY: number;
  highX: number;
  highY: number;
}>;

/** Terrain glyph path draw command. */
export type DrawTerrainGlyphCommand = Readonly<{
  kind: "drawTerrainGlyph";
  pixelX: number;
  pixelY: number;
  pixelWidth: number;
  pixelHeight: number;
  path: string;
  tileBounds: TileBounds;
  glyphBounds: SigilGlyphBounds;
  unitsPerEm: number;
}>;

/** Overlay grid draw command. */
export type DrawGridCommand = Readonly<{
  kind: "drawGrid";
  pixelWidth: number;
  pixelHeight: number;
}>;

/** Overlay hover tile draw command. */
export type DrawHoverTileCommand = Readonly<{
  kind: "drawHoverTile";
  pixelX: number;
  pixelY: number;
  pixelWidth: number;
  pixelHeight: number;
}>;

/** Terrain draw plan. */
export type TerrainDrawPlan = Readonly<{
  kind: "terrain";
  commands: ReadonlyArray<DrawTerrainTileCommand | DrawTerrainGlyphCommand>;
}>;

/** Overlay draw plan. */
export type OverlayDrawPlan = Readonly<{
  kind: "overlay";
  commands: ReadonlyArray<DrawGridCommand | DrawHoverTileCommand>;
}>;

/** Input for projecting Quilt draw plans. */
export type CreateDrawPlanInput = Readonly<{
  quiltState: QuiltState;
  tileSize: number;
}>;

const parseChunkCoordinatePart = (
  chunkCoordinatePart: string | undefined,
): number => {
  const chunkCoordinate = Number(chunkCoordinatePart);

  return Number.isFinite(chunkCoordinate)
    ? chunkCoordinate
    : FALLBACK_CHUNK_COORDINATE;
};

const parseChunkCoordinate = (chunkKey: string): ChunkCoordinate => {
  const chunkCoordinateParts = chunkKey.split(CHUNK_KEY_SEPARATOR);

  return {
    chunkX: parseChunkCoordinatePart(chunkCoordinateParts.at(CHUNK_X_INDEX)),
    chunkY: parseChunkCoordinatePart(chunkCoordinateParts.at(CHUNK_Y_INDEX)),
  };
};

const getTerrainChunkKeys = (quiltState: QuiltState): ReadonlyArray<string> =>
  quiltState.dirtyChunks.size === FALLBACK_CHUNK_COORDINATE
    ? quiltState.tileMapData.chunks.keys().toArray()
    : [...quiltState.dirtyChunks];

const createChunkTileCoordinates = (
  quiltState: QuiltState,
  chunkCoordinate: ChunkCoordinate,
): ReadonlyArray<TileCoordinate> => {
  const firstTileX = chunkCoordinate.chunkX * quiltState.tileMapData.chunkSize;
  const firstTileY = chunkCoordinate.chunkY * quiltState.tileMapData.chunkSize;
  const width = Math.min(
    quiltState.tileMapData.chunkSize,
    quiltState.tileMapData.width - firstTileX,
  );
  const height = Math.min(
    quiltState.tileMapData.chunkSize,
    quiltState.tileMapData.height - firstTileY,
  );

  return Array.from({ length: height }).flatMap((_row, tileYOffset) =>
    Array.from({ length: width }, (_col, tileXOffset) => ({
      tileX: firstTileX + tileXOffset,
      tileY: firstTileY + tileYOffset,
    })),
  );
};

const tileIdToTerrain = (tileId: TileId): "floor" | "wall" | "door" => {
  if (tileId === wallTileId) {
    return "wall";
  }

  return tileId === doorTileId ? "door" : "floor";
};

const getTerrainGlyphForTileId = (
  quiltState: QuiltState,
  tileId: TileId,
):
  | undefined
  | {
      path: string;
      bounds: SigilGlyphBounds;
      unitsPerEm: number;
    } => {
  const terrain = tileIdToTerrain(tileId);
  const glyph = quiltState.terrainGlyphs[terrain];

  return glyph === undefined
    ? undefined
    : { bounds: glyph.bounds, path: glyph.path, unitsPerEm: glyph.unitsPerEm };
};

const tileIdToFillStyle = (tileId: TileId): string => {
  if (tileId === wallTileId) {
    return WALL_FILL_STYLE;
  }

  if (tileId === doorTileId) {
    return DOOR_FILL_STYLE;
  }

  return FLOOR_FILL_STYLE;
};

const createGridCommand = (input: CreateDrawPlanInput): DrawGridCommand => ({
  kind: "drawGrid",
  pixelHeight: input.quiltState.tileMapData.height * input.tileSize,
  pixelWidth: input.quiltState.tileMapData.width * input.tileSize,
});

type CreateGlyphCommandInput = Readonly<{
  tileCoordinate: TileCoordinate;
  tileSize: number;
  terrainGlyph: {
    path: string;
    bounds: SigilGlyphBounds;
    unitsPerEm: number;
  };
}>;

const createTerrainGlyphCommand = (
  input: CreateGlyphCommandInput,
): DrawTerrainGlyphCommand => ({
  glyphBounds: input.terrainGlyph.bounds,
  kind: "drawTerrainGlyph",
  path: input.terrainGlyph.path,
  pixelHeight: input.tileSize,
  pixelWidth: input.tileSize,
  pixelX: input.tileCoordinate.tileX * input.tileSize,
  pixelY: input.tileCoordinate.tileY * input.tileSize,
  tileBounds: { highX: 1, highY: 1, lowX: 0, lowY: 0 },
  unitsPerEm: input.terrainGlyph.unitsPerEm,
});

type CreateTileCommandInput = Readonly<{
  tileCoordinate: TileCoordinate;
  tileSize: number;
  tileId: TileId;
  quiltState: QuiltState;
}>;

const createTerrainTileCommand = (
  input: CreateTileCommandInput,
): DrawTerrainTileCommand | DrawTerrainGlyphCommand => {
  const terrainGlyph = getTerrainGlyphForTileId(input.quiltState, input.tileId);

  return terrainGlyph === undefined
    ? {
        fillStyle: tileIdToFillStyle(input.tileId),
        kind: "drawTerrainTile",
        pixelHeight: input.tileSize,
        pixelWidth: input.tileSize,
        pixelX: input.tileCoordinate.tileX * input.tileSize,
        pixelY: input.tileCoordinate.tileY * input.tileSize,
      }
    : createTerrainGlyphCommand({
        terrainGlyph,
        tileCoordinate: input.tileCoordinate,
        tileSize: input.tileSize,
      });
};

const createTerrainTileCommands = (
  input: CreateDrawPlanInput,
  chunkCoordinate: ChunkCoordinate,
): ReadonlyArray<DrawTerrainTileCommand | DrawTerrainGlyphCommand> =>
  createChunkTileCoordinates(input.quiltState, chunkCoordinate).map(
    (tileCoordinate) =>
      createTerrainTileCommand({
        quiltState: input.quiltState,
        tileCoordinate,
        tileId: getTile(
          input.quiltState.tileMapData,
          tileCoordinate,
          "terrain",
        ),
        tileSize: input.tileSize,
      }),
  );

/** Projects transient editor state to overlay draw commands. */
export const createOverlayDrawPlan = (
  input: CreateDrawPlanInput,
): OverlayDrawPlan => ({
  commands:
    input.quiltState.hoveredTile.type === "some"
      ? [
          createGridCommand(input),
          {
            kind: "drawHoverTile",
            pixelHeight: input.tileSize,
            pixelWidth: input.tileSize,
            pixelX:
              input.quiltState.hoveredTile.tileCoordinate.tileX *
              input.tileSize,
            pixelY:
              input.quiltState.hoveredTile.tileCoordinate.tileY *
              input.tileSize,
          },
        ]
      : [createGridCommand(input)],
  kind: "overlay",
});

/** Projects dirty chunks to terrain tile draw commands. */
export const createTerrainDrawPlan = (
  input: CreateDrawPlanInput,
): TerrainDrawPlan => ({
  commands: getTerrainChunkKeys(input.quiltState).flatMap((chunkKey) =>
    createTerrainTileCommands(input, parseChunkCoordinate(chunkKey)),
  ),
  kind: "terrain",
});
