import type { Board, CanvasSize, GameState, GridCell } from "../core/types.ts";
import { projectRenderCells } from "./project-render-cells.js";
import type { RenderCellEntity } from "./project-render-cells.ts";
import type { RenderCommand } from "../core/actions.ts";

const PLAYER_COLOR = "blue";
const ENEMY_COLOR = "red";
const RENDER_CELL_COLORS: Readonly<Record<RenderCellEntity, string>> = {
  enemy: ENEMY_COLOR,
  player: PLAYER_COLOR,
};

type CellRenderContext = Readonly<{
  board: Board;
  canvas: CanvasSize;
  color: string;
}>;

const cellRenderCommand = (
  cell: GridCell,
  context: CellRenderContext,
): RenderCommand => {
  const cellWidth = context.canvas.width / context.board.columns;
  const cellHeight = context.canvas.height / context.board.rows;

  return {
    color: context.color,
    height: cellHeight,
    type: "fill-rect",
    width: cellWidth,
    xPos: cell.column * cellWidth,
    yPos: cell.row * cellHeight,
  };
};

const colorForEntity = (entity: RenderCellEntity): string =>
  RENDER_CELL_COLORS[entity];

/**
 * Projects a state snapshot into ordered foreground render commands.
 *
 * @param state - The state snapshot to project
 */
export const projectRenderCommands = (
  state: GameState,
): ReadonlyArray<RenderCommand> =>
  projectRenderCells(state).map((cell) =>
    cellRenderCommand(cell.cell, {
      board: state.board,
      canvas: state.canvas,
      color: colorForEntity(cell.entity),
    }),
  );
