# Prepare DOMless Game - Design

## Layer Assignment

| Module or file                                         | Package        | Layer                 | Purpose                                                                                     |
| ------------------------------------------------------ | -------------- | --------------------- | ------------------------------------------------------------------------------------------- |
| `packages/game/package.json`                           | `@bruff/game`  | Package metadata      | Keeps `.` as the browser export and adds `./headless` as a Node-safe subpath.               |
| `packages/game/vite.config.lib.ts`                     | `@bruff/game`  | Build config          | Builds the browser entry first and emits the headless entry as an additional library entry. |
| `tsconfig.base.json`                                   | Workspace      | TypeScript config     | Allows `.ts` import specifiers for native Node TypeScript source loading.                   |
| `packages/utils/index.ts`                              | `@bruff/utils` | Universal export      | Uses `.ts` specifiers so native Node can load shared source from a pnpm workspace symlink.  |
| `packages/game/AGENTS.override.md`                     | `@bruff/game`  | Architecture guidance | Documents the pure headless facade layer and allowed import direction.                      |
| `packages/game/README.md`                              | `@bruff/game`  | Package documentation | Documents browser-primary usage and headless terminal usage.                                |
| `packages/game/lib/headless/index.ts`                  | `@bruff/game`  | Pure public facade    | Re-exports the DOM-free game API consumed by Node and CLI code.                             |
| `packages/game/lib/headless/create-headless-game.ts`   | `@bruff/game`  | Pure public facade    | Creates deterministic initial `GameState` from a plain size and seed.                       |
| `packages/game/lib/headless/step-headless-game.ts`     | `@bruff/game`  | Pure public facade    | Advances game state with normalised input actions.                                          |
| `packages/game/lib/headless/project-headless-frame.ts` | `@bruff/game`  | Pure public facade    | Projects state into board-cell frame data for non-Canvas renderers.                         |
| `packages/game/lib/render/project-render-cells.ts`     | `@bruff/game`  | Render                | Owns renderer-neutral player and enemy board-cell projection.                               |
| `packages/game/lib/render/project-render-commands.ts`  | `@bruff/game`  | Render                | Reuses board-cell projection to produce Canvas-oriented `RenderCommand` values.             |
| `packages/game/lib/state/create-initial-state.ts`      | `@bruff/game`  | State                 | Continues to accept plain `{ width, height }` data, not a DOM canvas type.                  |
| `packages/cli/package.json`                            | `@bruff/cli`   | Package metadata      | Adds a workspace dependency on `@bruff/game`.                                               |
| `.vscode/launch.json`                                  | Workspace      | Debug config          | Launches the CLI with native Node TypeScript flags and the `bruff-source` condition.        |
| `packages/cli/AGENTS.override.md`                      | `@bruff/cli`   | Architecture guidance | Allows importing only `@bruff/game/headless`, not game internals.                           |
| `packages/cli/module/game-frame.ts`                    | `@bruff/cli`   | Pure terminal adapter | Converts headless game frame cells into terminal cells.                                     |
| `packages/cli/bin/bruff-cli.ts`                        | `@bruff/cli`   | Node shell            | Uses injected ports to run the real game frame through the ANSI writer.                     |

The new `headless/` directory is a pure public facade, not a new side-effect layer. It may import `core/`, `state/`, `input/`, and `render/`. It must not import `effects/`, `@bruff/game-element`, `@bruff/utils/dom`, browser globals, Node built-ins, or `@bruff/cli`.

## Public API Surface

```ts
// packages/game/lib/headless/index.ts
export {
  createHeadlessGame,
  type HeadlessGameOptions,
} from "./create-headless-game.ts";
export { projectHeadlessFrame } from "./project-headless-frame.ts";
export { stepHeadlessGame } from "./step-headless-game.ts";
export { normaliseKey } from "../input/normalise-input.ts";
export type { GameState, CanvasSize, GridCell } from "../core/types.ts";
export type { InputAction } from "../core/actions.ts";
export type {
  HeadlessFrame,
  HeadlessFrameCell,
  HeadlessFrameEntity,
} from "./project-headless-frame.ts";
```

```ts
// packages/game/lib/headless/create-headless-game.ts
import type { CanvasSize, GameState } from "../core/types.ts";

export type HeadlessGameOptions = Readonly<{
  canvas: CanvasSize;
  seed?: number;
}>;

export const createHeadlessGame: (options: HeadlessGameOptions) => GameState;
```

The `canvas` name is retained because `GameState` currently stores `canvas` dimensions, but the value is only a plain `CanvasSize` record. A terminal caller should pass logical dimensions such as the board-sized viewport it wants to project through.

