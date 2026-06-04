# Utils DOM and Universal Exports Design

## Layer Assignment

| Area                    | Files                                                                                                                                                                                                          | Runtime contract                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Universal public export | `packages/utils/index.ts`                                                                                                                                                                                      | Node.js and browser safe. No imports from DOM-only modules.                                           |
| DOM public export       | `packages/utils/dom.ts`                                                                                                                                                                                        | Browser-only utilities that depend on DOM, canvas, resize observer, animation, or browser event APIs. |
| Universal helpers       | `packages/utils/module/fp/**`, `packages/utils/module/math/**`, `packages/utils/module/direction/**`, `packages/utils/module/color/**`, `packages/utils/module/types/**`, `packages/utils/module/event-bus/**` | Pure or environment-agnostic shared helpers.                                                          |
| DOM helpers             | `packages/utils/module/canvas/**`, `packages/utils/module/get-shadow-game-root.ts`, `packages/utils/module/animation/**`                                                                                       | Browser shell helpers.                                                                                |
| Package metadata        | `packages/utils/package.json`, `packages/utils/tsconfig.json`                                                                                                                                                  | Declares documented subpath exports and includes new entrypoints/tests.                               |
| Consumers               | `packages/game/**`, `packages/game-element/**`, `packages/sigil/**`                                                                                                                                            | Imports universal helpers from `@bruff/utils`; imports DOM helpers from `@bruff/utils/dom`.           |
| E2E host config         | `packages/arcade/vite.config.ts`                                                                                                                                                                               | Verifies the DOM subpath follows the same workspace dependency handling as the root utils package.    |

`packages/utils` is not split into multiple packages. The split is a package export boundary inside the existing workspace package.

## Public API Surface

The root export stays universal:

```ts
// @bruff/utils
export { log, onLog } from "./module/event-bus/event-bus.js";
export type { LogEvent } from "./module/event-bus/log-event.js";
export type { LogLevel } from "./module/event-bus/log-level.js";
export {
  flatMapOption,
  isNone,
  isSome,
  mapOption,
  none,
  type None,
  type Option,
  type Some,
  some,
  toResult,
} from "./module/fp/option.js";
export { pipe } from "./module/fp/pipe.js";
export {
  createPrng,
  nextId,
  nextNumber,
  type PrngState,
} from "./module/fp/prng.js";
export {
  error,
  type Failure,
  flatMapResult,
  isError,
  isOk,
  mapError,
  mapResult,
  ok,
  type Ok,
  type Result,
  unwrapOr,
} from "./module/fp/result.js";
export { clamp } from "./module/math/clamp.js";
export { hsla } from "./module/color/hsla.js";
export { getCardinalDirection } from "./module/direction/get-cardinal-direction.js";
export { brand, type Brand } from "./module/types/brand.js";
```

The DOM export contains browser-only helpers:

```ts
// @bruff/utils/dom
export { consoleLogHandler } from "./module/event-bus/console-log-handler.js";
export { canvasResizeListener } from "./module/canvas/canvas-resize-listener.js";
export { createCanvasResizeObserver } from "./module/canvas/create-canvas-resize-observer.js";
export { getCanvas } from "./module/canvas/get-canvas.js";
export { getCanvasContext } from "./module/canvas/get-canvas-context.js";
export { getShadowGameRoot } from "./module/get-shadow-game-root.js";
export { radiatingBarsBackgroundAnimation } from "./module/animation/radiating-bars-background-animation.js";
```

`packages/utils/package.json` declares both entrypoints so consumers do not import private module paths:

```json
{
  "main": "index.ts",
  "exports": {
    ".": "./index.ts",
    "./dom": "./dom.ts"
  }
}
```

## Data Shape Changes

No `GameState` shape changes are needed.

No new branded ID types are needed.

No action variants are needed.

The `LogEvent`, `LogLevel`, `Option`, `Result`, `Brand`, and `PrngState` type shapes remain unchanged.

## Event Bus Refactor

`packages/utils/module/event-bus/event-bus.ts` currently depends on `EventTarget` and `CustomEvent`. That makes the root barrel unsafe as the universal export. Replace the transport with an environment-agnostic in-memory subscriber list hidden inside the module.

Required behavior stays the same:

