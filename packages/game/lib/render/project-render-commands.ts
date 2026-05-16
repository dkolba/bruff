import type { GameState } from "../core/types.ts";
import type { RenderCommand } from "../core/actions.ts";

const PLAYER_COLOR = "blue";
const ENEMY_COLOR = "red";

/**
 * Projects a state snapshot into ordered foreground render commands.
 *
 * @param state - The state snapshot to project
 */
export const projectRenderCommands = (
  state: GameState,
): ReadonlyArray<RenderCommand> => [
  {
    color: PLAYER_COLOR,
    height: state.player.size,
    type: "fill-rect",
    width: state.player.size,
    xPos: state.player.xPos,
    yPos: state.player.yPos,
  },
  ...state.enemies.map(
    (enemy): RenderCommand => ({
      color: ENEMY_COLOR,
      height: enemy.size,
      type: "fill-rect",
      width: enemy.size,
      xPos: enemy.xPos,
      yPos: enemy.yPos,
    }),
  ),
];
