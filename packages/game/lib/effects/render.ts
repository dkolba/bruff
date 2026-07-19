import type { GameState } from "../core/types.ts";
import { projectRenderCommands } from "../render/project-render-commands.js";
import { renderStatsForState } from "../render/render-stats.js";
import type { RenderStats } from "../render/render-stats.ts";
import { executeRenderCommands } from "./execute-render-command.js";

/**
Draws one frame from the given {@link GameState} onto the supplied
2D context. The function is deliberately effectful: it executes
render commands against the live Canvas context and therefore stays
in the `effects/` shell.

@param state - The state snapshot to draw
@param context - The 2D context to draw onto
*/
const render = (
  state: GameState,
  context: CanvasRenderingContext2D,
): RenderStats => {
  executeRenderCommands(context, projectRenderCommands(state));
  return renderStatsForState(state);
};

export default render;
