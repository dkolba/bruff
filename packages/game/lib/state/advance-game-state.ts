import type { GameAction, InputAction } from "../core/actions.ts";
import type { GameState } from "../core/types.ts";
import { updateEnemies } from "./update-enemies.js";
import updatePlayer from "./update-player.js";

const FRAME_INDEX_INCREMENT = 1;
const NO_INPUTS = 0;

/**
 * Applies one logical simulation tick.
 *
 * @param state - The state at the start of the tick
 * @param inputs - Normalised inputs queued before this tick
 * @returns The state after all queued inputs and the tick action
 */
export const advanceGameState = (
  state: GameState,
  inputs: ReadonlyArray<InputAction>,
): GameState => {
  if (inputs.length === NO_INPUTS) {
    return state;
  }

  const actions: ReadonlyArray<GameAction> = [...inputs, { type: "tick" }];
  const nextState = actions.reduce<GameState>(
    (currentState, action) =>
      updateEnemies(updatePlayer(currentState, action), action),
    { ...state, input: [], playerMoved: false },
  );

  return {
    ...nextState,
    frameIndex: state.frameIndex + FRAME_INDEX_INCREMENT,
  };
};
