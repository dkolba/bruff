---
paths:
  - "packages/game/**/*.*"
---

# `@bruff/game` — Roguelike Game Architecture

This package contains the core game logic. The rules below apply to every file under `packages/game/`. Universal coding rules (FP, Result/Option error handling, naming, etc.) live in `.claude/CLAUDE.md`; the rules here are the package-specific extensions.

- **Language**: TypeScript with TSDoc annotations.
- **Dependencies**: `@bruff/utils` and `@bruff/game-element` only — no external runtime deps (per A-22).

## Layer Structure

Code must live in the correct layer. Dependencies flow strictly inward — later layers may depend on earlier ones but inner layers must never import outer layers, and no circular dependencies are allowed.

| Layer   | Location                     | May import from   |
| ------- | ---------------------------- | ----------------- |
| Core    | `packages/game/lib/core/`    | Nothing           |
| State   | `packages/game/lib/state/`   | `core/` only      |
| Input   | `packages/game/lib/input/`   | `core/`, `state/` |
| Render  | `packages/game/lib/render/`  | `core/`, `state/` |
| Effects | `packages/game/lib/effects/` | `core/`, `state/` |

### Dependency Rules

- **A-1 (MUST)** `core/` must have zero imports.
- **A-2 (MUST)** No circular dependencies.
- **A-3 (MUST)** Side effects (Canvas, DOM, I/O) live only in `effects/`.
- **A-4 (MUST)** Dependencies flow inward toward `core/` only.

## Pure Core / Impure Shell

- **A-5 (MUST)** All game logic (`core/`, `state/`, `input/`, `render/`) is pure: no DOM access, no `fetch`, no `Math.random()`, no `Date.now()`.
- **A-6 (MUST)** All side effects (Canvas draws, event listeners, timers) live in `effects/` or the entry point only.

## State & Immutability

- **A-7 (MUST)** Single immutable global `GameState` object — no hidden or local state.
- **A-8 (MUST)** `GameState` includes a `stateVersion: number` for replay compatibility.
- **A-9 (MUST)** All state transitions are pure functions: `(state, action) => state`.
- **A-10 (MUST)** Zero mutation anywhere — no mutable variables, no array `.push()`, no object property assignment. Use spread for updates: `{ ...state, key: value }` and `[...arr, item]` are the canonical idioms.

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
- **A-21 (MUST)** Time is a controlled input fed into the root pipeline — never read from `Date.now()` or `performance.now()` inside core or state logic.
- **A-22 (MUST)** Fixed-timestep simulation — tick rate is configurable via `Config`, never tied to render FPS.

## Zero External Runtime Dependencies

- **A-23 (MUST)** `packages/game` has zero external runtime dependencies beyond `@bruff/utils`, `@bruff/game-element`, and browser built-ins.
- **A-24 (MUST)** All FP helpers, PRNG, and math utilities are implemented in-house in `@bruff/utils`.

## Rendering

- **A-25 (MUST)** Rendering is a pure projection of `GameState`. The render layer takes a state snapshot and produces a Canvas frame; it holds no internal state, no caches, no memoised scene graph, no incremental mutation.
- **A-26 (MUST)** Each frame is drawn from scratch — clear-and-redraw. The previous frame's pixels are not load-bearing; every visible pixel is recomputed from current `GameState` every tick.
- **A-27 (MUST)** Output is a deterministic function of state. Same `GameState` → same Canvas output, byte-for-byte. Time-driven animations are not an exception: their phase is part of state, fed in via the controlled time input (per A-21).

## Testing rules specific to this package

- **GT-1 (MUST)** Domain tests are **mock-free**. Pure functions in `core/`, `state/`, `input/`, `render/` are tested with literal inputs and outputs. Mocking a pure function is a code smell — pass the real value.
- **GT-2 (MUST)** Domain tests are **DOM-free**. Tests for `core/`, `state/`, `input/`, and `render/` must not touch `document`, `window`, `customElements`, or any browser API — they assert on data only. Tests that legitimately need a Web Component or Canvas live alongside `effects/` or in `@bruff/game-element` / `@bruff/arcade` and use the browser provider deliberately.

For the unit / property-based / replay testing strategy, invoke the `write-game-tests` skill.
