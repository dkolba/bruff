import type {
  EditorCommand,
  PaintTileChange,
} from "../commands/editor-command.ts";
import {
  chunkCoordinateKey,
  getChunkCoordinate,
  setTile,
  type TileMapData,
} from "../model/tile-map-data.ts";
import type { QuiltState } from "./quilt-state.ts";

const LAST_ITEM_OFFSET = 1;
const EMPTY_STACK_LENGTH = 0;

const getDirtyChunkKey = (chunkSize: number, change: PaintTileChange): string =>
  chunkCoordinateKey(getChunkCoordinate(change.coordinate, chunkSize));

const getPaintDirtyChunks = (
  quiltState: QuiltState,
  editorCommand: { changes: ReadonlyArray<PaintTileChange> },
): ReadonlySet<string> =>
  new Set(
    editorCommand.changes.map((change) =>
      getDirtyChunkKey(quiltState.tileMapData.chunkSize, change),
    ),
  );

const getResizeDirtyChunks = (editorCommand: {
  afterTileMapData: TileMapData;
}): ReadonlySet<string> =>
  new Set(editorCommand.afterTileMapData.chunks.keys());

const getDirtyChunks = (
  quiltState: QuiltState,
  editorCommand: EditorCommand,
): ReadonlySet<string> =>
  editorCommand.type === "RESIZE_MAP"
    ? getResizeDirtyChunks(editorCommand)
    : getPaintDirtyChunks(quiltState, editorCommand);

const applyEditorCommand = (
  tileMapData: TileMapData,
  editorCommand: EditorCommand,
): TileMapData =>
  editorCommand.type === "RESIZE_MAP"
    ? editorCommand.afterTileMapData
    : editorCommand.changes.reduce(
        (nextTileMapData, change) =>
          setTile({
            layerId: change.layerId,
            tileCoordinate: change.coordinate,
            tileId: change.afterTileId,
            tileMapData: nextTileMapData,
          }),
        tileMapData,
      );

const undoAppliedCommand = (
  tileMapData: TileMapData,
  editorCommand: EditorCommand,
): TileMapData =>
  editorCommand.type === "RESIZE_MAP"
    ? editorCommand.beforeTileMapData
    : editorCommand.changes.reduce(
        (nextTileMapData, change) =>
          setTile({
            layerId: change.layerId,
            tileCoordinate: change.coordinate,
            tileId: change.beforeTileId,
            tileMapData: nextTileMapData,
          }),
        tileMapData,
      );

const getLastCommand = (
  editorCommands: ReadonlyArray<EditorCommand>,
): EditorCommand | undefined => editorCommands.at(-LAST_ITEM_OFFSET);

/** Applies an editor command to Quilt state and pushes it onto undo history. */
export const executeEditorCommand = (
  quiltState: QuiltState,
  editorCommand: EditorCommand,
): QuiltState => {
  const tileMapData = applyEditorCommand(quiltState.tileMapData, editorCommand);

  return {
    ...quiltState,
    dirtyChunks: getDirtyChunks(quiltState, editorCommand),
    redoStack: [],
    tileMapData,
    undoStack: [...quiltState.undoStack, editorCommand],
  };
};

/** Undoes the latest editor command when one exists. */
export const undoEditorCommand = (quiltState: QuiltState): QuiltState => {
  const editorCommand = getLastCommand(quiltState.undoStack);

  return editorCommand === undefined
    ? quiltState
    : {
        ...quiltState,
        dirtyChunks: getDirtyChunks(quiltState, editorCommand),
        redoStack: [...quiltState.redoStack, editorCommand],
        tileMapData: undoAppliedCommand(quiltState.tileMapData, editorCommand),
        undoStack: quiltState.undoStack.slice(
          EMPTY_STACK_LENGTH,
          -LAST_ITEM_OFFSET,
        ),
      };
};

/** Redoes the latest undone editor command when one exists. */
export const redoEditorCommand = (quiltState: QuiltState): QuiltState => {
  const editorCommand = getLastCommand(quiltState.redoStack);

  return editorCommand === undefined
    ? quiltState
    : {
        ...quiltState,
        dirtyChunks: getDirtyChunks(quiltState, editorCommand),
        redoStack: quiltState.redoStack.slice(
          EMPTY_STACK_LENGTH,
          -LAST_ITEM_OFFSET,
        ),
        tileMapData: applyEditorCommand(quiltState.tileMapData, editorCommand),
        undoStack: [...quiltState.undoStack, editorCommand],
      };
};
