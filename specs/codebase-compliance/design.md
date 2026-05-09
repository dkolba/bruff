# Design — Codebase Compliance

This document describes how the spec is realised. It is organised by
the nine numbered remediation areas from the audit plan, in dependency
order. Every architectural decision lists at least one alternative and
references the existing files that will be modified or reused.

---

## D1. `Result<T, E>` and `Option<T>` in `@bruff/utils`

### Layer assignment

`@bruff/utils` is layer-agnostic by design. The new modules go under
`packages/utils/module/fp/` alongside the existing `pipe.ts`.

### Public API surface

```ts
// packages/utils/module/fp/result.ts
export type Ok<T> = Readonly<{ type: "ok"; value: T }>;
export type Failure<E> = Readonly<{ error: E; type: "error" }>;
export type Result<T, E> = Ok<T> | Failure<E>;

export const ok: <T>(value: T) => Result<T, never>;
export const error: <E>(reason: E) => Result<never, E>;
export const isOk: <T, E>(r: Result<T, E>) => r is Ok<T>;
export const isError: <T, E>(r: Result<T, E>) => r is Failure<E>;
export const mapResult: <T, U, E>(
  f: (t: T) => U,
) => (r: Result<T, E>) => Result<U, E>;
export const flatMapResult: <T, U, NextError>(
  f: (t: T) => Result<U, NextError>,
) => <UpstreamError>(
  r: Result<T, UpstreamError>,
) => Result<U, UpstreamError | NextError>;
export const mapError: <T, E, F>(
  f: (e: E) => F,
) => (r: Result<T, E>) => Result<T, F>;
export const unwrapOr: <T, E>(fallback: T) => (r: Result<T, E>) => T;
```

Naming notes: the project's `unicorn/prevent-abbreviations` ESLint rule
forbids `err`/`isErr`/`Err`, and `sort-keys` requires alphabetical
object keys. The constructor `error` would shadow its parameter, so the
parameter is named `reason`. Object literals are written in alphabetical
key order (`{ error, type }`, `{ type, value }`).

```ts
// packages/utils/module/fp/option.ts
export type Option<T> =
  | Readonly<{ type: "some"; value: T }>
  | Readonly<{ type: "none" }>;

export const some: <T>(value: T) => Option<T>;
export const none: Option<never>;
export const isSome: <T>(
  o: Option<T>,
) => o is Readonly<{ type: "some"; value: T }>;
export const isNone: <T>(o: Option<T>) => o is Readonly<{ type: "none" }>;
export const mapOption: <T, U>(f: (t: T) => U) => (o: Option<T>) => Option<U>;
export const flatMapOption: <T, U>(
  f: (t: T) => Option<U>,
) => (o: Option<T>) => Option<U>;
export const toResult: <T, E>(error: E) => (o: Option<T>) => Result<T, E>;
```

All functions are curried so they compose cleanly inside `pipe(...)`
(e.g. `pipe(getCanvas, flatMapResult(getCanvasContext))`).

### Tradeoffs

- **Chosen**: hand-rolled, zero-dependency, curried-for-pipe.
  Consistent with A-24 (in-house FP helpers), aligns with the existing
  `pipe.ts` style.
- **Alternative considered**: import `neverthrow` or `fp-ts`. Rejected —
  violates A-23/A-24 (no external runtime deps in `@bruff/game`) and
  CLAUDE.md "in-house FP helpers".
- **Alternative considered**: throw-based with try/catch wrappers.
  Rejected — directly contradicts the "Exception-Free Domain" rule.

### Reuse map

- `packages/utils/module/fp/pipe.ts` — the new helpers must compose
  through `pipe`. Curried argument order is `(f) => (input)` to match.
- `packages/utils/index.ts` — the existing barrel; add re-exports.

---

## D2. Convert boundary helpers to return `Result`

### Layer assignment

These three helpers stay in `@bruff/utils` (still framework-agnostic),
but their consumers (`packages/game/lib/curtain-up.ts`) move into the
`effects/` layer in D4.

### Public API surface

