import type { Board, GameState, GridCell } from "../core/types.ts";
import {
  projectRenderCells,
  type RenderCellEntity,
} from "../render/project-render-cells.ts";

/** Entity roles exposed to non-Canvas renderers. */
export type HeadlessFrameEntity = RenderCellEntity;

/** Renderer-neutral entity cell in a headless frame. */
export type HeadlessFrameCell = Readonly<{
  /** Board cell occupied by the entity. */
  cell: GridCell;
  /** Projected entity role. */
  entity: HeadlessFrameEntity;
}>;

/** DOM-free frame data for non-Canvas renderers. */
export type HeadlessFrame = Readonly<{
  /** Tactical board dimensions measured in cells. */
  board: Board;
  /** Foreground entity cells in draw order. */
  cells: ReadonlyArray<HeadlessFrameCell>;
  /** Logical simulation frame index. */
  frameIndex: number;
}>;

/** Project a game state into DOM-free frame data. */
export const projectHeadlessFrame = (state: GameState): HeadlessFrame => ({
  board: state.board,
  cells: projectRenderCells(state).map((cell) => ({
    cell: cell.cell,
    entity: cell.entity,
  })),
  frameIndex: state.frameIndex,
});
