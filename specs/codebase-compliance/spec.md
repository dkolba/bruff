# Codebase Compliance With CLAUDE.md and Package Rules

## Goal

Bring `/home/user/bruff` into compliance with the rules declared in
`.claude/CLAUDE.md`, `.claude/rules/packages-game.md`, and
`.claude/rules/packages-utils.md`. The codebase is an early scaffold:
many `MUST` rules — exception-free domain code, layered architecture,
immutable `GameState`, branded IDs, seeded PRNG, discriminated-union
actions, property-based + replay tests — are described in the rules but
not yet realised in code. The outcome is a codebase whose static
analysis (lint + typecheck) and runtime tests refuse to compile or pass
when those invariants are broken, and an unchanged user-visible game.

## User-visible behaviour

The game itself behaves identically before and after this work:

- The `<bruff-game>` Web Component still mounts in `@bruff/arcade`.
- The blue player square still moves with WASD/arrow keys and touch
  swipes.
- Red enemy squares still chase the player every tick.
- The frame still renders to the shadow-DOM canvas at the same cadence.
- The Playwright E2E suite in `@bruff/arcade` still passes on
  Chromium, Firefox, and WebKit.

What changes is **internal** and **observable to developers**:

- `pnpm run ok` fails on any new module-state mutation, layer-crossing
  import, missing return type, `any` leak, or domain `throw`.
- Boundary helpers (`getCanvas`, `getCanvasContext`,
  `getShadowGameRoot`) return `Result<T, E>` instead of throwing.
- `GameState` is `Readonly<…>` with `stateVersion`, a seeded PRNG slot,
  branded entity IDs, and a normalised `InputAction` queue.
- `packages/game/lib/` is organised into `core/`, `state/`, `input/`,
  `render/`, `effects/` subdirectories with enforced inward-only
  imports.
- Reducers (`updatePlayer`, `updateEnemies`) follow the
  `(state, action) => state` signature and use a `never`-based
  exhaustiveness guard.
- The test suite includes property-based tests (`@fast-check/vitest`) and at
  least one deterministic replay snapshot per reducer.

## Out of scope

- Adding new gameplay systems (combat, inventory, FOV, etc.) — these
  belong in their own SDTE features.
- Visual or UX polish to the existing render output.
- Performance work beyond what the existing implementation already
  provides.
- Migrating away from `observable-polyfill` — the WICG Observable
  proposal is the mandated API and its polyfill stays.
- Replacing or upgrading the build/test toolchain (Vite, Playwright,
  TypeScript major version).
- Introducing new external runtime dependencies in `@bruff/game`
  (forbidden by A-23). `@fast-check/vitest` is added only as a **devDependency**.
- Documentation rewrites of `README.md` files unless a structural move
  invalidates the existing text.

## Open questions

All resolved at spec time:

1. **Should `BruffGame` keep its own subclass of `GameElement`?**
   Resolved: collapse it. `BruffGame extends GameElement {}` adds zero
   behaviour over the base. Register `GameElement` directly under the
   `bruff-game` tag from the effects-layer entry point.
2. **Where does `customElements.define` and the `loop()` boot live
   after the layer move?**
   Resolved: in `packages/game/lib/effects/entry.ts`, the only module
   in `@bruff/game` permitted to perform side effects at import time.
3. **What error-code shape do boundary helpers use?**
   Resolved: a string-literal union per helper, e.g. `getCanvas`
   returns `Result<HTMLCanvasElement, "canvas-not-found">`. No
   project-wide error enum — codes are local to their helper.
4. **Does the seeded PRNG go in `@bruff/utils` or `@bruff/game`?**
   Resolved: in `@bruff/utils` under `module/fp/prng.ts`. It is a
   reusable pure utility (per O-1) and the `scaffold-prng` skill
   already targets that location.
5. **Do we add `eslint-plugin-boundaries` or hand-rolled
   `no-restricted-imports`?**
   Resolved: `no-restricted-imports` patterns inside
   `@bruff/eslint-config`. Zero new dependencies, the rule set is small
   (five layers), and the patterns are easy to audit.