```ts
// packages/utils/module/canvas/get-canvas.ts
export const getCanvas: (
  root: ShadowRoot,
) => Result<HTMLCanvasElement, "canvas-not-found">;

// packages/utils/module/canvas/get-canvas-context.ts
export const getCanvasContext: (
  canvas: HTMLCanvasElement,
) => Result<CanvasRenderingContext2D, "canvas-context-not-found">;

// packages/utils/module/get-shadow-game-root.ts
export const getShadowGameRoot: (
  gameRoot: string,
) => Result<ShadowRoot, "game-root-not-found">;
```

`packages/game/lib/curtain-up.ts` currently composes the three with
plain `pipe`. After D2 it composes them with `flatMapResult`:

```ts
const setupCanvas = (selector: string) =>
  pipe(
    getShadowGameRoot,
    flatMapResult(getCanvas),
    flatMapResult(getCanvasContext),
  )(selector);
```

### Tradeoffs

- **Chosen**: string-literal-union error codes, one per helper.
  Cheap, zero new types, lints clean.
- **Alternative considered**: a single `BruffError` discriminated union
  in `@bruff/utils`. Rejected — premature abstraction (O-7); each
  helper has exactly one failure mode and a local code is clearer.
- **Alternative considered**: `Option<T>` instead of `Result`. Rejected
  — losing the typed error code throws away debuggability and prevents
  meaningful surfacing to the user.

### Reuse map

- `packages/utils/module/fp/result.ts` (from D1).
- `packages/utils/module/fp/pipe.ts`.
- Existing tests under
  `packages/utils/module/canvas/*.test.ts` — adjust assertions from
  `expect(() => …).toThrow()` to
  `expect(getCanvas(root)).toEqual({ type: "error", error: "canvas-not-found" })`.

---

## D3. `GameState` immutability + `stateVersion` + PRNG slot

### Layer assignment

`packages/game/types/game-state-type.ts` survives but every shape is
wrapped in `Readonly<>` / `ReadonlyArray<>` and grows new fields. Once
the layer split lands (D4) the file moves to
`packages/game/lib/core/types.ts`.

### Data shape changes

```ts
import type { Brand, PrngState } from "@bruff/utils";

export type EnemyId = Brand<string, "EnemyId">;
export type PlayerId = Brand<string, "PlayerId">;

export type Enemy = Readonly<{
  id: EnemyId;
  spawnOrder: number;
  xPos: number;
  yPos: number;
  size: number;
}>;

export type Player = Readonly<{
  id: PlayerId;
  xPos: number;
  yPos: number;
  size: number;
}>;

export type CanvasSize = Readonly<{ width: number; height: number }>;

export type GameState = Readonly<{
  stateVersion: number;
  prng: PrngState;
  input: ReadonlyArray<InputAction>; // (defined in D5)
  canvas: CanvasSize;
  player: Player;
  enemies: ReadonlyArray<Enemy>;
  playerMoved: boolean;
}>;
```

> **Reconciliation (post-execution)**: `stateVersion` is typed as
> `number`, not the literal `1`. `createInitialState` sets it to `1`
> via the `STATE_VERSION` constant; future migrations bump the value
> at runtime, so a `number` field is correct and a literal type would
> have to be widened the moment a migration lands.

### Tradeoffs

- **Chosen**: `Readonly<>` at the **type** level only (compiler-only
  enforcement). Runtime is already pure-functional via spread updates.
- **Alternative considered**: `Object.freeze` deep at runtime. Rejected
  — performance cost on hot path with no extra safety beyond what
  `tsc --noEmit` already provides.
- **Alternative considered**: postpone branded IDs until a feature
  needs them. Rejected — A-11 makes them mandatory and refactoring
  later forces touching every reducer.

### Reuse map

- `Brand<>` utility — verify it exists in `@bruff/utils` during T-tasks;
  add it under `packages/utils/module/types/brand.ts` if missing.
- `packages/game/lib/create-initial-state.ts` — must be updated to
  produce the new shape (sets `stateVersion: 1`, seeds the PRNG, gives
  the player a deterministic `PlayerId`, starts with empty enemies).

---

## D4. Layer directories + boundary lint rule

### Layer assignment

