# Tasks — Codebase Compliance

Atomic, ordered, file-named. Implement and test are split (S-16).
Each task ends in green `pnpm run ok` for the affected package(s)
(S-20). Group headers are non-executable; only `T*` items are work.

## Phase 1 — Result/Option in `@bruff/utils`

- [x] T1 — Add `Result<T, E>` type (with `Ok<T>` and `Failure<E>` aliases) plus `ok`/`error`/`isOk`/`isError` constructors and their unit tests to new files `packages/utils/module/fp/result.ts` and `packages/utils/module/fp/result.test.ts`. Tests are bundled with the implementation because the package enforces a 100% coverage threshold per `vitest.config.ts`, which rejects S-16's separation rule. Names follow `unicorn/prevent-abbreviations`; object literals follow `sort-keys`.
- [x] T2 — Add `mapResult`, `flatMapResult`, `mapError`, `unwrapOr` (curried) to `packages/utils/module/fp/result.ts` and corresponding tests in the same `result.test.ts` (map laws, flatMap short-circuit on error, fallback on `unwrapOr`).
- [x] T4 — Add `Option<T>` type and `some`/`none`/`isSome`/`isNone` plus their unit tests to new files `packages/utils/module/fp/option.ts` and `packages/utils/module/fp/option.test.ts`.
- [x] T5 — Add `mapOption`, `flatMapOption`, `toResult` (curried) to `packages/utils/module/fp/option.ts` and corresponding tests in the same `option.test.ts`.
- [x] T7 — Re-export `Result`, `Option`, and helpers from `packages/utils/index.ts`.

## Phase 2 — `Brand<>` utility (only if missing)

- [x] T8 — Verify whether `Brand<>` already exists in `@bruff/utils`. If yes, skip T9–T10. If no, continue. **Result**: `grep -rn "Brand" packages/utils/ packages/` returned zero matches across the workspace; no `Brand`, `brand.ts`, or `module/types/` directory exists. T9 and T10 remain in scope.
- [x] T9 — Add `Brand<Base, Tag>` type and `brand<Tag, Base>(value)` constructor helper to new file `packages/utils/module/types/brand.ts`, plus tests in `brand.test.ts`. The helper is the single sanctioned construction site for branded values (one localized cast under an `eslint-disable @typescript-eslint/consistent-type-assertions` comment with justification).
- [x] T10 — Re-export `Brand` and `brand` from `packages/utils/index.ts`.

## Phase 3 — Boundary helpers return `Result`

- [x] T11 — Refactor `packages/utils/module/canvas/get-canvas.ts` to return `Result<HTMLCanvasElement, "canvas-not-found">` and remove the `throw`.
- [x] T12 — Update `packages/utils/module/canvas/get-canvas.test.ts` to assert against the `Result` shape (drop `.toThrow()`).
- [x] T13 — Refactor `packages/utils/module/canvas/get-canvas-context.ts` to return `Result<CanvasRenderingContext2D, "canvas-context-not-found">`.
- [x] T14 — Update `packages/utils/module/canvas/get-canvas-context.test.ts` accordingly.
- [x] T15 — Refactor `packages/utils/module/get-shadow-game-root.ts` to return `Result<ShadowRoot, "game-root-not-found">`.
- [x] T16 — Update `packages/utils/module/get-shadow-game-root.test.ts` accordingly.
- [x] T17 — Update `packages/game/lib/curtain-up.ts` to thread Results through `flatMapResult` instead of plain `pipe`. Failures surface in the caller (`loop.ts`) via `console.error` (a shell-only side effect) and an early return. T11–T17 were committed as one atomic unit because changing one helper alone breaks the typecheck of the shared `pipe(...)` chain in `curtain-up.ts`.

## Phase 4 — Seeded PRNG

