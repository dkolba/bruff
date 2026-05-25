# `@bruff/game` — Roguelike Game Architecture

This package contains the core game logic. The rules below apply to every file under `packages/game/`. Universal coding rules (FP, Result/Option error handling, naming, etc.) live in `.AGENTS.md`; the rules here are the package-specific extensions.

- **Language**: TypeScript with TSDoc annotations.
- **Dependencies**: `@bruff/utils` and `@bruff/game-element` only — no external runtime deps (per A-22).

## Layer Structure

Code must live in the correct layer. Dependencies flow strictly inward — later layers may depend on earlier ones but inner layers must never import outer layers, and no circular dependencies are allowed.

`@bruff/utils` imports are allowed where they provide shared pure helpers. The `log()` event-bus helper is shell-only: use it from `effects/` or the entry point, never from `core/`, `state/`, `input/`, or `render/`. `@bruff/utils/dom` imports are browser-shell utilities and are allowed only from `effects/` or tests for effects-layer code.

| Layer   | Location                     | May import from                                                        |
| ------- | ---------------------------- | ---------------------------------------------------------------------- |
| Core    | `packages/game/lib/core/`    | Nothing except shared `@bruff/utils` types/helpers                     |
| State   | `packages/game/lib/state/`   | `core/`, shared `@bruff/utils` helpers                                 |
| Input   | `packages/game/lib/input/`   | `core/`, `state/`, shared `@bruff/utils` helpers                       |
| Render  | `packages/game/lib/render/`  | `core/`, `state/`, shared `@bruff/utils` helpers                       |
| Effects | `packages/game/lib/effects/` | Shell wiring over inner layers, `@bruff/utils`, and `@bruff/utils/dom` |

### Dependency Rules

- **A-1 (MUST)** `core/` must have zero imports.
- **A-2 (MUST)** No circular dependencies.
- **A-3 (MUST)** Side effects (Canvas, DOM, I/O, logging emission) live only in `effects/` or the entry point.
- **A-4 (MUST)** Dependencies flow inward toward `core/` only.

## Pure Core / Impure Shell

- **A-5 (MUST)** All game logic (`core/`, `state/`, `input/`, `render/`) is pure: no DOM access, no `fetch`, no `Math.random()`, no `Date.now()`.
- **A-6 (MUST)** All side effects (Canvas draws, event listeners, timers, logging emission) live in `effects/` or the entry point only. Emit production logs through `log()` from `@bruff/utils`; do not call `console.*` directly in `packages/game`.

## State & Immutability

- **A-7 (MUST)** Single immutable global `GameState` object — no hidden or local state.
- **A-8 (MUST)** `GameState` includes a `stateVersion: number` for replay compatibility.
- **A-9 (MUST)** All state transitions are pure functions: `(state, action) => state` or `(state, inputs) => state` for full-frame stepping.
- **A-10 (MUST)** Zero mutation anywhere — no mutable variables, no array `.push()`, no object property assignment. Use spread for updates: `{ ...state, key: value }` and `[...arr, item]` are the canonical idioms.
- **A-10a (MUST)** `GameState` carries replay-critical `stateVersion`, `seed`, `prng`, and monotonic `frameIndex` fields. `frameIndex` increments exactly once per logical tick in the shared deterministic step path.

## Board, Movement & Occupancy

- **A-10b (MUST)** Gameplay positions are discrete `GridCell` values on `GameState.board`. New state logic must use `cell`, `grid.ts`, and `occupancy.ts` for movement and blockers, not actor `xPos` / `yPos`.
- **A-10c (MUST)** `Player` and `Enemy` do not carry actor `xPos` / `yPos`. Pixel coordinates belong only to render commands and raw browser input events.
- **A-10d (MUST)** Render projection derives foreground rectangles from `board`, `canvas`, and actor cells in `project-render-commands.ts`. Canvas pixel dimensions must not feed back into tactical movement.
- **A-10e (MUST)** Enemy grid movement resolves only after an accepted player move, in ascending `spawnOrder`, and must preserve the invariant that player and enemies do not end a valid transition on the same cell.

## Entity Identity

- **A-11 (MUST)** Every entity has a branded ID type: `Brand<string, "EntityNameId">`.
- **A-12 (MUST)** IDs are generated deterministically via the seeded PRNG stored in state — never `Math.random()` or `crypto.randomUUID()`.
- **A-13 (MUST)** IDs are never reused within a run.
- **A-14 (MUST)** `spawnOrder: number` is tracked on every entity for deterministic tie-breaking.

