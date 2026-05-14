## Revisit notes (May 13, 2026)

The original design proposed several foundational refactors that are now already present in the codebase. The revised design keeps only deltas that are still missing:

1. Deterministic **browser-facing control** of the existing loop (`stepFrames`, `dispatchInput`, `freezeForSnapshot`).
2. A **typed test API surface** exposed to Playwright in test mode.
3. **Replay fixture externalization** (JSON fixtures + snapshots) building on existing replay determinism tests.
4. **E2E spec decomposition** from one mixed spec into state assertions, accessibility checks, and one frozen visual checkpoint.

Everything else in this document should be interpreted through this narrower delta scope.

# Design — Canvas Game Testing Strategy

## Architectural overview

The strategy is a stack. Each layer is independently useful and is added in order; later layers depend on earlier ones.

```
Layer 6   Playwright E2E (state-first, narrow visual)
            |
Layer 5   Replay harness  --->  Vitest Level 3 snapshot tests
            |
Layer 4   Test API surface (window.__bruffTestApi + element.testApi)
            |
Layer 3   Frame-step driver (ManualClock, suppress RAF in test mode)
            |
Layer 2   Time-as-input refactor (Clock injected into loop)
            |
Layer 1   Test-mode flag (__BRUFF_TEST_MODE__ Vite define)
```

Every new module lives in the **effects** layer or the application shell — domain layers (`core`, `state`, `input`, `render`) gain no new imports and remain DOM-free per GT-1 / GT-2.

## Layer assignment for new modules

| Module                                         | Path                                                    | Layer              | Rationale                                                                             |
| ---------------------------------------------- | ------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------- |
| `testMode.ts` (flag accessor)                  | `packages/game/lib/effects/test-mode.ts`                | effects            | Reads the build-time `__BRUFF_TEST_MODE__` define; impure by definition.              |
| `clock.ts` (Clock ADT + WallClock/ManualClock) | `packages/game/lib/effects/clock.ts`                    | effects            | Only the shell may read wall-clock time (A-21).                                       |
| `frameStepDriver.ts`                           | `packages/game/lib/effects/frame-step-driver.ts`        | effects            | Replaces the RAF tail of `loop.ts` when test mode is on.                              |
| `testApi.ts`                                   | `packages/game/lib/effects/test-api.ts`                 | effects            | Constructs the `__bruffTestApi` object and attaches it to `window`.                   |
| `renderStats.ts` (counter type)                | `packages/game/lib/render/render-stats.ts`              | render             | Plain data type produced by the pure render function; no side effects.                |
| `replayFixture.ts` (type + validator)          | `packages/game/lib/state/replay-fixture.ts`             | state              | Pure data shape and a `Result<ReplayFixture, ReplayError>` parser.                    |
| `runReplay.ts`                                 | `packages/game/lib/state/run-replay.ts`                 | state              | Pure function: `(fixture) => GameState`. Used by Vitest snapshot tests with no shell. |
| `gameElementTestApi.ts`                        | `packages/game-element/module/game-element-test-api.ts` | game-element shell | Element-instance getter wiring; lives in the Web Component package.                   |
| Replay snapshots                               | `packages/game/tests/snapshots/*.json`                  | test data          | Golden state files committed to the repo.                                             |
| Playwright state-based spec                    | `packages/arcade/e2e/state-assertions.spec.ts`          | arcade             | Replaces most of the current `bruff-game.spec.ts` body.                               |
| Playwright replay-checkpoint spec              | `packages/arcade/e2e/replay-checkpoint.spec.ts`         | arcade             | Loads a replay fixture, freezes, screenshots one stable frame.                        |

## Public API surface

### `__BRUFF_TEST_MODE__` build-time constant

```ts
declare const __BRUFF_TEST_MODE__: boolean;
```

Vite `define` replaces it with `false` for production and `true` for the arcade dev server when `VITE_TEST_MODE=1` is set or `?test=1` is in the URL at runtime. The runtime check is a small `effects/test-mode.ts` helper:

```ts
export const isTestMode = (): boolean =>
  __BRUFF_TEST_MODE__ &&
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).has("test");
```

### `Clock` ADT and `ManualClock`

