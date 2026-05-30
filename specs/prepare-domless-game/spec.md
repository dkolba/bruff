# Prepare DOMless Game - Spec

## Goal

Decouple the reusable game package surface from DOM and browser evaluation so `@bruff/cli` can run Bruff through Node.js and render it with an ANSI terminal renderer. The browser custom-element flow remains the default and primary import path via `@bruff/game`; the new Node-safe path is an explicit second export target for headless simulation and render data.

## User-Visible Behaviour

- Browser users keep importing `@bruff/game` to define `<bruff-game>` and run the canvas loop.
- Terminal users can import a new DOM-free game export from `@bruff/game/headless` without evaluating `customElements`, `document`, `window`, `CanvasRenderingContext2D`, `requestAnimationFrame`, or `@bruff/game-element`.
- `@bruff/cli` can create an initial game state, normalise keyboard input, advance deterministic frames, and project renderable board data through the new public game export.
- The CLI renderer can render the real game state instead of the current mock scene without deep-importing `packages/game/lib/**`.
- The CLI can run and debug the headless game from TypeScript source in the pnpm workspace without first compiling `@bruff/game` to `dist`.
- Terminal arrow escape sequences (`\u001B[A`, `\u001B[B`, `\u001B[C`, and `\u001B[D`) normalise through the same input API as browser arrow key names.
- Existing replay determinism and browser test-mode behaviour remain unchanged.
- Existing browser rendering remains the preferred distribution mode; the headless export is additive and opt-in.

## Out Of Scope

- Replacing the browser canvas renderer with terminal rendering.
- Moving DOM, Canvas, RAF, touch, or test API code out of `packages/game/lib/effects/` except where needed to isolate package exports.
- Introducing a runtime dependency from `@bruff/game` to `@bruff/cli` or from pure game layers to Node built-ins.
- Adding a full terminal game loop, resize handling, alternate screen mode, mouse reporting, or save/load UI in this spec.
- Reworking the tactical rules, board size, enemy AI, replay fixture format, or `GameState.stateVersion`.
- Publishing a stable external API beyond the monorepo-facing `@bruff/game/headless` target.
- Requiring `tsx`, `ts-node`, Babel, Vite runtime transforms, or a prebuild step for the CLI development path.

## Open Questions

None. The spec resolves the main ambiguity by making `@bruff/game` the browser-first export and `@bruff/game/headless` the second DOM-free export. The CLI may import only this public subpath, not internal game files.

## Edge Cases

- Importing `@bruff/game/headless` in Node must not fail when `window`, `document`, `customElements`, `HTMLElement`, `CanvasRenderingContext2D`, and `requestAnimationFrame` are absent.
- Importing `@bruff/game/headless` must not register `<bruff-game>` or start a browser loop.
- Running `@bruff/cli` in this pnpm workspace must load `@bruff/game/headless` from source through the `bruff-source` export condition, not stale ignored `dist` output.
- Importing `@bruff/game` in a browser must continue to register `<bruff-game>` and start the current canvas loop exactly once.
- The headless API must preserve deterministic state transitions for identical seeds and input sequences.
- Terminal render projection must handle render-only frames with no queued input without incrementing `frameIndex`, matching current game semantics.
- CLI keyboard input must reuse the same normalisation vocabulary as browser keyboard and touch input.
- `@bruff/cli` must not depend on browser test providers, Playwright, Vitest, Vite runtime transforms, or DOM globals.
- Browser bundle output must still include the browser entry and must not require Node built-ins.
