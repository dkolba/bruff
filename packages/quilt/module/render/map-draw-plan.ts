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

/** Terrain tile draw command. */
export type DrawTerrainTileCommand = Readonly<{
  kind: "drawTerrainTile";
  x: number;
  y: number;
  width: number;
  height: number;
  fillStyle: string;
}>;

/** Overlay grid draw command. */
export type DrawGridCommand = Readonly<{
  kind: "drawGrid";
  width: number;
  height: number;
}>;

/** Overlay hover tile draw command. */
export type DrawHoverTileCommand = Readonly<{
  kind: "drawHoverTile";
  x: number;
  y: number;
  width: number;
  height: number;
}>;

/** Terrain draw plan. */
export type TerrainDrawPlan = Readonly<{
  kind: "terrain";
  commands: ReadonlyArray<DrawTerrainTileCommand>;
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

/** Projects dirty chunks to terrain tile draw commands. */
export const createTerrainDrawPlan = (
  input: CreateDrawPlanInput,
): TerrainDrawPlan => ({
  commands: getTerrainChunkKeys(input.quiltState).flatMap((chunkKey) =>
    createTerrainTileCommands(input, parseChunkCoordinate(chunkKey)),
  ),
  kind: "terrain",
});

/** Projects transient editor state to overlay draw commands. */
export const createOverlayDrawPlan = (
  input: CreateDrawPlanInput,
): OverlayDrawPlan => ({
  commands:
    input.quiltState.hoveredTile.type === "some"
      ? [
          createGridCommand(input),
          {
            height: input.tileSize,
            kind: "drawHoverTile",
            width: input.tileSize,
            x:
              input.quiltState.hoveredTile.tileCoordinate.tileX *
              input.tileSize,
            y:
              input.quiltState.hoveredTile.tileCoordinate.tileY *
              input.tileSize,
          },
        ]
      : [createGridCommand(input)],
  kind: "overlay",
});

const createGridCommand = (input: CreateDrawPlanInput): DrawGridCommand => ({
  height: input.quiltState.tileMapData.height * input.tileSize,
  kind: "drawGrid",
  width: input.quiltState.tileMapData.width * input.tileSize,
});

const getTerrainChunkKeys = (quiltState: QuiltState): ReadonlyArray<string> =>
  quiltState.dirtyChunks.size === FALLBACK_CHUNK_COORDINATE
    ? [...quiltState.tileMapData.chunks.keys()]
    : [...quiltState.dirtyChunks];

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

const createTerrainTileCommands = (
  input: CreateDrawPlanInput,
  chunkCoordinate: ChunkCoordinate,
): ReadonlyArray<DrawTerrainTileCommand> =>
  createChunkTileCoordinates(input.quiltState, chunkCoordinate).map(
    (tileCoordinate) =>
      createTerrainTileCommand(
        tileCoordinate,
        input.tileSize,
        getTile(input.quiltState.tileMapData, tileCoordinate, "terrain"),
      ),
  );

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

  return Array.from({ length: height }).flatMap((unusedRow, tileYOffset) =>
    Array.from({ length: width }).map((unusedColumn, tileXOffset) => ({
      tileX: firstTileX + tileXOffset,
      tileY: firstTileY + tileYOffset,
    })),
  );
};

const createTerrainTileCommand = (
  tileCoordinate: TileCoordinate,
  tileSize: number,
  tileId: TileId,
): DrawTerrainTileCommand => ({
  fillStyle: tileIdToFillStyle(tileId),
  height: tileSize,
  kind: "drawTerrainTile",
  width: tileSize,
  x: tileCoordinate.tileX * tileSize,
  y: tileCoordinate.tileY * tileSize,
});

const tileIdToFillStyle = (tileId: TileId): string => {
  if (tileId === wallTileId) {
    return WALL_FILL_STYLE;
  }

  if (tileId === doorTileId) {
    return DOOR_FILL_STYLE;
  }

  return FLOOR_FILL_STYLE;
};