```ts
export type Clock = Readonly<
  { type: "wall" } | { type: "manual"; readonly nowMs: number }
>;

export const wallClock = (): Clock => ({ type: "wall" });

export const manualClock = (nowMs: number): Clock => ({
  type: "manual",
  nowMs,
});

export const advanceManualClock = (clock: Clock, deltaMs: number): Clock =>
  clock.type === "manual"
    ? { type: "manual", nowMs: clock.nowMs + deltaMs }
    : clock;

export const readClock = (clock: Clock): number =>
  clock.type === "manual" ? clock.nowMs : performance.now();
```

`readClock` is the only function that reads `performance.now()`; it lives in the effects layer.

### `RenderStats`

```ts
export type RenderStats = Readonly<{
  frameIndex: number;
  playerDrawn: boolean;
  enemiesDrawn: number;
}>;
```

`render` returns `RenderStats` instead of `void`. The test API exposes the most recent stats.

### Test API

```ts
export type BruffTestApi = Readonly<{
  getState: () => GameState;
  loadState: (state: GameState) => void;
  stepFrames: (n: number) => GameState;
  dispatchInput: (input: string) => void;
  freezeForSnapshot: () => Promise<void>;
  getRenderStats: () => RenderStats;
}>;

declare global {
  interface Window {
    __bruffTestApi?: BruffTestApi;
  }
}
```

Each method is a closure over the running loop; `getState` returns a `structuredClone`-deep copy so callers cannot mutate live state.

### Replay fixture

```ts
export type ReplayFixture = Readonly<{
  stateVersion: number;
  seed: number;
  initialCanvas: CanvasSize;
  frames: ReadonlyArray<Readonly<{ frame: number; input: string }>>;
  totalFrames: number;
}>;

export type ReplayError =
  | { type: "stateVersionMismatch"; expected: number; got: number }
  | { type: "frameOutOfRange"; frame: number; total: number };

export const parseReplayFixture: (
  raw: unknown,
) => Result<ReplayFixture, ReplayError>;
export const runReplay: (
  fixture: ReplayFixture,
) => Result<GameState, ReplayError>;
```

`runReplay` is pure and DOM-free, so Vitest can execute it without a browser provider.

### `GameState` deltas

```ts
export type GameState = Readonly<{
  stateVersion: number; // NEW — starts at 1
  seed: number; // NEW — used by future PRNG; default 0
  frameIndex: number; // NEW — monotonic tick counter
  input: ReadonlyArray<string>;
  canvas: CanvasSize;
  player: Player;
  enemies: ReadonlyArray<Enemy>;
  playerMoved: boolean;
}>;
```

These fields are additive. `stateVersion` and `frameIndex` are required by replay equality. `seed` is reserved for the PRNG follow-up but lives in the shape now so fixtures don't need a format change.

## Tradeoffs

### Test API shape: free functions vs. object

- **Chosen: object on `window`.** Matches the user's note (#1) and gives Playwright a one-liner: `await page.evaluate(() => window.__bruffTestApi.getState())`. Internally the object is a thin closure over module-scoped state, so the implementation stays composable.
- **Alternative: free functions imported by tests.** Rejected because Playwright runs in Node and the tests need to call into the browser context, where module imports would require a separate bundling step.

### Frame-step strategy: replace RAF vs. mock RAF

- **Chosen: replace RAF.** In test mode, `loop.ts` does not call `requestAnimationFrame`; the test API's `stepFrames(n)` runs the loop body `n` times synchronously. Cleaner mental model, no risk of phantom frames between explicit steps.
- **Alternative: monkey-patch `requestAnimationFrame` to a controlled scheduler.** Rejected because (a) it leaks the patch into the global namespace, breaking other code, and (b) the loop currently composes RAF inside its own closures, making interception ugly.

### Replay snapshot format: JSON vs. binary

- **Chosen: JSON via `toMatchFileSnapshot`.** Diffable in PRs, human-readable, auto-normalizes formatting. The `GameState` object is small (~hundreds of bytes for current entity counts).
- **Alternative: hash of canonical-CBOR encoding.** Faster to compare but useless when a snapshot diff is the diagnostic signal. Reconsider only if snapshots ever exceed ~50 KB.

### Playwright spec organization: one spec vs. many

