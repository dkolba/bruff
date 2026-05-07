# @bruff/game-element

A minimal Web Component base class that sets up a full-viewport canvas inside an open shadow DOM. Extend it to build a custom element with a ready-to-draw canvas — no boilerplate required.

## Usage

### Extending

```ts
import GameElement from "@bruff/game-element";

class MyGame extends GameElement {
  connectedCallback() {
    super.connectedCallback();
    const canvas =
      this.shadowRoot?.querySelector<HTMLCanvasElement>("#gamecanvas");
    // start rendering…
  }
}

customElements.define("my-game", MyGame);
```

### Direct use

```ts
import GameElement from "@bruff/game-element";

customElements.define("my-game", GameElement);
```

```html
<my-game></my-game>
```

## Architectural role

`GameElement` is the **imperative shell** in the Functional Core / Imperative Shell pattern. It is the only place where DOM side effects (shadow root creation, canvas mounting) are permitted. Pure game logic never touches the DOM — it receives the canvas reference as an explicit input and operates on it through the shell boundary.

## What it does

When the element is connected to the DOM, `connectedCallback` creates an open shadow root (if one doesn't already exist) and appends a template containing:

- A `<canvas id="gamecanvas">` sized to `window.innerWidth × window.innerHeight`
- Scoped CSS that sets `display: block` on the canvas to eliminate the default inline baseline gap

`connectedCallback` is idempotent — calling it multiple times will not recreate the shadow root.

## API

```ts
class GameElement extends HTMLElement {
  connectedCallback(): void;
  static template(): string; // returns the shadow DOM HTML string
}
```

The canvas is accessible after connection via:

```ts
element.shadowRoot?.querySelector<HTMLCanvasElement>("#gamecanvas");
```

## Development

```sh
pnpm run lint       # ESLint
pnpm run typecheck  # tsc
pnpm run format     # Prettier
```

## Testing

Tests run in real browsers via Vitest + Playwright:

```sh
pnpm run test        # Chromium, Firefox, WebKit with coverage
pnpm run test:watch  # Watch mode
```

Coverage thresholds are set at **100%** for branches, functions, lines, and statements.
