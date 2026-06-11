/* eslint-disable sort-imports */
import { createQuiltState } from "./quilt-state.ts";
import {
  createPaintTilesCommand,
  createResizeMapCommand,
} from "../commands/editor-command.ts";
import {
  createTileMapData,
  floorTileId,
  getTile,
  wallTileId,
} from "../model/tile-map-data.ts";
import {
  executeEditorCommand,
  redoEditorCommand,
  undoEditorCommand,
} from "./execute-editor-command.ts";
import { describe, expect, test } from "vitest";

const paintedTile = { tileX: 1, tileY: 1 };
const crossChunkTile = { tileX: 33, tileY: 1 };
const MAP_SIZE_40 = 40;
const MAP_SIZE_4 = 4;
const MAP_SIZE_9 = 9;

const assertRedoneTileIsWall = (
  redoneState: ReturnType<typeof createQuiltState>,
  command: ReturnType<typeof createPaintTilesCommand>,
): void => {
  expect(getTile(redoneState.tileMapData, paintedTile, "terrain")).toBe(
    wallTileId,
  );
  expect(redoneState.undoStack).toStrictEqual([command]);
  expect(redoneState.redoStack).toStrictEqual([]);
};

type ResizeAssertInput = Readonly<{
  undoneState: ReturnType<typeof createQuiltState>;
  redoneState: ReturnType<typeof createQuiltState>;
  beforeTileMapData: ReturnType<typeof createTileMapData>;
  afterTileMapData: ReturnType<typeof createTileMapData>;
  command: ReturnType<typeof createResizeMapCommand>;
}>;

const assertResizeUndoRedo = (input: ResizeAssertInput): void => {
  const {
    afterTileMapData,
    beforeTileMapData,
    command,
    redoneState,
    undoneState,
  } = input;
  expect(undoneState.tileMapData).toBe(beforeTileMapData);
  expect(undoneState.undoStack).toStrictEqual([]);
  expect(undoneState.redoStack).toStrictEqual([command]);
  expect(redoneState.tileMapData).toBe(afterTileMapData);
  expect(redoneState.undoStack).toStrictEqual([command]);
  expect(redoneState.redoStack).toStrictEqual([]);
};

describe("execute editor command — paint execution", () => {
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
      tileMapData: createTileMapData({
        height: MAP_SIZE_40,
        width: MAP_SIZE_40,
      }),
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
});

describe("execute editor command — undo and redo paint", () => {
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
      tileMapData: createTileMapData({ height: MAP_SIZE_4, width: MAP_SIZE_4 }),
    });
    const paintedState = executeEditorCommand(quiltState, command);
    const undoneState = undoEditorCommand(paintedState);
    const redoneState = redoEditorCommand(undoneState);

    expect(getTile(undoneState.tileMapData, paintedTile, "terrain")).toBe(
      floorTileId,
    );
    expect(undoneState.undoStack).toStrictEqual([]);
    expect(undoneState.redoStack).toStrictEqual([command]);
    assertRedoneTileIsWall(redoneState, command);
  });

  test("keeps state unchanged when undo or redo stacks are empty", () => {
    const quiltState = createQuiltState({
      tileMapData: createTileMapData({ height: MAP_SIZE_4, width: MAP_SIZE_4 }),
    });

    expect(undoEditorCommand(quiltState)).toBe(quiltState);
    expect(redoEditorCommand(quiltState)).toBe(quiltState);
  });
});

describe("execute editor command — resize execution", () => {
  test("executes resize commands marking all map chunks dirty", () => {
    const beforeTileMapData = createTileMapData({
      height: MAP_SIZE_4,
      width: MAP_SIZE_4,
    });
    const afterTileMapData = createTileMapData({
      height: MAP_SIZE_9,
      width: MAP_SIZE_9,
    });
    const command = createResizeMapCommand({
      afterTileMapData,
      beforeTileMapData,
    });
    const quiltState = createQuiltState({ tileMapData: beforeTileMapData });
    const nextState = executeEditorCommand(quiltState, command);

    expect(nextState.tileMapData).toBe(afterTileMapData);
    expect(nextState.dirtyChunks).toEqual(
      new Set(afterTileMapData.chunks.keys()),
    );
    expect(nextState.undoStack).toStrictEqual([command]);
    expect(nextState.redoStack).toStrictEqual([]);
  });
});

describe("execute editor command — undo and redo resize", () => {
  test("undoes and redoes resize commands preserving original map data", () => {
    const beforeTileMapData = createTileMapData({
      height: MAP_SIZE_4,
      width: MAP_SIZE_4,
    });
    const afterTileMapData = createTileMapData({
      height: MAP_SIZE_9,
      width: MAP_SIZE_9,
    });
    const command = createResizeMapCommand({
      afterTileMapData,
      beforeTileMapData,
    });
    const quiltState = createQuiltState({ tileMapData: beforeTileMapData });
    const resizedState = executeEditorCommand(quiltState, command);
    const undoneState = undoEditorCommand(resizedState);
    const redoneState = redoEditorCommand(undoneState);

    assertResizeUndoRedo({
      afterTileMapData,
      beforeTileMapData,
      command,
      redoneState,
      undoneState,
    });
  });
});
