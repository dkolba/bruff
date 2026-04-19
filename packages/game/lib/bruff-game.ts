import { GameElement } from "./game-element.js";
import loop from "./loop.js";

/**
 * A class to represent the bruff game web component
 */
class BruffGame extends GameElement {}

if (!customElements.get("bruff-game")) {
  customElements.define("bruff-game", BruffGame);
  console.info(`bruff game component v${__APP_VERSION__} was defined`);
}

export default BruffGame;

loop();
