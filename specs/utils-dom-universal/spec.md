# Utils DOM and Universal Exports

## Goal

Split `@bruff/utils` into two explicit consumer-facing export surfaces: a universal surface that is safe to import from Node.js CLI tools and browser code, and a DOM surface that contains only utilities whose behavior explicitly depends on browser DOM, canvas, observer, or animation APIs. The split should make environment requirements visible at import time so Node packages can use shared utilities without accidentally loading browser-only globals.

## User-visible Behaviour

- Consumers that run in Node.js can import the universal utilities from a documented `@bruff/utils` export without evaluating code that references DOM-only globals such as `document`, `window`, `CustomEvent`, `ResizeObserver`, `HTMLCanvasElement`, `CanvasRenderingContext2D`, or `requestAnimationFrame`.
- Browser packages can import DOM-specific utilities from a documented `@bruff/utils` export that clearly signals its browser-only contract.
- Universal exports include reusable, environment-agnostic helpers such as functional composition, `Option`, `Result`, branding helpers, deterministic PRNG helpers, math helpers, direction helpers, color string helpers, and any logging primitives that can be implemented without DOM APIs.
- DOM exports include canvas lookup/context helpers, canvas resize observation/listening helpers, shadow-root lookup, canvas animation helpers, and any browser-only logging adapters or event transports that still require DOM APIs.
- Existing workspace packages have an obvious migration path from the current mixed root export to the correct universal or DOM export.
- The package documentation explains which export surface should be used by Node-only tools, browser shell code, and pure game/domain code.
- TypeScript consumers receive accurate types from each export surface without needing casts, ambient DOM assumptions in Node-only imports, or private module paths.

## Consumer Blast Radius

- `@bruff/game` is the largest source consumer. Most imports from `@bruff/utils` are universal and should stay on the root export, including `Brand`, `PrngState`, `brand`, `createPrng`, `nextId`, `Option`, `Result`, `ok`, `error`, `pipe`, `flatMapResult`, `isSome`, `isNone`, `clamp`, `getCardinalDirection`, and `log`.
- `@bruff/game` has DOM-only imports in effects-layer files. `packages/game/lib/effects/curtain-up.ts` must move canvas, resize, and shadow-root helpers to the DOM export. `packages/game/lib/effects/frame-step-driver.ts` must move `radiatingBarsBackgroundAnimation` to the DOM export.
- `@bruff/game` tests that mock the current mixed root export are affected when the production file imports DOM helpers from a different module. `packages/game/lib/effects/curtain-up.test.ts` and `packages/game/lib/effects/loop.test.ts` need explicit treatment for the split exports.
- `@bruff/game-element` has one mixed production import in `packages/game-element/module/game-element.ts`: `onLog` remains universal and `consoleLogHandler` moves to the DOM export. Its tests may keep importing `log` from the universal root.
- `@bruff/sigil` imports only universal `Result` helpers from `@bruff/utils`; no source migration is expected there, but its typecheck and tests still verify that Node/browser-neutral root imports remain compatible in a browser tool package.
- `@bruff/arcade` does not source-import `@bruff/utils`, but `packages/arcade/vite.config.ts` explicitly excludes `@bruff/utils` from Vite dependency optimization. The implementation must verify whether `@bruff/utils/dom` also needs to be excluded once `@bruff/game` imports the DOM subpath.
- Package-specific architecture docs that mention `@bruff/utils` as a shell service boundary must be updated so future code knows when to use `@bruff/utils` versus `@bruff/utils/dom`.

## Out of Scope

- Creating a new package name separate from `@bruff/utils`.
- Changing the observable behavior of individual utility functions beyond what is necessary to remove accidental DOM dependencies from the universal surface.
- Replacing the current test framework or changing browser coverage strategy.
- Moving game-specific logic into `@bruff/utils`.
- Introducing third-party runtime dependencies for the export split.
- Removing DOM utilities from the monorepo.

## Resolved Assumptions

- The split is about public package export surfaces, not about duplicating utilities across packages.
- Node.js CLI consumers must be able to import universal utilities in environments that do not provide browser DOM globals.
- Browser consumers may still use the universal export for pure helpers when no DOM-specific utility is needed.
- DOM-only utilities are allowed to keep browser-specific types and runtime dependencies because those requirements are made explicit by their export surface.
- Backward compatibility for existing root imports is a design concern to resolve in `design.md`; this spec only requires that the final import contract is documented and migration is clear.

## Open Questions

None. The remaining choices, including exact export path names and compatibility strategy for the current root export, belong in the Design phase.

## Edge Cases

- Importing the universal surface in a Node.js CLI process must not fail at module evaluation time because `CustomEvent`, `document`, `ResizeObserver`, or canvas APIs are absent.
- Type-only imports from the universal surface must not pull DOM-only runtime modules into Node.js output.
- A DOM utility that internally imports universal helpers must not force universal helpers to depend back on DOM modules.
- A browser package that imports both surfaces must not receive duplicate or conflicting implementations of shared types such as `Result`, `Option`, `Brand`, or log event payloads.
- Tests must catch accidental DOM leakage into the universal surface, including transitive exports from barrel files.
- Documentation must prevent ambiguous imports where a consumer cannot tell whether a utility is universal or DOM-only.
- The split must still support current browser packages that need both pure helpers and DOM/canvas helpers in the same runtime.
- Browser-only shell packages that still import universal helpers must not be forced onto the DOM export merely because they run in a browser.
- Bundler configuration must not accidentally prebundle or duplicate the new DOM subpath differently from the root workspace package.

## Verification

- Universal root import safety was verified with `pnpm --filter @bruff/utils run test:node`, which imports `@bruff/utils` in a Node test environment and exercises representative universal exports including `ok`, `pipe`, `createPrng`, `clamp`, `getCardinalDirection`, `brand`, `log`, and `onLog`.
- DOM helper behavior remained covered by the existing browser utilities suite. `pnpm --filter @bruff/utils run test` passed across Chromium, Firefox, and WebKit with 100% coverage.
- Utils package quality gates passed with `pnpm --filter @bruff/utils run format`, `pnpm --filter @bruff/utils run lint`, and `pnpm --filter @bruff/utils run typecheck`.
- `@bruff/game` consumer migration was verified with `pnpm --filter @bruff/game run lint`, `pnpm --filter @bruff/game run typecheck`, and `pnpm --filter @bruff/game run test:unit:chromium`.
- `@bruff/game-element` consumer migration was verified with `pnpm --filter @bruff/game-element run lint`, `pnpm --filter @bruff/game-element run typecheck`, and `pnpm --filter @bruff/game-element run test:chromium`.
- `@bruff/sigil` universal-root compatibility was verified with `pnpm --filter @bruff/sigil run lint`, `pnpm --filter @bruff/sigil run typecheck`, and `pnpm --filter @bruff/sigil run test:chromium`.
- `@bruff/arcade` Vite dependency handling was verified with `pnpm --filter @bruff/arcade run lint`, `pnpm --filter @bruff/arcade run typecheck`, and `pnpm --filter @bruff/arcade run build`.
- The `review-architecture-docs` skill found and corrected durable guidance drift in the root workspace map, the `verify-layers` skill, and the older event-bus design note.
- Final repo verification passed with `pnpm run ok`.
