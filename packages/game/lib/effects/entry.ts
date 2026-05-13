import { GameElement } from "@bruff/game-element";
import { log } from "@bruff/utils";
import loop from "./loop.js";

if (!customElements.get("bruff-game")) {
  // eslint-disable-next-line wc/tag-name-matches-class -- GameElement is the generic shell class registered under the application-specific bruff-game tag; the class:tag mapping convention does not apply.
  customElements.define("bruff-game", GameElement);
  log({
    level: "info",
    message: `bruff game v${__APP_VERSION__} was defined`,
    source: "@bruff/game/effects/entry",
  });
}

loop();
