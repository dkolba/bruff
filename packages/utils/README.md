# @bruff/utils

A collection of reusable utility functions shared across the monorepo.

## Exports

### `@bruff/utils`

The root export is universal. It is safe for Node.js CLI code and browser code, and must not depend on DOM globals.

Use it for functional helpers, `Option`, `Result`, deterministic PRNG helpers, math helpers, direction helpers, color helpers, branded types, and the process-local log event bus.

### `@bruff/utils/dom`

The DOM export is browser-only. Use it only from shell code that explicitly needs DOM, Canvas, resize observer, animation, or console APIs.

Use it for canvas lookup/context helpers, canvas resize helpers, shadow-root lookup, canvas background animation, and `consoleLogHandler`.

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

Import from `@bruff/utils/dom`.

#### `getCanvas(shadowRoot)`

Returns the `<canvas>` element from a shadow root.

#### `getCanvasContext(canvas)`

Returns the `CanvasRenderingContext2D` for a canvas.

#### `createCanvasResizeObserver(canvas, context)`

Creates and immediately starts a `ResizeObserver` that keeps `canvas.width` / `canvas.height` in sync with the element's CSS dimensions. Dispatches a custom `"elementResized"` event with `{ width, height }` on each resize.

#### `canvasResizeListener(canvas)`

Attaches a listener for the `"elementResized"` custom event. Returns a cleanup function.

---

### DOM

Import from `@bruff/utils/dom`.

#### `getShadowGameRoot(selector)`

Returns the `ShadowRoot` of the first element matching `selector`.

---

### Animation

Import from `@bruff/utils/dom`.

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
pnpm run test:node               # Node-only universal export smoke test
pnpm run test:watch              # Watch mode
```

## Event bus

`@bruff/utils` provides a process-local log event bus:

- `log(event)` emits a log event with `level`, `message`, and optional `source`/`context`.
- `onLog(handler)` subscribes to log events and returns an unsubscribe function.
- `consoleLogHandler(event)` is exported from `@bruff/utils/dom` and forwards a log event to the matching `console` method.
- `LogLevel` is one of `"debug" | "info" | "warn" | "error"`.
- `LogEvent` is the readonly payload type emitted and consumed by the log bus.
