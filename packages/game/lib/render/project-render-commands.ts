import type { Board, CanvasSize, GameState, GridCell } from "../core/types.ts";
import type { RenderCommand } from "../core/actions.ts";

const PLAYER_COLOR = "blue";
const ENEMY_COLOR = "red";

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

const playerRenderCommand = (state: GameState): RenderCommand =>
  state.board === undefined || state.player.cell === undefined
    ? {
        color: PLAYER_COLOR,
        height: state.player.size,
        type: "fill-rect",
        width: state.player.size,
        xPos: state.player.xPos,
        yPos: state.player.yPos,
      }
    : cellRenderCommand(state.player.cell, {
        board: state.board,
        canvas: state.canvas,
        color: PLAYER_COLOR,
      });

const enemyRenderCommand =
  (state: GameState) =>
  (enemy: GameState["enemies"][number]): RenderCommand =>
    state.board === undefined || enemy.cell === undefined
      ? {
          color: ENEMY_COLOR,
          height: enemy.size,
          type: "fill-rect",
          width: enemy.size,
          xPos: enemy.xPos,
          yPos: enemy.yPos,
        }
      : cellRenderCommand(enemy.cell, {
          board: state.board,
          canvas: state.canvas,
          color: ENEMY_COLOR,
        });

/**
 * Projects a state snapshot into ordered foreground render commands.
 *
 * @param state - The state snapshot to project
 */
export const projectRenderCommands = (
  state: GameState,
): ReadonlyArray<RenderCommand> => [
  playerRenderCommand(state),
  ...state.enemies.map(enemyRenderCommand(state)),
];
