/* eslint-disable sort-imports -- Imports are grouped by reducer dependency role. */
import { cellForAction, isCellInsideBoard } from "./grid.js";
import { isCellOccupiedByEnemy } from "./occupancy.js";
import type { GameAction, InputAction } from "../core/actions.ts";
import type { GameState, GridCell } from "../core/types.ts";

const isGridMoveBlocked = (state: GameState, destination: GridCell): boolean =>
  !isCellInsideBoard(destination, state.board) ||
  isCellOccupiedByEnemy(destination, state.enemies);

const applyAcceptedGridMove = (
  state: GameState,
  destination: GridCell,
): GameState => ({
  ...state,
  player: {
    ...state.player,
    cell: destination,
  },
  playerMoved: true,
});

const applyGridMove = (state: GameState, action: InputAction): GameState => {
  const destination = cellForAction(state.player.cell, action);
  if (isGridMoveBlocked(state, destination)) {
    return state;
  }

  return applyAcceptedGridMove(state, destination);
};

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
      return applyGridMove(state, action);
    }
    case "move-down": {
      return applyGridMove(state, action);
    }
    case "move-left": {
      return applyGridMove(state, action);
    }
    case "move-right": {
      return applyGridMove(state, action);
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
