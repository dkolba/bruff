/**
 * Gets the game's shadow root element
 *
 * @param gameRoot - The selector for the game root element
 * @returns The shadow root of the game element
 * @throws Error - If the game root element is not found
 */
export const getShadowGameRoot = (gameRoot: string): ShadowRoot => {
  const gameElement = document.querySelector(gameRoot);
  if (!gameElement?.shadowRoot) {
    throw new Error("Game root element not found");
  }
  return gameElement.shadowRoot;
};