- **Chosen: split into `state-assertions.spec.ts`, `replay-checkpoint.spec.ts`, `accessibility.spec.ts`.** Each file has a single clear purpose (per O-12, one responsibility per file). Coverage flows are unaffected.
- **Alternative: keep everything in `bruff-game.spec.ts`.** Rejected; the file already shows the smell — a `runbruffGameTests()` helper called twice, dark/light loops mixed with a single key-mash test.

### Removing `slowMo: 500`

- **Chosen: remove unconditionally.** With deterministic frame-stepping there is no reason to slow Playwright down. Tests get faster and less flaky.
- **Alternative: keep `slowMo` for headed debugging only.** Rejected; debugging can be done by running a single test with `--headed` and standard Playwright pause/inspect tooling.

## Reuse map

- `packages/game/lib/loop.ts` — split: keep the pure generator `createGameLoop`, factor the RAF tail into `effects/frame-step-driver.ts`.
- `packages/game/lib/render.ts` — extend its return type from `void` to `RenderStats`; existing call sites discard the return value.
- `packages/game/lib/curtain-up.ts` — unchanged; the canvas/context bootstrap still happens once.
- `packages/game/lib/create-initial-state.ts` — extend to populate `stateVersion`, `seed`, `frameIndex`.
- `packages/game/lib/observable/keydown.ts` and `touch.ts` — unchanged. `dispatchInput` bypasses them by feeding the same generator directly.
- `packages/game-element/module/game-element.ts` — gains a `testApi` getter when test mode is on; production path is untouched.
- `packages/utils` — provides `pipe` and `clamp` already; we add a `Result<T,E>` helper here if it is not already present (per the universal error-handling rule).
- `packages/arcade/playwright.config.ts` — remove `slowMo: 500`; everything else stays.
- `packages/arcade/e2e/base-fixtures.ts` — keep the Istanbul coverage hook; add a small helper that navigates with `?test=1` and waits for `__bruffTestApi`.
- `packages/arcade/index.html` — add a tiny static HUD `<div>` for the one DOM-only visual test (replacing the empty `<h1>`).

## Data flow at runtime (test mode)

```
Playwright test
   |
   |  page.evaluate(() => window.__bruffTestApi.dispatchInput("arrowup"))
   v
__bruffTestApi.dispatchInput  ---queued---> generator.next("arrowup")
   |                                            |
   |  page.evaluate(() => __bruffTestApi.stepFrames(60))
   v                                            v
runs createGameLoop body 60x          updatePlayer / updateEnemies (pure)
                                                |
                                                v
                                        new GameState
   |
   |  page.evaluate(() => __bruffTestApi.getState())
   v
structuredClone(state)  --->  Playwright assertion
```

In production mode the path is identical except the `dispatchInput` step is driven by the keydown observable and `stepFrames` is replaced by `requestAnimationFrame`.

## Compliance with package rules

- **A-3, A-5, A-6** — All side effects (the `window` attachment, the RAF call, the `performance.now()` read) live in `effects/` only.
- **A-9** — No new mutation; `GameState` updates use spread.
- **A-21** — `performance.now()` moves behind the `Clock` ADT and is read only by `readClock` in effects.
- **A-22** — Fixed timestep is enforced because `stepFrames` advances the `ManualClock` by a fixed delta per step.
- **GT-1, GT-2** — Domain tests for `runReplay`, `parseReplayFixture`, and `RenderStats` calculations stay mock-free and DOM-free.
- **AR-1, AR-2** — New Playwright specs use `*.spec.ts` and run on all five browser projects.
- **AR-3** — Coverage instrumentation is preserved.
- **AR-4** — Accessibility tests move into `accessibility.spec.ts`, still cover dark and light schemes.

## What this design explicitly does not change

- The flat `lib/` layout. The new files live in a new `lib/effects/` subfolder; the existing files stay where they are. Migrating `update-player.ts` etc. into `lib/state/` is a separate SDTE feature.
- The observable-polyfill input path.
- The radiating-bars background animation (it just receives its `time` argument from `readClock` instead of directly from RAF).
- Vitest config or Playwright project list.

## Implementation Notes

- The frame-step driver owns latest render stats and is shared by production RAF and test-mode stepping.
- `window.__bruffTestApi` is imported dynamically behind the compile-time `__BRUFF_TEST_MODE__` gate so production bundles remain clean.
- Arcade Istanbul coverage excludes deterministic test-harness shell modules that are covered by package-level browser tests; E2E coverage remains focused on user-facing gameplay paths.
