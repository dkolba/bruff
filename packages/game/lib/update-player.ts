/* eslint-disable unicorn/switch-case-braces */
import { PLAYER_SIZE, PLAYER_SPEED, ZERO } from "./constants.js";
import clamp from "./helpers/clamp.js";
import type { GameState } from "../types/game-state-type.ts";

const getMovementDelta = (
  key: string | undefined,
): { dx: number; dy: number } => {
  let dx = 0;
  let dy = 0;

  switch (key) {
    case "arrowup":
    case "north":
    case "w":
      dy = -PLAYER_SPEED;
      break;
    case "arrowdown":
    case "south":
    case "s":
      dy = PLAYER_SPEED;
      break;
    case "arrowleft":
    case "west":
    case "a":
      dx = -PLAYER_SPEED;
      break;
    case "arrowright":
    case "east":
    case "d":
      dx = PLAYER_SPEED;
      break;
    default:
  }

  return { dx, dy };
};

const updatePlayer = (state: GameState): GameState => {
  const [keyEvent, ...restInput] = state.input;
  const key = keyEvent?.toLowerCase();
  const { xPos, yPos } = state.player;
  const { dx, dy } = getMovementDelta(key);

  const updatedXcoord = clamp(
    xPos + dx,
    ZERO,
    state.canvas.width - PLAYER_SIZE,
  );
  const updatedYcoord = clamp(
    yPos + dy,
    ZERO,
    state.canvas.height - PLAYER_SIZE,
  );

  return {
    ...state,
    input: restInput,
    player: { ...state.player, xPos: updatedXcoord, yPos: updatedYcoord },
    playerMoved: dx !== ZERO || dy !== ZERO,
  };
};

export default updatePlayer;
