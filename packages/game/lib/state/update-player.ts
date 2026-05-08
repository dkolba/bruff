import { PLAYER_SIZE, PLAYER_SPEED, ZERO } from "../core/constants.js";
import { clamp } from "@bruff/utils";
import type { GameAction } from "../core/actions.ts";
import type { GameState } from "../core/types.ts";

const applyDelta = (state: GameState, dx: number, dy: number): GameState => ({
  ...state,
  player: {
    ...state.player,
    xPos: clamp(state.player.xPos + dx, ZERO, state.canvas.width - PLAYER_SIZE),
    yPos: clamp(
      state.player.yPos + dy,
      ZERO,
      state.canvas.height - PLAYER_SIZE,
    ),
  },
  playerMoved: true,
});

/**
 * Pure reducer for player movement. Maps each {@link GameAction}
 * variant to a new {@link GameState}; the `tick` arm is a no-op
 * (enemies are advanced in `updateEnemies`). The `default` arm uses
 * a `never`-typed assignment so the compiler errors when a new
 * {@link GameAction} variant is added without a matching case
 * (per A-19).
 *
 * @param state - The current game state
 * @param action - The action to apply
 * @returns A new game state with the player position updated
 */
const updatePlayer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "move-up": {
      return applyDelta(state, ZERO, -PLAYER_SPEED);
    }
    case "move-down": {
      return applyDelta(state, ZERO, PLAYER_SPEED);
    }
    case "move-left": {
      return applyDelta(state, -PLAYER_SPEED, ZERO);
    }
    case "move-right": {
      return applyDelta(state, PLAYER_SPEED, ZERO);
    }
    case "tick": {
      return state;
    }
    /* c8 ignore start -- unreachable per A-19 exhaustiveness check */
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
    /* c8 ignore stop */
  }
};

export default updatePlayer;
