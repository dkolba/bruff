import {
  createTileMapData,
  floorTileId,
  getTile,
  wallTileId,
} from "../model/tile-map-data.ts";
import { describe, expect, test } from "vitest";
import {
  executeEditorCommand,
  redoEditorCommand,
  undoEditorCommand,
} from "./execute-editor-command.ts";
import { createPaintTilesCommand } from "../commands/editor-command.ts";
import { createQuiltState } from "./quilt-state.ts";

const paintedTile = { tileX: 1, tileY: 1 };
const crossChunkTile = { tileX: 33, tileY: 1 };

describe("execute editor command", () => {
  test("executes paint commands and tracks dirty chunks", () => {
    const command = createPaintTilesCommand({
      changes: [
        {
          afterTileId: wallTileId,
          beforeTileId: floorTileId,
          coordinate: paintedTile,
          layerId: "terrain",
        },
        {
          afterTileId: wallTileId,
          beforeTileId: floorTileId,
          coordinate: crossChunkTile,
          layerId: "terrain",
        },
      ],
    });
    const quiltState = createQuiltState({
      tileMapData: createTileMapData({ height: 40, width: 40 }),
    });
    const nextState = executeEditorCommand(quiltState, command);

    expect(getTile(nextState.tileMapData, paintedTile, "terrain")).toBe(
      wallTileId,
    );
    expect(getTile(nextState.tileMapData, crossChunkTile, "terrain")).toBe(
      wallTileId,
    );
    expect(nextState.dirtyChunks).toStrictEqual(new Set(["0:0", "1:0"]));
    expect(nextState.undoStack).toStrictEqual([command]);
    expect(nextState.redoStack).toStrictEqual([]);
  });

  test("undoes and redoes paint commands", () => {
    const command = createPaintTilesCommand({
      changes: [
        {
          afterTileId: wallTileId,
          beforeTileId: floorTileId,
          coordinate: paintedTile,
          layerId: "terrain",
        },
      ],
    });
    const quiltState = createQuiltState({
      tileMapData: createTileMapData({ height: 4, width: 4 }),
    });
    const paintedState = executeEditorCommand(quiltState, command);
    const undoneState = undoEditorCommand(paintedState);
    const redoneState = redoEditorCommand(undoneState);

    expect(getTile(undoneState.tileMapData, paintedTile, "terrain")).toBe(
      floorTileId,
    );
    expect(undoneState.undoStack).toStrictEqual([]);
    expect(undoneState.redoStack).toStrictEqual([command]);
    expect(getTile(redoneState.tileMapData, paintedTile, "terrain")).toBe(
      wallTileId,
    );
    expect(redoneState.undoStack).toStrictEqual([command]);
    expect(redoneState.redoStack).toStrictEqual([]);
  });

  test("keeps state unchanged when undo or redo stacks are empty", () => {
    const quiltState = createQuiltState({
      tileMapData: createTileMapData({ height: 4, width: 4 }),
    });

    expect(undoEditorCommand(quiltState)).toBe(quiltState);
    expect(redoEditorCommand(quiltState)).toBe(quiltState);
  });
});