- `log(event)` synchronously emits the event to current subscribers.
- `onLog(handler)` registers a handler and returns an unsubscribe function.
- Calling the unsubscribe function removes only that handler.
- Unsubscribing more than once is harmless.
- One subscriber failure must not require a DOM event transport to preserve delivery semantics. If existing tests expose a current behavior here, preserve the tested behavior unless it conflicts with exception-free package rules.

`packages/utils/module/event-bus/is-log-custom-event.ts` becomes DOM-only dead code after this refactor unless a DOM utility still needs it. Remove it if unused after the event bus stops using `CustomEvent`.

## Consumer Migration

Pure and Node-capable imports remain on `@bruff/utils`:

```ts
import { error, ok, type Result } from "@bruff/utils";
```

DOM imports move to `@bruff/utils/dom`:

```ts
import { getCanvas, getCanvasContext } from "@bruff/utils/dom";
```

Mixed files use two imports:

```ts
import { flatMapResult, ok, pipe, type Result } from "@bruff/utils";
import {
  canvasResizeListener,
  createCanvasResizeObserver,
  getCanvas,
  getCanvasContext,
  getShadowGameRoot,
} from "@bruff/utils/dom";
```

Current known migration targets:

| File                                                | Universal import                        | DOM import                                                                                                 |
| --------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `packages/game/lib/effects/curtain-up.ts`           | `flatMapResult`, `ok`, `pipe`, `Result` | `canvasResizeListener`, `createCanvasResizeObserver`, `getCanvas`, `getCanvasContext`, `getShadowGameRoot` |
| `packages/game/lib/effects/frame-step-driver.ts`    | none                                    | `radiatingBarsBackgroundAnimation`                                                                         |
| `packages/game-element/module/game-element.ts`      | `onLog`                                 | `consoleLogHandler`                                                                                        |
| `packages/game-element/module/game-element.test.ts` | `log`                                   | none                                                                                                       |

Tests that mock `@bruff/utils` and use type namespace imports may need explicit mocks for `@bruff/utils/dom` when the code under test imports DOM helpers from the new subpath.

### Blast Radius by Package

| Package               | Source impact                                                                                                                                           | Test/config/doc impact                                                                                                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@bruff/game`         | Split DOM imports in `packages/game/lib/effects/curtain-up.ts` and `packages/game/lib/effects/frame-step-driver.ts`; keep root imports everywhere else. | Update mocks in `packages/game/lib/effects/curtain-up.test.ts` and `packages/game/lib/effects/loop.test.ts`; update `packages/game/AGENTS.md` to document `@bruff/utils/dom` as effects-only.                    |
| `@bruff/game-element` | Split `packages/game-element/module/game-element.ts` so `onLog` comes from `@bruff/utils` and `consoleLogHandler` comes from `@bruff/utils/dom`.        | Keep `packages/game-element/module/game-element.test.ts` importing `log` from the root; update `packages/game-element/AGENTS.md` and `packages/game-element/README.md`.                                          |
| `@bruff/sigil`        | No source import migration expected; current imports use `Result`, `ok`, and `error`, which remain universal.                                           | Run package gates to prove browser tool code still resolves the universal root export.                                                                                                                           |
| `@bruff/arcade`       | No source import migration expected.                                                                                                                    | Check `packages/arcade/vite.config.ts`; add `@bruff/utils/dom` to `optimizeDeps.exclude` if Vite treats the subpath separately from the linked root package. Run the arcade build or E2E gate if config changes. |

### Universal-only `@bruff/game` Imports

These files should continue importing from `@bruff/utils` because they use only universal helpers or types:

- `packages/game/lib/core/types.ts`
- `packages/game/lib/input/normalise-input.ts`
- `packages/game/lib/input/normalise-input.test.ts`
- `packages/game/lib/effects/entry.ts`
- `packages/game/lib/effects/entry.test.ts`
- `packages/game/lib/effects/loop.ts`
- `packages/game/lib/effects/loop.test.ts` for `error`, `log`, and `ok`
- `packages/game/lib/effects/observable/keydown.ts`
- `packages/game/lib/effects/observable/touch.ts`
- `packages/game/lib/effects/observable/touch.test.ts`
- `packages/game/lib/effects/render.test.ts`
- `packages/game/lib/effects/test-api/attach-test-api.test.ts`
- `packages/game/lib/render/project-render-commands.test.ts`
- `packages/game/lib/render/render-stats.test.ts`
- `packages/game/lib/state/advance-game-state.test.ts`
- `packages/game/lib/state/create-initial-state.ts`
- `packages/game/lib/state/move-enemy-toward-player.ts`
- `packages/game/lib/state/move-enemy-toward-player.test.ts`
- `packages/game/lib/state/replay-fixture.ts`
- `packages/game/lib/state/replay.test.ts`
- `packages/game/lib/state/run-replay.ts`
- `packages/game/lib/state/update-enemies.property.test.ts`
- `packages/game/lib/state/update-enemies.test.ts`
- `packages/game/lib/state/update-player.property.test.ts`
- `packages/game/lib/state/update-player.test.ts`
- `packages/game/lib/state/update-player.ts`

### Universal-only `@bruff/sigil` Imports

These files should continue importing from `@bruff/utils`:

- `packages/sigil/module/font-file.ts`
- `packages/sigil/module/glyph-name.ts`
- `packages/sigil/module/tool-sigil-state.ts`
- `packages/sigil/module/tool-sigil-state.test.ts`

## Reuse Map

- Reuse `packages/utils/index.ts` as the universal barrel after removing DOM-only re-exports.
- Reuse existing pure helper modules under `packages/utils/module/fp/`, `packages/utils/module/math/`, `packages/utils/module/direction/`, `packages/utils/module/color/`, and `packages/utils/module/types/`.
- Reuse existing DOM helper modules under `packages/utils/module/canvas/`, `packages/utils/module/animation/`, and `packages/utils/module/get-shadow-game-root.ts` through the new `packages/utils/dom.ts` barrel.
- Reuse `packages/utils/module/event-bus/log-event.ts` and `packages/utils/module/event-bus/log-level.ts` without shape changes.
- Reuse existing workspace consumer tests in `packages/game`, `packages/game-element`, and `packages/sigil` as migration coverage.

## Data Flow

```text
Node CLI / pure domain code
  -> @bruff/utils
     -> universal helpers only

