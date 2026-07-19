import type { InputAction } from "../core/actions.ts";
import type { GameState } from "../core/types.ts";
import { advanceGameState } from "../state/advance-game-state.ts";

/**
 * Advance a headless game state through the shared deterministic step path.
 */
export const stepHeadlessGame = (
  state: GameState,
  inputs: ReadonlyArray<InputAction>,
): GameState => advanceGameState(state, inputs);