```ts
// packages/game/lib/headless/step-headless-game.ts
import type { InputAction } from "../core/actions.ts";
import type { GameState } from "../core/types.ts";

export const stepHeadlessGame: (
  state: GameState,
  inputs: ReadonlyArray<InputAction>,
) => GameState;
```

`stepHeadlessGame()` is a small public wrapper over `advanceGameState()` so CLI code does not import state internals.

```ts
// packages/game/lib/render/project-render-cells.ts
import type { GameState, GridCell } from "../core/types.ts";

export type RenderCellEntity = "enemy" | "player";

export type RenderCell = Readonly<{
  cell: GridCell;
  entity: RenderCellEntity;
  spawnOrder?: number;
}>;

export const projectRenderCells: (
  state: GameState,
) => ReadonlyArray<RenderCell>;
```

```ts
// packages/game/lib/headless/project-headless-frame.ts
import type { Board, GameState, GridCell } from "../core/types.ts";
import type { RenderCellEntity } from "../render/project-render-cells.ts";

export type HeadlessFrameEntity = RenderCellEntity;

export type HeadlessFrameCell = Readonly<{
  cell: GridCell;
  entity: HeadlessFrameEntity;
}>;

export type HeadlessFrame = Readonly<{
  board: Board;
  cells: ReadonlyArray<HeadlessFrameCell>;
  frameIndex: number;
}>;

export const projectHeadlessFrame: (state: GameState) => HeadlessFrame;
```

The CLI maps `HeadlessFrameCell` values to `TerminalCell` values. `@bruff/game` does not choose terminal glyphs, terminal colors, cursor addressing, or ANSI commands.

```json
// packages/game/package.json
{
  "exports": {
    ".": {
      "types": "./types/entry.d.ts",
      "import": "./lib/effects/entry.ts"
    },
    "./headless": {
      "types": "./types/headless.d.ts",
      "bruff-source": "./lib/headless/index.ts",
      "node": "./dist/headless/index.js",
      "import": "./lib/headless/index.ts"
    },
    "./test-api": {
      "types": "./lib/effects/test-api/test-api-types.ts",
      "import": "./lib/effects/test-api/test-api-types.ts"
    }
  }
}
```

The `.` export remains browser-first. The headless export is explicit so Node users cannot accidentally evaluate browser setup code. The `node` condition points at the built DOM-free artifact for plain Node consumers, while the workspace CLI uses the `bruff-source` condition to load TypeScript source directly and avoid stale ignored `dist` output.

```json
// packages/cli/package.json
{
  "scripts": {
    "cli": "node --conditions=bruff-source --experimental-strip-types --experimental-transform-types bin/bruff-cli.ts",
    "test": "node --conditions=bruff-source --experimental-strip-types --experimental-transform-types --experimental-test-coverage --test-coverage-exclude=\"../glyph/**/*.ts\" --test-coverage-exclude=\"**/*.test.ts\" --test \"**/*.test.ts\""
  }
}
```

Native Node TypeScript is intentionally conservative for files under `node_modules`. In this pnpm workspace, `@bruff/game` and `@bruff/utils` are workspace symlinks under `node_modules`, so the CLI must opt into type stripping for dependencies. The source-loaded graph also uses `.ts` import specifiers so Node can resolve the actual source files without a transpiler or build step.

## Data Flow

```text
Browser primary path:

@bruff/game
  |
  v
effects/entry.ts -> customElements.define(...)
  |
  v
effects/loop.ts -> DOM input + RAF + Canvas shell
  |
  v
state/input/render pure layers
  |
  v
effects/render.ts -> CanvasRenderingContext2D
```

```text
Terminal secondary path:

@bruff/cli/bin/bruff-cli.ts
  |
  | node --conditions=bruff-source
  |      --experimental-strip-types
  |      --experimental-transform-types
  v
@bruff/game/headless
  |
  | createHeadlessGame(), normaliseKey(), stepHeadlessGame()
  v
pure state/input layers
  |
  | projectHeadlessFrame()
  v
headless frame cells
  |
  v
packages/cli/module/game-frame.ts
  |
  | TerminalFrame
  v
packages/cli/module/write-frame.ts -> injected stdout writer
```

## Data Shape Changes

No `GameState` migration is required. `stateVersion` remains unchanged because the state shape, replay fixture shape, and reducer semantics do not change.

The new renderer-neutral `RenderCell` and `HeadlessFrame` types are derived views over existing state. They do not get stored in `GameState` and do not flow back into reducers.

## Tradeoffs

### Export Strategy