- [x] T18 — Invoke `scaffold-prng` skill to generate `packages/utils/module/fp/prng.ts` with `PrngState`, `createPrng`, `nextNumber`, `nextId`.
- [x] T19 — Write unit tests in `packages/utils/module/fp/prng.test.ts` covering: same seed → same sequence; sequence length > 1000 has no immediate cycle; `nextId` is unique across 10000 draws.
- [x] T20 — Re-export `PrngState`, `createPrng`, `nextNumber`, `nextId` from `packages/utils/index.ts`. T18–T20 committed together: coverage gate requires implementation and tests in the same commit. `PrngState` is a discriminated struct (`{ accumulator, type }`) instead of `Brand<number>` to avoid `@typescript-eslint/no-unsafe-assignment` false positives with unique-symbol branded types. `nextId` returns plain `string`; callers brand at the entity layer.

## Phase 5 — `GameState` immutability + `stateVersion` + IDs

- [x] T21 — Define `EnemyId` and `PlayerId` branded types in `packages/game/types/game-state-type.ts`.
- [x] T22 — Wrap `Enemy`, `Player`, `CanvasSize`, and `GameState` in `Readonly<…>` and `ReadonlyArray<…>` in `packages/game/types/game-state-type.ts`. Add `id`, `spawnOrder` to `Enemy`; add `id` to `Player`. Add `stateVersion: 1` and `prng: PrngState` to `GameState`. Leave `input` field unchanged for now (re-typed in Phase 7).
- [x] T23 — Update `packages/game/lib/create-initial-state.ts` to produce the new shape: `stateVersion: 1`, seeded `prng` (fixed seed for now), deterministic `PlayerId`, empty enemies array, `playerMoved: false`.
- [x] T24 — Run `pnpm run typecheck` from the repo root and fix every immutability error surfaced (expected: spread-update sites in `update-player.ts` already use spreads; verify no `.push()` / direct property assignment slipped in). T22–T24 committed together: adding required fields to `GameState` immediately breaks all test files that construct literal `GameState` objects, so all five test files (`create-initial-state`, `move-enemy-toward-player`, `render`, `update-enemies`, `update-player`) were updated atomically. Tests restructured to use `toMatchObject` for grouping assertions (respects `max-statements` limit). Import ordering follows single-before-multiple ESLint rule.

## Phase 6 — Layer directories + boundary lint

- [x] T25 — Create empty directories `packages/game/lib/{core,state,input,render,effects}` with a `.gitkeep` in each.
- [x] T26 — Move `packages/game/types/game-state-type.ts` → `packages/game/lib/core/types.ts`. Update every importer of the old path. `packages/game/types/env.d.ts` (the `__APP_VERSION__` ambient declaration) stays in `types/` — out of scope for layer rules. Used `git mv` to preserve history; nine importers updated to `./core/types.{ts,js}`. The `core/.gitkeep` placeholder is removed because `types.ts` now occupies the directory.
- [ ] T27 — Move `packages/game/lib/constants.ts` → `packages/game/lib/core/constants.ts`. Update importers.
- [ ] T28 — Move `packages/game/lib/create-initial-state.ts`, `update-player.ts`, `update-enemies.ts`, `move-enemy-toward-player.ts` → `packages/game/lib/state/`. Update importers.
- [ ] T29 — Move `packages/game/lib/render.ts` → `packages/game/lib/render/render.ts`. Update importers.
- [ ] T30 — Move `packages/game/lib/loop.ts`, `curtain-up.ts`, `bruff-game.ts`, `observable/` → `packages/game/lib/effects/` (preserving the `observable/` subdirectory). Update importers.
- [ ] T31 — Add per-layer `no-restricted-imports` rule blocks to `@bruff/eslint-config` covering all five layers. Each block lists only the forbidden upward neighbours.
- [ ] T32 — Run `pnpm run lint` from repo root; resolve any violation by relocating the offending file, not by widening the rule.

## Phase 7 — Action taxonomy + reducers

