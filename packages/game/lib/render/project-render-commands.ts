import type { GameState } from "../core/types.ts";
import type { RenderCommand } from "../core/actions.ts";

/**
 * Projects a state snapshot into ordered foreground render commands.
 *
 * @param state - The state snapshot to project
 */
/* eslint-disable capitalized-comments -- V8 coverage directives are case-sensitive. */
/* v8 ignore start -- T1 adds the stub before T2 introduces coverage. */
export const projectRenderCommands = (
  state: GameState,
): ReadonlyArray<RenderCommand> =>
  state.enemies.flatMap((): ReadonlyArray<RenderCommand> => []);
/* v8 ignore stop */
/* eslint-enable capitalized-comments */