```
packages/game/lib/
├── core/        (zero imports)
│   ├── types.ts                 ← from types/game-state-type.ts
│   ├── constants.ts             ← from lib/constants.ts
│   └── actions.ts               ← new (D5)
├── state/       (may import core/)
│   ├── create-initial-state.ts  ← moved
│   ├── update-player.ts         ← refactored to reducer
│   ├── update-enemies.ts        ← refactored to reducer
│   └── move-enemy-toward-player.ts ← moved
├── input/       (may import core/, state/)
│   └── normalise-input.ts       ← new
└── effects/     (may import core/, state/)
    ├── entry.ts                 ← from bruff-game.ts (define + boot)
    ├── loop.ts                  ← moved
    ├── curtain-up.ts            ← moved
    ├── render.ts                ← moved (still effectful — see note)
    └── observable/              ← moved (subscriptions are effects)
        ├── keydown.ts
        ├── touch.ts
        └── observable-polyfill.d.ts ← ambient Document.when augmentation
```

> **Reconciliation (post-execution)**: two divergences from the
> original layout above:
>
> 1. **No `render/` directory yet.** `render.ts` writes directly to a
>    Canvas context (`context.fillRect(...)`), so it is an effect by
>    construction (per A-3). Until a pure
>    `RenderCommand` projection lands, the file lives at
>    `lib/effects/render.ts`. The TSDoc on the file flags this as a
>    temporary placement and the move target is the future `render/`
>    layer once the projection function exists. The lint rules in D4
>    are configured for the planned `render/` location so no rewrite
>    is needed when the file moves.
> 2. **No separate `input/keydown-action.ts` / `input/touch-action.ts`.**
>    The polyfilled `Observable` pipeline does its own normalisation
>    inline — `keydown.ts` already calls `normaliseKey` from
>    `lib/input/normalise-input.ts` before emitting, and `touch.ts`
>    follows the same pattern. Splitting out a per-source action file
>    would be premature abstraction (O-7) since each source has a
>    single one-line normalisation step. The observables stay in
>    `effects/observable/` because subscription is itself a side
>    effect.

### Boundary enforcement

In `@bruff/eslint-config`, add a rule object per layer using
`no-restricted-imports` patterns. Example for `core/`:

```ts
{
  files: ["packages/game/lib/core/**/*.ts"],
  rules: {
    "no-restricted-imports": ["error", {
      patterns: [
        "**/state/**", "**/input/**", "**/render/**", "**/effects/**",
      ],
    }],
  },
},
```

A symmetrical block for each layer enumerates only its forbidden upward
neighbours. Cycles are prevented by the absence of any rule allowing
upward imports.

### Tradeoffs

- **Chosen**: hand-rolled `no-restricted-imports` per layer.
  Zero new dependencies, fully visible in the eslint config.
- **Alternative considered**: `eslint-plugin-boundaries`. Rejected —
  five layers do not justify a new dependency; the patterns above are
  short and explicit.
- **Alternative considered**: nx-style `enforce-module-boundaries`
  (Nx). Rejected — the repo is pnpm + turbo, not Nx.

### Reuse map

- `verify-layers` skill — invoke for periodic deeper audits beyond what
  ESLint catches.
- `@bruff/eslint-config/index.ts` (or similarly named entry) — append
  the new rule blocks; do not duplicate them per package consumer.

---

## D5. Action taxonomy + reducers + exhaustiveness

### Layer assignment

`packages/game/lib/core/actions.ts` defines all four action families
(zero runtime imports — pure types). Reducers in `state/` consume
`GameAction`. Input layer produces `InputAction`. Render layer produces
`RenderCommand` (a future-facing slot — for now, `render.ts` keeps its
existing direct-Canvas approach since A-25..A-27 already make it pure).
Effects produce `SystemEvent`.

### Public API surface

```ts
// packages/game/lib/core/actions.ts
export type InputAction =
  | Readonly<{ type: "move-down" }>
  | Readonly<{ type: "move-left" }>
  | Readonly<{ type: "move-right" }>
  | Readonly<{ type: "move-up" }>;

export type GameAction = InputAction | Readonly<{ type: "tick" }>;

export type SystemEvent =
  | Readonly<{ type: "game-paused" }>
  | Readonly<{ type: "game-resumed" }>
  | Readonly<{ type: "game-started" }>
  | Readonly<{ type: "game-stopped" }>;

export type RenderCommand =
  | Readonly<{ type: "clear" }>
  | Readonly<{
      color: string;
      height: number;
      type: "fill-rect";
      width: number;
      xPos: number;
      yPos: number;
    }>;
```