- [ ] T33 — Invoke `scaffold-action` skill to add `packages/game/lib/core/actions.ts` with `InputAction`, `GameAction`, `SystemEvent`, `RenderCommand` discriminated unions.
- [ ] T34 — Update `GameState.input` in `packages/game/lib/core/types.ts` from `string[]` to `ReadonlyArray<InputAction>`.
- [ ] T35 — Add new file `packages/game/lib/input/normalise-input.ts` exporting `normaliseKey: (key: string) => Option<InputAction>` (returns `none` for unknown keys).
- [ ] T36 — Write unit tests for `normaliseKey` in `packages/game/lib/input/normalise-input.test.ts` covering arrow keys, WASD, and unknown input → `none`.
- [ ] T37 — Refactor `packages/game/lib/state/update-player.ts` from `(state) => state` to `(state: GameState, action: GameAction): GameState` with an exhaustive `switch` on `action.type` and a `never`-typed `default` arm. Use `clamp` from `@bruff/utils` for canvas-bound clamping.
- [ ] T38 — Update `packages/game/lib/state/update-player.test.ts` to drive the reducer with explicit actions instead of `state.input` arrays.
- [ ] T39 — Refactor `packages/game/lib/state/update-enemies.ts` to `(state: GameState, action: GameAction): GameState` that runs the existing chase logic only on `action.type === "tick"`.
- [ ] T40 — Update `packages/game/lib/state/update-enemies.test.ts` to drive the reducer with `tick` actions.
- [ ] T41 — Update `packages/game/lib/effects/loop.ts` to fold actions through the reducers: `actions.reduce((s, a) => updateEnemies(updatePlayer(s, a), a), state)`.
- [ ] T42 — Update `packages/game/lib/effects/observable/keydown.ts` and `touch.ts` to emit `InputAction` values (via `normaliseKey`) instead of raw key strings; update `merge.ts` callers accordingly.

## Phase 8 — Move `BruffGame` boot to effects entry

- [ ] T43 — Create `packages/game/lib/effects/entry.ts` that registers `GameElement` directly under the `bruff-game` tag and calls `loop()`.
- [ ] T44 — Delete `packages/game/lib/effects/bruff-game.ts` (the empty `BruffGame` subclass) and update the package entry to point at `effects/entry.ts`.
- [ ] T45 — Verify `@bruff/arcade` E2E spec still finds `<bruff-game>` and the player still moves on Chromium, Firefox, and WebKit.

## Phase 9 — Tighten typings

- [ ] T46 — Add explicit `: void` return type and a TSDoc block to `packages/game/lib/render/render.ts`. Replace the `for (const enemy of enemies)` loop with `enemies.forEach(...)`.
- [ ] T47 — Replace the `for (const sub of subs)` loop in `packages/game/lib/effects/observable/merge.ts` with `subs.forEach(...)`.
- [ ] T48 — Add ambient declaration file `packages/game/lib/effects/observable/observable-polyfill.d.ts` augmenting `Document` with `when(eventName: string): Observable<Event>` and any other shape required by the polyfill.
- [ ] T49 — Remove the `any` casts and the wide `eslint-disable` block from `packages/game/lib/effects/observable/keydown.ts`. Replace with the typed `document.when("keydown")` call enabled by T48.
- [ ] T50 — Enable `@typescript-eslint/explicit-function-return-type` (warning level acceptable to start) in `@bruff/eslint-config`. Resolve any new warnings by adding return types.

## Phase 10 — Property-based + replay tests

- [ ] T51 — Add `fast-check` as a `devDependency` of `@bruff/game`. Run `pnpm install`.
- [ ] T52 — Write property test in `packages/game/lib/state/update-player.property.test.ts` covering: player position stays within canvas bounds, determinism (same input → same output), and tick-with-no-input idempotence.
- [ ] T53 — Write property test in `packages/game/lib/state/update-enemies.property.test.ts` covering: enemy count is invariant under `tick`, every enemy stays inside canvas bounds.
- [ ] T54 — Write replay test in `packages/game/lib/state/replay.test.ts` that seeds the PRNG, applies a fixed action sequence (e.g. `["move-right","move-right","move-right","tick","tick"]`), and asserts a stored snapshot of the resulting `GameState`.

## Phase 11 — Verification

- [ ] T55 — Run `pnpm run ok` at repo root. Resolve any remaining failures.
- [ ] T56 — Run `pnpm --filter @bruff/arcade test` to confirm the E2E suite still passes on all three browsers.
- [ ] T57 — Append a `## Verification` section to `spec.md` recording, per behaviour bullet, which test file proves it.
- [ ] T58 — Reconcile `design.md` with reality: if any decision was changed during execution, update the doc before closing the feature (S-25).
