import { GameElement } from "./game-element.js";
import loop from "./loop.js";

/**
 * A class to represent the bruff game web component
 */
class BruffGame extends GameElement {}

if (!customElements.get("bruff-game")) {
  customElements.define("bruff-game", BruffGame);
  console.warn("bruff game component was defined");
}

export default BruffGame;

loop();