6. **`stateVersion` starting value?**
   Resolved: `1`. Future migrations bump it via the `migrate-state`
   skill.

## Edge cases

- `getCanvas` called against a shadow root that contains no
  `<canvas>` — must return `{ type: "error", error: "canvas-not-found" }`,
  not throw, not return `null`.
- `getCanvasContext` called against a canvas whose
  `getContext("2d")` returns `null` (e.g. WebGL context already
  acquired in tests) — must return `{ type: "error", error:
"canvas-context-not-found" }`.
- `getShadowGameRoot` called before `customElements.define` has
  registered the host element — must return `{ type: "error", error:
"game-root-not-found" }`.
- `InputAction` queue contains a key the reducer does not recognise —
  the reducer returns the input state unchanged; the exhaustiveness
  guard fires only for unhandled **discriminated-union variants**,
  not unknown raw key strings (those are filtered by the input
  normaliser before they ever reach a reducer).
- A reducer is added in the future with a new variant but the `switch`
  is not updated — `tsc` must reject it via the `never` assignment in
  the `default:` arm. This is a compile-time edge case, not a runtime
  one.
- Replay snapshot drift after an intentional behavioural change — the
  acceptance is that snapshot tests fail loudly and the developer
  consciously regenerates the fixture; silent regeneration is
  prohibited.
- An enemy entity created mid-tick must receive a deterministic
  `EnemyId` from the PRNG and a `spawnOrder` strictly greater than
  every existing enemy's `spawnOrder`.
- Layer-boundary lint must catch:
  `import … from "../effects/…"` inside any `core/state/input/render`
  file, and any cross-layer cycle.

## Verification

Per behaviour bullet, the test (or static check) that proves it:

### User-visible behaviour

- **`<bruff-game>` Web Component still mounts in `@bruff/arcade`** —
  `packages/arcade/e2e/bruff-game.spec.ts` (`should find custom game
element`, runs in light + dark colour scheme).
- **Player moves with WASD/arrow keys and touch swipes** —
  - keyboard normalisation: `packages/game/lib/input/normalise-input.test.ts`
    (covers ArrowUp/Down/Left/Right, WASD, NSEW aliases, plus
    rejection of unknown keys).
  - keyboard wiring to the loop: `packages/game/lib/effects/observable/keydown.test.ts`.
  - touch gesture decoding: `packages/game/lib/effects/observable/touch.test.ts`.
  - position update from a `move-*` action:
    `packages/game/lib/state/update-player.test.ts` (one `it.each`
    case per direction) and
    `packages/game/lib/state/update-player.property.test.ts` (bounds
    invariant + determinism + tick idempotence over random states).
  - smoke check that arrow keys reach the running game:
    `packages/arcade/e2e/bruff-game.spec.ts` (presses Up/Down/Left/Right).
- **Red enemy squares chase the player every tick** —
  - per-enemy chase math:
    `packages/game/lib/state/move-enemy-toward-player.test.ts`.
  - reducer dispatches chase only on `tick`:
    `packages/game/lib/state/update-enemies.test.ts`.
  - count + bounds invariants over random states:
    `packages/game/lib/state/update-enemies.property.test.ts`.
  - determinism of the full pipeline:
    `packages/game/lib/state/replay.test.ts`.
- **Frame still renders to the shadow-DOM canvas** —
  `packages/game/lib/effects/render.test.ts` (asserts `fillRect` calls
  for player and every enemy).
- **Playwright E2E suite still passes across all five viewports
  (Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari)** —
  `packages/arcade/e2e/bruff-game.spec.ts` projects in
  `packages/arcade/playwright.config.ts`. AR-2 enforces all five
  viewports.

### Internal / developer-observable

- **`pnpm run ok` fails on layer-crossing imports, mutation, missing
  return type, `any` leak, domain `throw`** — enforced by
  `packages/eslint-config/rules.js` (the
  `@typescript-eslint/explicit-function-return-type`,
  `@typescript-eslint/consistent-type-assertions: never`, and the
  unicorn ruleset) plus
  `packages/eslint-config/bruff-lint-typescript.js`'s
  `layerImportRestrictions` block. No dedicated runtime test —
  these are compile-time / lint-time gates and would fail `pnpm run
lint` / `pnpm run typecheck`. The `_exhaustive: never` arm in each
  reducer's `switch` is the type-level proof for missing variants.