> **Reconciliation (post-execution)**: three shape changes vs. the
> originally-sketched action types:
>
> 1. **`tick` carries no `deltaMs`.** Time is not yet threaded into the
>    pipeline (A-21 is satisfied because the fixed-timestep loop drives
>    one tick per input event). Adding `deltaMs` was speculation about
>    a future feature — when a movement system needs continuous time it
>    can be added then via the `migrate-state` skill.
> 2. **`SystemEvent` is the lifecycle union, not `frame-requested`.**
>    Lifecycle (`game-started`, `game-paused`, etc.) is what the shell
>    actually emits and the effects layer consumes; the original
>    `frame-requested; nowMs` was a render-driven event that doesn't
>    exist because the loop currently calls `requestAnimationFrame`
>    directly.
> 3. **`RenderCommand` uses `xPos / yPos / height / width / color` and
>    has a `clear` variant.** Coordinate field names match the existing
>    `Player` / `Enemy` records (per C-2 — domain vocabulary), and
>    `clear` is the canonical first command of every frame (per A-26).
>    The file-level reducer/projection that produces these commands
>    has not landed yet — the type stands declared per A-15 so the
>    taxonomy is complete.

```ts
// packages/game/lib/state/update-player.ts (now a reducer)
export const updatePlayer = (
  state: GameState,
  action: GameAction,
): GameState => {
  switch (action.type) {
    case "move-up":
      return /* spread + clamp */;
    case "move-down":
      return /* … */;
    case "move-left":
      return /* … */;
    case "move-right":
      return /* … */;
    case "tick":
      return state; // player movement is input-driven
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
};
```

`updateEnemies` is a tick-driven reducer:

```ts
export const updateEnemies = (
  state: GameState,
  action: GameAction,
): GameState =>
  action.type === "tick"
    ? {
        ...state,
        enemies: state.enemies.map((e) =>
          moveEnemyTowardPlayer(e, state.player, state.canvas),
        ),
      }
    : state;
```

### Tradeoffs

- **Chosen**: `GameAction = InputAction | { type: "tick" }`. Single
  reducer signature `(state, action) => state` keeps the compose
  pipeline trivial: `actions.reduce((s, a) => applyAll(s, a), seed)`.
- **Alternative considered**: separate input-reducer and tick-reducer
  signatures. Rejected — forces two pipelines and violates A-9's single
  state-transition shape.
- **Alternative considered**: defer `RenderCommand` to a separate
  feature. Accepted as a partial — declared in types now (so the
  taxonomy is complete per A-15), wiring deferred to a future feature.

### Reuse map

- `packages/game/lib/move-enemy-toward-player.ts` — already pure;
  unchanged by this refactor besides its move into `state/`.
- `packages/utils/module/math/clamp.ts` — used inside the new
  `updatePlayer` for canvas bounds.
- `scaffold-action`, `scaffold-reducer` skills — invoked as the
  authoritative templates.

---

## D6. Seeded PRNG + branded IDs + `spawnOrder`

### Layer assignment

`packages/utils/module/fp/prng.ts` (pure, in-house, zero deps).
`packages/utils/module/types/brand.ts` if `Brand<>` does not yet exist.

### Brand module shape

```ts
// packages/utils/module/types/brand.ts
declare const BRAND: unique symbol;

export type Brand<Base, Tag extends string> = Base & {
  readonly [BRAND]: Tag;
};

export const brand: <Tag extends string, Base = string>(
  value: Base,
) => Brand<Base, Tag>;
```

The `brand` function is the single sanctioned construction site for
branded values. Internally it performs one type assertion guarded by
an `eslint-disable` comment with justification; every other module
constructs branded values exclusively through this helper, so casts
do not leak into domain code. The unique-symbol property on the
`Brand` type is inaccessible at runtime (the symbol is `declare`d, not
exported), preventing accidental construction or inspection from
outside the module.

### Public API surface

