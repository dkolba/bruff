# @bruff/utils

A collection of pure, reusable utility functions shared across the monorepo.

## API

### Functional programming

#### `pipe(...fns)`

Composes functions left-to-right, threading a value through each step.

---

### Math

#### `clamp(value, min, max)`

Constrains `value` to the `[min, max]` range.

---

### Color

#### `hsla({ hue, saturation, lightness, alpha })`

Converts normalized HSLA values (each 0–1) to a CSS `hsla()` string.

---

### Direction

#### `getCardinalDirection(dx, dy)`

Maps a 2D direction vector to one of the 8 compass directions: `"NORTH"` `"NORTHEAST"` `"EAST"` `"SOUTHEAST"` `"SOUTH"` `"SOUTHWEST"` `"WEST"` `"NORTHWEST"`

---

### Canvas

#### `getCanvas(shadowRoot)`

Returns the `<canvas>` element from a shadow root. Throws if not found.

#### `getCanvasContext(canvas)`

Returns the `CanvasRenderingContext2D` for a canvas. Throws if the context cannot be obtained.

#### `createCanvasResizeObserver(canvas, context)`

Creates and immediately starts a `ResizeObserver` that keeps `canvas.width` / `canvas.height` in sync with the element's CSS dimensions. Dispatches a custom `"elementResized"` event with `{ width, height }` on each resize.

#### `canvasResizeListener(canvas)`

Attaches a listener for the `"elementResized"` custom event. Returns a cleanup function.

---

### DOM

#### `getShadowGameRoot(selector)`

Returns the `ShadowRoot` of the first element matching `selector`. Throws if the element or its shadow root is not found.

---

### Animation

#### `radiatingBarsBackgroundAnimation(context, timestamp)`

Draws an animated background of rotating, pulsing, colour-shifting bars radiating from the canvas centre. Intended to be called each frame from a `requestAnimationFrame` loop.

---

## Development

```sh
pnpm run lint         # ESLint
pnpm run typecheck    # tsc
pnpm run format       # Prettier
```

## Testing

Tests run in real browsers via Vitest + Playwright:

```sh
pnpm run test                    # Chromium, Firefox, WebKit with coverage
pnpm run test:chromium           # Single browser
pnpm run test:watch              # Watch mode
```