- **Boundary helpers return `Result<T, E>`** —
  - `packages/utils/module/canvas/get-canvas.test.ts`
    (`canvas-not-found` on empty shadow root).
  - `packages/utils/module/canvas/get-canvas-context.test.ts`
    (`canvas-context-not-found` when `getContext("2d")` returns
    `null`).
  - `packages/utils/module/get-shadow-game-root.test.ts`
    (`game-root-not-found` when the host element is absent).
  - The shell that consumes the boundary results:
    `packages/game/lib/effects/curtain-up.test.ts`.
- **`GameState` is `Readonly<…>` with `stateVersion`, seeded PRNG slot,
  branded entity IDs, and normalised `InputAction` queue** —
  - shape + deterministic IDs from PRNG:
    `packages/game/lib/state/create-initial-state.test.ts`.
  - PRNG primitives (`createPrng`, `nextNumber`, `nextId`):
    `packages/utils/module/fp/prng.test.ts`.
  - branded type guard:
    `packages/utils/module/types/brand.test.ts`.
  - normalisation of raw key strings into `InputAction`:
    `packages/game/lib/input/normalise-input.test.ts`.
  - immutability is type-level (`Readonly<…>` / `ReadonlyArray<…>` in
    `packages/game/lib/core/types.ts`) and verified by `tsc`.
- **Layer directories with enforced inward-only imports** — enforced
  by `layerImportRestrictions` in
  `packages/eslint-config/bruff-lint-typescript.js`. No dedicated
  test; the `verify-layers` skill is the audit tool.
- **Reducers follow `(state, action) => state` with `never`-based
  exhaustiveness** —
  - `updatePlayer`:
    `packages/game/lib/state/update-player.test.ts` (every variant
    case asserted) and
    `packages/game/lib/state/update-player.property.test.ts`.
  - `updateEnemies`:
    `packages/game/lib/state/update-enemies.test.ts` and
    `packages/game/lib/state/update-enemies.property.test.ts`.
  - The `default: { const _exhaustive: never = action; … }` arm is
    proved at compile time by `tsc`.
- **Property-based + replay tests exist per reducer** —
  - property: `packages/game/lib/state/update-player.property.test.ts`,
    `packages/game/lib/state/update-enemies.property.test.ts`.
  - replay snapshot:
    `packages/game/lib/state/replay.test.ts`.

### Edge cases

- **`Result<…, "canvas-not-found">` on empty shadow** —
  `packages/utils/module/canvas/get-canvas.test.ts`.
- **`Result<…, "canvas-context-not-found">` on null context** —
  `packages/utils/module/canvas/get-canvas-context.test.ts`.
- **`Result<…, "game-root-not-found">` before host registered** —
  `packages/utils/module/get-shadow-game-root.test.ts`.
- **Unknown key dropped at the input boundary** —
  `packages/game/lib/input/normalise-input.test.ts` (`returns none for
unknown key …` cases).
- **New unhandled `GameAction` variant fails `tsc`** — compile-time;
  the `never` assignment in
  `packages/game/lib/state/update-player.ts` and
  `packages/game/lib/state/update-enemies.ts` is the proof.
- **Replay snapshot drift fails loudly** —
  `packages/game/lib/state/replay.test.ts` asserts `toEqual` against a
  stored typed fixture; any drift in PRNG, clamp, or chase math fails
  the test instead of silently regenerating the fixture.
- **Mid-tick entity gets a deterministic ID + monotonically increasing
  `spawnOrder`** — `packages/game/lib/state/create-initial-state.test.ts`
  (the three seeded enemies have indexed `spawnOrder` values 0, 1, 2,
  drawn from successive `nextId` calls). No spawner exists yet — when
  one lands, it must add its own test using the same pattern.
- **Layer-boundary lint catches outward imports** — enforced by
  `layerImportRestrictions` in
  `packages/eslint-config/bruff-lint-typescript.js`; `eslint .` fails
  the file rather than `tsc`.