```ts
// packages/utils/module/fp/prng.ts
export type PrngState = Readonly<{
  accumulator: number;
  type: "prng-state";
}>;

export const createPrng: (seed: number) => PrngState;
export const nextNumber: (prng: PrngState) => {
  prng: PrngState;
  value: number;
};
export const nextId: (prng: PrngState) => { prng: PrngState; value: string };
```

> **Reconciliation (post-execution)**: two shape changes vs. the
> originally-sketched PRNG:
>
> 1. **`PrngState = { accumulator; type: "prng-state" }`**, not
>    `{ seed; counter }`. Mulberry32 carries a single 32-bit
>    accumulator that is itself the next state — a separate
>    `seed`/`counter` split would re-mix on every step. The `type`
>    discriminator hardens the shape against accidental construction
>    of a bare `{ accumulator: number }`.
> 2. **`nextId` returns a raw `string`**, not a pre-branded value.
>    Branding happens at the entity layer (`drawId<"EnemyId">(prng)`
>    in `create-initial-state.ts`) so `@bruff/utils` stays free of
>    domain-tag knowledge. Keeping `nextId` tag-agnostic also lets the
>    same helper mint IDs for any future entity type without growing
>    its signature.

A `mulberry32` or equivalent 32-bit integer hash is the implementation
target — small, deterministic, well-understood. The choice is captured
inside `prng.ts`; consumers see only the API.

### Tradeoffs

- **Chosen**: `mulberry32`. ~6 lines, ~2³² period — sufficient for one
  game session.
- **Alternative considered**: `xoshiro128**`. Better statistical
  properties but ~30 lines and overkill for a roguelike at this stage.
- **Alternative considered**: store next-id counters separately from
  the PRNG. Rejected — A-12 says IDs come from the PRNG; a separate
  counter would add a second state slot to keep deterministic.

### Reuse map

- `scaffold-prng` skill — authoritative template for the file.
- `scaffold-entity` skill — used when generating new branded entity
  types beyond `EnemyId`/`PlayerId`.

---

## D7. Move `BruffGame` boot to effects entry

### Layer assignment

Effects only. `packages/game/lib/effects/entry.ts` is the single module
in `@bruff/game` that has side effects on import.

### Public API surface

```ts
// packages/game/lib/effects/entry.ts
import { GameElement } from "@bruff/game-element";
import { loop } from "./loop.js";

if (!customElements.get("bruff-game")) {
  customElements.define("bruff-game", GameElement);
}
loop();
```

The bare `BruffGame extends GameElement {}` subclass is deleted (no
behaviour, no value).

### Tradeoffs

- **Chosen**: register `GameElement` directly. Simpler, one fewer file.
- **Alternative considered**: keep an empty subclass for "future
  extension". Rejected — premature abstraction (O-7); add the subclass
  back in the future feature that actually needs it.

### Reuse map

- `packages/game-element/module/game-element.ts` — the existing
  `GameElement` class is registered directly.
- `packages/game/lib/effects/loop.ts` — the moved generator-driven loop.

---

## D8. Tighten typings

### Public API changes

- `packages/game/lib/effects/render.ts` declares `: void` and gains
  a TSDoc block.
- `packages/game/lib/state/update-enemies.ts` declares
  `: GameState` (already implicit; making explicit is the only change
  beyond the D5 reducer refactor).
- `packages/game/lib/effects/observable/keydown.ts` (post-move): a new
  ambient declaration file
  `packages/game/lib/effects/observable/observable-polyfill.d.ts`
  augments `Document` with `when(eventName: string): Observable<Event>`.
  The `any` casts in the source file are removed.
- `for…of` loops in `render.ts` and `merge.ts` become `.forEach` (with
  inline `unicorn/no-array-for-each` disables — that rule contradicts
  C-17).
- `@typescript-eslint/explicit-function-return-type` enabled at warn
  level in `@bruff/eslint-config` with `allowHigherOrderFunctions` and
  `allowTypedFunctionExpressions` so contextually-typed callbacks
  (e.g. `it("…", () => { … })`) don't trip the rule. All resulting
  warnings resolved by adding concrete return types across utils,
  game, game-element, and arcade.

