import { error, ok, type Result } from "../universal/fp/result.ts";

/**
Gets the game's shadow root

@param gameRoot - The selector for the game-root element
@returns `ok` with the shadow root or
  `error("game-root-not-found")` when no element matches the
  selector or the matching element has no attached shadow root
*/
export const getShadowGameRoot = (
  gameRoot: string,
): Result<ShadowRoot, "game-root-not-found"> => {
  const gameElement = document.querySelector(gameRoot);
  return gameElement?.shadowRoot
    ? ok(gameElement.shadowRoot)
    : error("game-root-not-found");
};
