# Prepare DOMless Game - Constraints

## Export Constraints

- `@bruff/game` remains the primary browser export.
- `@bruff/game/headless` is the only Node-safe game export introduced by this work.
- `@bruff/game/headless` exposes a `bruff-source` condition for workspace-native TypeScript consumers.
- `@bruff/cli` may import `@bruff/game/headless` only; it must not deep-import `packages/game/lib/**`.
- The headless export must not import `packages/game/lib/effects/**`.

## Dependency Constraints

- `@bruff/game` must not depend on `@bruff/cli`.
- Pure game layers and `lib/headless/**` must not import Node built-ins.
- `@bruff/cli` must keep native Node tests with `node:test` and `node:assert/strict`.
- `@bruff/cli` must not prebuild `@bruff/game` before running. It runs Node with `--conditions=bruff-source`, `--experimental-strip-types`, and `--experimental-transform-types`.
- Source files loaded by native Node through the `bruff-source` path must use `.ts` import specifiers along that runtime dependency graph.
- Shared TypeScript config must allow `.ts` import specifiers for native Node source loading.
- Browser code must not require Node built-ins or terminal modules.
- Terminal code must not require DOM globals or browser test providers.

## Behaviour Constraints

- No `GameState` shape change is allowed for this work.
- No `stateVersion` bump is allowed for this work.
- Existing replay fixtures and snapshots must remain valid.
- Render-only frames with no input must preserve current `frameIndex` semantics.
- The browser canvas entry must keep registering `<bruff-game>` exactly as it does today.

## API Constraints

- Headless API functions return values and do not own timers, listeners, DOM nodes, terminal ports, or mutable module state.
- CLI shell code owns process input/output ports and terminal lifecycle.
- Game render data exposes board cells and entity roles, not terminal glyphs or ANSI commands.
- CLI render data exposes terminal cells and ANSI commands, not game reducer internals.
- Input normalisation accepts browser key names, WASD/cardinal strings, and terminal arrow CSI sequences as values through the same `normaliseKey()` API.