> **Reconciliation (post-execution)**: the ambient declaration file
> is **script-mode**, not module-mode. A first attempt used
> `import type { Observable }` + `declare global` + `export {}`, which
> compiled in `@bruff/game` but failed in `@bruff/arcade` because the
> module-mode `.d.ts` only augments the global when included in the
> consumer's tsconfig. Switching to script mode + an inline
> `import("observable-polyfill/fn").Observable<Event>` type expression,
> plus a `/// <reference path="./observable-polyfill.d.ts" />` at the
> top of `keydown.ts`, makes the augmentation portable across
> packages.

### Tradeoffs

- **Chosen**: ambient `.d.ts` augmentation for `Document.when`.
  Targeted, small, documented; shrinks the eslint-disable comment to
  zero rules.
- **Alternative considered**: contribute upstream types to
  `observable-polyfill`. Out of scope for this feature but a good
  follow-up issue.

### Reuse map

- Existing eslint-disable comment in `keydown.ts` — replaced, not
  retained.

---

## D9. Property-based + replay tests

### Layer assignment

Test files live next to source under
`packages/game/lib/state/*.test.ts` (unit) and
`packages/game/lib/state/*.property.test.ts` (property-based via
`@fast-check/vitest`). The replay test lives at
`packages/game/lib/state/replay.test.ts`.

> **Reconciliation (post-execution)**: the replay test uses a typed
> object-literal fixture (`expect(final).toEqual(EXPECTED_FINAL_STATE)`)
> rather than a Vitest-managed `__snapshots__/replay.test.ts.snap`
> file. The fixture is reviewable in the diff, fully self-contained,
> and any drift in PRNG, clamp, or chase math fails the test loudly
> instead of silently regenerating a `.snap`. The behavioural contract
> (deterministic `GameState` for a fixed seed and action sequence) is
> identical.

### Public API surface

For each reducer (`updatePlayer`, `updateEnemies`):

- A property test using `test.prop(...)` from `@fast-check/vitest`
  covering:
  - Bounds invariant: player stays within
    `0..canvas.width - size`.
  - Determinism invariant: same `(state, action)` returns
    structurally equal `GameState`.
  - Idempotence on tick when no input is queued:
    `updatePlayer(s, { type: "tick" })` returns the original `s` (the
    reducer's `tick` arm returns the input state by reference, so the
    property check uses `.toBe(state)` for stronger evidence than
    structural equality alone).

- A replay test seeding the PRNG and applying a hard-coded action
  sequence (e.g. `["move-right" × 3, "tick" × 2]`) then matching a
  stored snapshot.

### Tradeoffs

- **Chosen**: `@fast-check/vitest` for property-based testing with
  native Vitest integration and `fast-check` arbitraries.
  Added as `devDependency` only — does not violate A-23.

- **Alternative considered**: write hand-rolled property generators.
  Rejected — `fast-check` is mature, free, and aligns with the
  expected testing workflow.

### Reuse map

- `write-game-tests` skill — authoritative template for the three test
  levels.
- Existing Vitest setup in `packages/game/vitest.config.ts` (or wherever
  the browser provider config lives) — extended, not duplicated.

---

## Module-collaboration diagram

```
                    ┌──────────────────────┐
shell entry ───────►│ effects/entry.ts     │  (only side-effects on import)
                    └──┬───────────────────┘
                       │ defines + loops
                       ▼
                    ┌──────────────────────┐
                    │ effects/loop.ts      │
                    └──┬───────────────────┘
              imports  │  produces actions
                       ▼
                    ┌──────────────────────┐    ┌─────────────────────┐
                    │ input/normalise-…ts  │───►│ core/actions.ts     │
                    └──┬───────────────────┘    └─────────────────────┘
                       │  ReadonlyArray<InputAction>
                       ▼
                    ┌──────────────────────┐    ┌─────────────────────┐
                    │ state/update-player  │◄───│ core/types.ts       │
                    │ state/update-enemies │    │ (GameState, Brand)  │
                    └──┬───────────────────┘    └─────────────────────┘
                       │ GameState
                       ▼
                    ┌──────────────────────┐
                    │ render/render.ts     │ (Canvas effects executed at edge)
                    └──────────────────────┘
```

The arrows are import edges. They flow inward toward `core/`. The lint
rule in D4 enforces this graph.