- **Chosen: add `@bruff/game/headless` as a subpath export.** This preserves the browser root import while giving Node consumers a stable DOM-free entry point.
- **Chosen: add a `bruff-source` condition for workspace-native TypeScript.** This lets `@bruff/cli` consume `@bruff/game/headless` source through the package boundary without compiling `@bruff/game` first.
- **Alternative: make `@bruff/game` itself DOM-free and move the browser entry to `@bruff/game/browser`.** Rejected because the user explicitly wants browser functionality to remain the primary mode and existing browser imports should not churn.
- **Alternative: let `@bruff/cli` deep-import game state internals.** Rejected because it couples the CLI to internal file layout and bypasses package-level architecture checks.
- **Alternative: prebuild `@bruff/game` before every CLI run.** Rejected for development because it can hide stale `dist` behaviour and makes native Node TypeScript less useful.
- **Alternative: use `tsx` or another runtime transformer.** Rejected because `@bruff/cli` already uses native Node TypeScript and has an explicit no-transpiler package rule.

### Render Data Shape

- **Chosen: project renderer-neutral board cells for headless consumers.** Terminal rendering is cell-based, so this keeps ANSI concerns in `@bruff/cli` and avoids reverse-engineering pixel rectangles.
- **Alternative: reuse Canvas `RenderCommand` values in the CLI.** Rejected because `RenderCommand` currently describes pixel rectangles and CSS color strings, which are browser-facing details.
- **Alternative: make `@bruff/game` emit `TerminalFrame`.** Rejected because it would introduce a dependency from the game package to the CLI renderer and terminal glyph choices.

### Headless Driver Scope

- **Chosen: expose pure functions instead of a stateful driver.** The CLI can own its loop and ports while the game package remains deterministic and side-effect-free.
- **Alternative: export a mutable `HeadlessGameDriver`.** Rejected because it would duplicate `FrameStepDriver` shell state and make pure tests less direct.
- **Alternative: reuse `createFrameStepDriver` in Node.** Rejected because it requires `CanvasRenderingContext2D`, background rendering hooks, and browser snapshot timing.

## Reuse Map

- `packages/game/lib/state/create-initial-state.ts` - creates deterministic initial state from plain dimensions and seed.
- `packages/game/lib/state/advance-game-state.ts` - applies queued input and tick logic.
- `packages/game/lib/input/normalise-input.ts` - converts raw key names and terminal arrow CSI sequences into `InputAction` values.
- `packages/game/package.json` - exposes `@bruff/game/headless` through `node`, `import`, and `bruff-source` conditions.
- `packages/utils/index.ts` - keeps universal helpers source-loadable under native Node TypeScript.
- `tsconfig.base.json` - allows `.ts` import specifiers used by the source-loaded path.
- `packages/game/lib/render/project-render-commands.ts` - current Canvas command projection to refactor through cell projection.
- `packages/game/lib/render/render-stats.ts` - keeps browser test observability unchanged.
- `packages/game/lib/effects/entry.ts` - remains the browser root export and custom-element registration point.
- `packages/game/lib/effects/loop.ts` - remains the browser DOM, input, RAF, and test API shell.
- `packages/cli/module/terminal-cell.ts` - existing terminal frame shape for ANSI rendering.
- `packages/cli/module/render-frame.ts` - existing pure terminal-frame to ANSI-command projection.
- `packages/cli/module/write-frame.ts` - existing injected writer boundary and typed write result.
- `packages/cli/bin/bruff-cli.ts` - current Node entry point to migrate from mock scene to real game frame.

## Test Strategy

- Add Node-safe tests for `@bruff/game/headless` that import only the subpath and assert no browser globals are required.
- Add pure render tests for `projectRenderCells()` and `projectHeadlessFrame()` using literal state values.
- Keep existing browser-provider tests for `effects/render.ts`, `effects/frame-step-driver.ts`, and `effects/entry.ts` green.
- Add focused input tests for terminal arrow CSI sequences in `normaliseKey()`.
- Add `@bruff/cli` native `node:test` coverage for converting `HeadlessFrame` values to `TerminalFrame` values.
- Add CLI port tests that simulate terminal arrow key chunks, normalise them through `@bruff/game/headless`, step the state, render a terminal frame, and quit through injected input.
- Run `CI=true pnpm --filter @bruff/game run format`, `lint`, `typecheck`, and `test`.
- Run `CI=true pnpm --filter @bruff/cli run format`, `lint`, `typecheck`, and `test`.
- Run `CI=true pnpm --filter @bruff/arcade run test` after browser entry changes because `@bruff/game` remains the primary browser path.