## Actions & Event System Taxonomy

All events that flow through the game loop must obey the following rules:

- **A-15 (MUST)** Define four action types/events as discriminated unions: `InputAction`, `GameAction`, `SystemEvent`, `RenderCommand`.
- **A-16 (MUST)** Tag field is always `type` — not `kind`, not `action`.
- **A-17 (MUST)** All input is normalised into `InputAction` before entering the core pipeline.
- **A-18 (MUST)** Actions are processed in a single FIFO queue per tick; `InputAction`s precede system-generated `GameAction`s.
- **A-19 (MUST)** Every `switch` over a discriminated union ends with a compile-time exhaustiveness guard. Domain code never throws — exhaustiveness is enforced by the type checker via the `never` assignment:
  ```ts
  default: {
    const _exhaustive: never = action;
    return _exhaustive; // unreachable; type error if any variant is unhandled
  }
  ```
  For reducers whose return type is not `never`-compatible, return the original state (or a `Result.error`) instead of `_exhaustive` — never `throw`.

## Determinism

- **A-20 (MUST)** All randomness must use a seeded PRNG stored in `GameState`. Never call `Math.random()` directly. Zero external entropy sources.
- **A-21 (MUST)** Time is a controlled input fed into the shell through the `Clock` ADT. Never read from `Date.now()` or `performance.now()` inside core, state, input, or render logic; `readClock()` in `effects/clock.ts` is the wall-clock boundary.
- **A-22 (MUST)** Fixed-timestep simulation — deterministic stepping goes through `createFrameStepDriver` / `advanceGameState`, never directly through `requestAnimationFrame`.

## Zero External Runtime Dependencies

- **A-23 (MUST)** `packages/game` has zero external runtime dependencies beyond `@bruff/utils`, `@bruff/game-element`, and browser built-ins. The `@bruff/utils/dom` subpath is part of `@bruff/utils` and remains effects-only.
- **A-24 (MUST)** All FP helpers, PRNG, and math utilities are implemented in-house in `@bruff/utils`.

## Rendering

- **A-25 (MUST)** Foreground entity rendering is a pure projection of `GameState` to `ReadonlyArray<RenderCommand>` in `packages/game/lib/render/project-render-commands.ts`. The render layer holds no internal state, no caches, no memoised scene graph, and no Canvas references.
- **A-26 (MUST)** Canvas execution of `RenderCommand` values lives only in `packages/game/lib/effects/execute-render-command.ts`. Other effects modules may orchestrate rendering, but they should not duplicate foreground entity draw calls.
- **A-27 (MUST)** Same `GameState` → same foreground `RenderCommand` sequence and same `RenderStats`. The animated background is shell-rendered before foreground commands and may depend on controlled `Clock` time through `effects/frame-step-driver.ts`.
- **A-28 (MUST)** Render code reports `RenderStats` through `renderStatsForState(state)` for test observability. The latest stats are owned by the effects-layer frame driver and exposed only through the test API.

## Testing rules specific to this package

- **GT-1 (MUST)** Domain tests are **mock-free**. Pure functions in `core/`, `state/`, `input/`, `render/` are tested with literal inputs and outputs. Mocking a pure function is a code smell — pass the real value.
- **GT-2 (MUST)** Domain tests are **DOM-free**. Tests for `core/`, `state/`, `input/`, and `render/` must not touch `document`, `window`, `customElements`, or any browser API — render tests assert on `RenderCommand` and `RenderStats` data only. Tests that legitimately need a Web Component or Canvas live alongside `effects/` or in `@bruff/game-element` / `@bruff/arcade` and use the browser provider deliberately.
- **GT-3 (MUST)** Replay tests use `packages/game/tests/fixtures/*.json` plus committed final-state snapshots in `packages/game/tests/snapshots/*.json`. Fixture parsing returns `Result`, never throws.
- **GT-4 (MUST)** Browser-control hooks (`isTestMode`, `attachTestApi`, `freezeForSnapshot`, manual clocks) stay in `effects/` and are gated by `__BRUFF_TEST_MODE__`. Test API runtime code belongs under `effects/test-api/`.

For the unit / property-based / replay testing strategy, invoke the `write-game-tests` skill.
