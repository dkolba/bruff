import type { GameAction } from "../core/actions.ts";
import type { GameState } from "../core/types.ts";
import { moveEnemyTowardPlayer } from "./move-enemy-toward-player.js";

/**
 * Pure reducer for enemy movement. Runs the chase logic only on
 * a `tick` action; movement input variants leave enemies unchanged
 * (they are handled by `updatePlayer`). The `default` arm uses a
 * `never`-typed assignment so the compiler errors when a new
 * {@link GameAction} variant is added without a matching case
 * (per A-19).
 *
 * @param state - The current game state
 * @param action - The action to apply
 * @returns A new game state with enemy positions updated on tick,
 *   unchanged otherwise
 */
export const updateEnemies = (
  state: GameState,
  action: GameAction,
): GameState => {
  switch (action.type) {
    case "tick": {
      const { canvas, enemies, player } = state;
      const updatedEnemies = enemies.map((enemy) =>
        moveEnemyTowardPlayer(enemy, player, canvas),
      );
      return { ...state, enemies: updatedEnemies };
    }
    case "move-down":
    case "move-left":
    case "move-right":
    case "move-up": {
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
