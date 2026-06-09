import type { QuiltCamera } from "../state/quilt-state.ts";
import type { TileCoordinate } from "../model/tile-map-data.ts";

/** Screen-space coordinate in CSS pixels. */
export type ScreenCoordinate = Readonly<{
  screenX: number;
  screenY: number;
}>;

/** World-space coordinate in editor pixels. */
export type WorldCoordinate = Readonly<{
  worldX: number;
  worldY: number;
}>;

/** Input for screen-to-world conversion. */
export type ScreenToWorldCoordinateInput = Readonly<{
  camera: QuiltCamera;
  screenCoordinate: ScreenCoordinate;
}>;

/** Input for world-to-screen conversion. */
export type WorldToScreenCoordinateInput = Readonly<{
  camera: QuiltCamera;
  worldCoordinate: WorldCoordinate;
}>;

/** Input for world-to-tile conversion. */
export type WorldToTileCoordinateInput = Readonly<{
  tileSize: number;
  worldCoordinate: WorldCoordinate;
}>;

/** Input for screen-to-tile conversion. */
export type ScreenToTileCoordinateInput = Readonly<{
  camera: QuiltCamera;
  screenCoordinate: ScreenCoordinate;
  tileSize: number;
}>;

/** Converts screen pixels to world coordinates. */
export const screenToWorldCoordinate = (
  input: ScreenToWorldCoordinateInput,
): WorldCoordinate => ({
  worldX:
    input.screenCoordinate.screenX / input.camera.zoom + input.camera.worldX,
  worldY:
    input.screenCoordinate.screenY / input.camera.zoom + input.camera.worldY,
});

/** Converts world coordinates to screen pixels. */
export const worldToScreenCoordinate = (
  input: WorldToScreenCoordinateInput,
): ScreenCoordinate => ({
  screenX:
    (input.worldCoordinate.worldX - input.camera.worldX) * input.camera.zoom,
  screenY:
    (input.worldCoordinate.worldY - input.camera.worldY) * input.camera.zoom,
});

/** Converts world coordinates to integer tile coordinates. */
export const worldToTileCoordinate = (
  input: WorldToTileCoordinateInput,
): TileCoordinate => ({
  tileX: Math.floor(input.worldCoordinate.worldX / input.tileSize),
  tileY: Math.floor(input.worldCoordinate.worldY / input.tileSize),
});

/** Converts screen coordinates directly to integer tile coordinates. */
export const screenToTileCoordinate = (
  input: ScreenToTileCoordinateInput,
): TileCoordinate =>
  worldToTileCoordinate({
    tileSize: input.tileSize,
    worldCoordinate: screenToWorldCoordinate(input),
  });