Browser shell code
  -> @bruff/utils
     -> universal helpers
  -> @bruff/utils/dom
     -> DOM, canvas, observer, animation, console adapter
```

There is no dependency from the universal root export to the DOM subpath. DOM modules may depend on universal helpers.

## Tests

Add a Node-only import smoke test outside the browser runner so the universal contract is tested in a runtime without DOM globals. The test should import `@bruff/utils` and exercise representative exports such as `ok`, `pipe`, `createPrng`, `clamp`, `getCardinalDirection`, `brand`, `log`, and `onLog`.

Keep browser tests for DOM helpers in `packages/utils/module/canvas/**`, `packages/utils/module/animation/**`, and `packages/utils/module/get-shadow-game-root.test.ts`.

Run these gates before completion:

- `pnpm --filter @bruff/utils run format`
- `pnpm --filter @bruff/utils run lint`
- `pnpm --filter @bruff/utils run typecheck`
- `pnpm --filter @bruff/utils run test`
- Affected consumer package tests/typechecks for `@bruff/game`, `@bruff/game-element`, `@bruff/sigil`, and `@bruff/arcade`

## Tradeoffs

Chosen approach: keep `@bruff/utils` as the universal root and add `@bruff/utils/dom` for browser-only helpers.

Pros:

- Existing pure consumers and Node CLI packages get the safest default import path.
- The import path communicates environment requirements without reading implementation files.
- Workspace packages can migrate incrementally by moving only DOM helpers to the new subpath.

Cons:

- Existing browser files with mixed imports need two import declarations.
- Any external consumer using root DOM exports would need migration. The package is currently private, so this is acceptable.

Alternative considered: keep the current mixed root and add `@bruff/utils/universal`.

Pros:

- Fewer immediate changes for browser consumers that already import DOM helpers from the root.
- The current root barrel remains source-compatible.

Cons:

- The unsafe mixed root remains the obvious import path.
- Node packages must know to avoid the root export, which preserves the original hazard.

Alternative considered: create a separate package such as `@bruff/dom-utils`.

Pros:

- Strong physical package boundary between universal and browser-only utilities.
- Package dependencies could make environment ownership very explicit.

Cons:

- More package metadata, workspace wiring, and release surface for a small split.
- The current requirement is two exports, not two packages.
