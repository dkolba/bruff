# Create Quilt Design

## Layer Assignment

| Area             | Files                                                                                                                               | Runtime contract                                                                                                        |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Package metadata | `packages/quilt/package.json`                                                                                                       | Declares `@bruff/quilt`, root export, scripts, and workspace dependencies.                                              |
| Package config   | `packages/quilt/tsconfig.json`, `packages/quilt/eslint.config.js`, `packages/quilt/vitest.config.ts`                                | Reuses existing TypeScript, lint, and browser test conventions.                                                         |
| Public export    | `packages/quilt/index.ts`                                                                                                           | Exports the Web Component, registration helper, pure model APIs, command APIs, serialization APIs, and public types.    |
| Element shell    | `packages/quilt/module/quilt-element.ts`                                                                                            | Small custom element coordinator for lifecycle and dependency wiring only.                                              |
| Runtime shell    | `packages/quilt/module/runtime/quilt-runtime.ts`                                                                                    | Owns mounted runtime handles, state references, render scheduling, and teardown.                                        |
| DOM template     | `packages/quilt/module/template.ts`                                                                                                 | Produces the editor shadow DOM template with toolbar region, terrain canvas, and overlay canvas.                        |
| Controller shell | `packages/quilt/module/controller/quilt-controller.ts`                                                                              | Converts DOM pointer/keyboard events into pure editor commands and requests redraws.                                    |
| Browser commands | `packages/quilt/module/browser/*.ts`                                                                                                | Wraps download, clipboard, file, focus, and other browser-only commands as explicit shell functions.                    |
| Validation       | `packages/quilt/module/validation/*.ts`                                                                                             | Validates editor forms and imported map payloads without adding methods to the Web Component class.                     |
| Preview fonts    | `packages/quilt/module/preview-font/*.ts`                                                                                           | Loads and projects optional preview font data outside the Web Component class.                                          |
| Core map model   | `packages/quilt/module/model/tile-map-data.ts`, `packages/quilt/module/model/tile-layer.ts`, `packages/quilt/module/model/chunk.ts` | Owns immutable map records, chunk records, typed-array layers, and tile coordinate helpers.                             |
| Editor state     | `packages/quilt/module/state/quilt-state.ts`                                                                                        | Owns selected tool, selected layer, camera, hover, selection, clipboard, undo stack, redo stack, and dirty chunks.      |
| Commands         | `packages/quilt/module/commands/*.ts`                                                                                               | Defines command ADTs and pure `apply` / `undo` helpers.                                                                 |
| Entity metadata  | `packages/quilt/module/entities/*.ts`                                                                                               | Defines branded entity IDs, tile positions, and component records stored outside tile layers.                           |
| Rendering        | `packages/quilt/module/render/*.ts`                                                                                                 | Projects map chunks and editor state into Canvas 2D draw plans and executes those plans against canvases.               |
| Serialization    | `packages/quilt/module/storage/broughlike-map.ts`                                                                                   | Converts internal map data to/from the shared `@bruff/contracts` `BroughlikeMap` JSON value with typed `Result` errors. |
| Tests            | `packages/quilt/module/**/*.test.ts`                                                                                                | Covers pure model/command/serialization behaviour and browser shell rendering/event cleanup.                            |
| Documentation    | `packages/quilt/README.md`, `packages/quilt/AGENTS.md`                                                                              | Documents package role, commands, architecture rules, contract usage, and renderer constraints.                         |
| Arcade metadata  | `packages/arcade/package.json`                                                                                                      | Adds `@bruff/quilt` as a dev-only workspace dependency.                                                                 |
| Arcade routing   | `packages/arcade/dev-tools-router.ts`, `packages/arcade/app.ts`                                                                     | Mounts `<tool-quilt>` at `/tools-map` only while `import.meta.env.DEV` is true.                                         |
| Arcade E2E       | `packages/arcade/e2e/tools-route.spec.ts`, `packages/arcade/e2e/accessibility.spec.ts`                                              | Verifies the dev URL mounts the editor and remains accessible.                                                          |
| Arcade guard     | `packages/arcade/scripts/check-bundle-clean.mjs`                                                                                    | Rejects production assets containing quilt dev-only code or route strings.                                              |
| Arcade docs      | `packages/arcade/README.md`, `packages/arcade/AGENTS.md`                                                                            | Documents `/tools-map` as a development-only route and updates dev-only import rules.                                   |

The package has a functional core and an imperative shell. Domain modules never import DOM APIs. Shell modules may use `HTMLElement`, `ShadowRoot`, `HTMLCanvasElement`, `CanvasRenderingContext2D`, pointer events, keyboard events, and animation frames.

`QuiltElement` must not become a god object. It attaches the shadow root, calls focused setup functions, stores only teardown/runtime handles, and delegates state transitions, rendering, validation, preview-font loading, and browser commands to separate modules. Tests should fail if the class starts accumulating behaviour that belongs in those focused modules.

`@bruff/arcade` remains an application shell. It may import `@bruff/quilt` only from `packages/arcade/dev-tools-router.ts`, and that router must be loaded only from an `import.meta.env.DEV` branch that is absent from production bundles.

## Public API Surface

Root export:

```ts
export {
  QuiltElement,
  getQuiltMapData,
  registerQuiltElement,
  setQuiltMapData,
} from "./module/quilt-element.js";

export {
  createTileMapData,
  getTile,
  setTile,
  type ChunkCoordinate,
  type TileCoordinate,
  type TileId,
  type TileLayerId,
  type TileMapData,
} from "./module/model/tile-map-data.js";

export {
  createQuiltState,
  type QuiltState,
} from "./module/state/quilt-state.js";

export {
  executeEditorCommand,
  redoEditorCommand,
  undoEditorCommand,
} from "./module/state/execute-editor-command.js";

export {
  createPaintTilesCommand,
  type EditorCommand,
  type PaintTilesCommand,
} from "./module/commands/editor-command.js";

export {
  parseBroughlikeMapData,
  serializeBroughlikeMapData,
  type ParseBroughlikeMapDataError,
} from "./module/storage/broughlike-map.js";

export type { BroughlikeMap, BroughlikeTerrain } from "@bruff/contracts";
```

Web Component shell:

```ts
/**
 * Browser custom element for editing roguelike tile maps.
 */
export class QuiltElement extends HTMLElement {
  connectedCallback(): void;
  disconnectedCallback(): void;
}

export const setQuiltMapData = (
  quiltElement: QuiltElement,
  tileMapData: TileMapData,
): void;

export const getQuiltMapData = (
  quiltElement: QuiltElement,
): TileMapData;

/**
 * Registers the Quilt custom element if it is not already defined.
 */
export const registerQuiltElement = (): void;
```

Core model types:

```ts
export type TileId = Brand<number, "TileId">;

export type TileCoordinate = Readonly<{
  tileX: number;
  tileY: number;
}>;

export type TileLayerId = "terrain" | "object" | "flags";

export type TileChunk = Readonly<{
  chunkCoordinate: ChunkCoordinate;
  terrainLayer: Uint8Array;
  objectLayer: Uint16Array;
  flagsLayer: Uint32Array;
}>;

export type TileMapData = Readonly<{
  version: 1;
  width: number;
  height: number;
  chunkSize: number;
  chunks: ReadonlyMap<string, TileChunk>;
  entities: ReadonlyMap<EntityId, MapEntity>;
}>;
```

Command types:

```ts
export type PaintTileChange = Readonly<{
  coordinate: TileCoordinate;
  layerId: TileLayerId;
  beforeTileId: TileId;
  afterTileId: TileId;
}>;

export type PaintTilesCommand = Readonly<{
  type: "PAINT_TILES";
  changes: ReadonlyArray<PaintTileChange>;
}>;

export type EditorCommand = PaintTilesCommand;
```

Commands are plain data. They must not be classes. Applying a command returns a new state value with changed chunk references and dirty chunk IDs.

## Core Model

Use a chunked, layer-oriented model:

- chunk size defaults to `32` tiles;
- each chunk owns typed arrays for `terrain`, `object`, and `flags`;
- `terrain` uses compact `Uint8Array` values that map to the shared terrain strings `floor`, `wall`, and `door` at the serialization boundary;
- `object` uses `Uint16Array`;
- `flags` uses `Uint32Array`;
- chunks are keyed by a deterministic string derived from integer chunk coordinates;
- pure helpers convert map tile coordinates to chunk coordinates and chunk-local indexes.

This deliberately avoids `Cell[][]` and rich nested cell objects. Tile layers stay cache-friendly, brush operations can update ranges efficiently, and future renderer code can upload or redraw chunks without scanning the full map.

## Editor State

`TileMapData` stores durable map content. `QuiltState` stores transient editor concerns:

- `selectedTool`;
- `selectedLayer`;
- `selectedTileId`;
- `camera`;
- `hoveredTile`;
- `selection`;
- `clipboard`;
- `undoStack`;
- `redoStack`;
- `dirtyChunks`.

`executeEditorCommand`, `undoEditorCommand`, and `redoEditorCommand` return new state records. They do not mutate function parameters or module-level state.

## Entity Metadata

Use ECS-inspired records without adding a full ECS dependency:

```ts
export type EntityId = Brand<string, "EntityId">;

export type MapEntity = Readonly<{
  id: EntityId;
  position: TileCoordinate;
  components: ReadonlyMap<ComponentType, EntityComponent>;
}>;

export type EntityComponent =
  | DoorComponent
  | SpawnComponent
  | ScriptComponent
  | LootTableComponent;
```

Tile layers represent terrain-like data. Entities represent semantic metadata such as doors, spawn points, scripts, triggers, and loot table hooks. Multiple entities may share a tile.

## Rendering Pipeline

Use Canvas 2D first:

```text
Pointer/keyboard DOM events
  |
  v
QuiltElement lifecycle coordinator
  |
  v
Quilt runtime + controller modules
  |
  v
EditorCommand data
  |
  v
executeEditorCommand(state, command)
  |
  v
dirty chunk IDs + next editor state
  |
  v
Canvas 2D terrain redraw for dirty chunks
  |
  v
Canvas 2D overlay redraw for hover, selection, grid, brush preview
```

Use two canvases:

- terrain canvas for durable map layers;
- overlay canvas for grid, hover, selection, cursor, and brush preview.

Terrain draw plans are tile-level. A dirty chunk selects which tile coordinates need redraw, then each tile is projected from `TileMapData` to a fill command using terrain colours (`floor`, `wall`, `door`). The Canvas executor applies each command's `fillStyle` before `fillRect()`, so editing one wall tile does not turn the entire chunk black. Runtime sizing sets both canvases to a square `min(window.innerWidth, window.innerHeight)` viewport and derives tile size from `canvasSize / max(map.width, map.height)` so the longest map dimension fills the available square.

Rendering should project pure draw plans before touching a canvas where practical. Canvas execution remains in the shell. Pointer hit testing uses explicit conversions between screen coordinates, world coordinates, and integer tile coordinates.

## Serialization

Initial storage uses the shared `@bruff/contracts` `BroughlikeMap` JSON shape:

```ts
export type BroughlikeMap = Readonly<{
  version: 1;
  width: number;
  height: number;
  rows: ReadonlyArray<ReadonlyArray<"floor" | "wall" | "door">>;
}>;
```

`serializeBroughlikeMapData(tileMapData)` returns `BroughlikeMap` by projecting the internal terrain typed array to rectangular terrain rows.

`parseBroughlikeMapData(input)` accepts `unknown`, delegates validation to `parseBroughlikeMap(input)` from `@bruff/contracts`, and returns `Result<TileMapData, ParseBroughlikeMapDataError>`. Invalid input is a value-level error, not an exception.

The first editor slice serializes only terrain. Entity metadata, chunk-oriented JSON, binary chunk formats, MessagePack, FlatBuffers, workers, and chunk streaming are deferred.

## Arcade Dev Route

Extend the existing Sigil dev route pattern:

- keep `/tools` mapped to `<tool-sigil>`;
- add `/tools-map` mapped to `<tool-quilt>`;
- keep `/` and unknown routes mapped to `<bruff-game>`;
- keep `packages/arcade/app.ts` loading `packages/arcade/dev-tools-router.ts` only behind `import.meta.env.DEV`;
- ensure production builds do not include the dev-tools router chunk, the `<tool-quilt>` registration, or `@bruff/quilt`;
- reject typo or legacy Quilt identifiers (`<tool-quil>`, `tool-quil`, `@bruff/quil`) if they appear in emitted production assets.

Recommended route surface:

```ts
export type ArcadeRoute = "game" | "tools" | "quilt";

export type ArcadeElementName = "bruff-game" | "tool-sigil" | "tool-quilt";

export const routePathname = (pathname: string): ArcadeRoute =>
  pathname === "/tools"
    ? "tools"
    : pathname === "/tools-map"
      ? "quilt"
      : "game";
```

`packages/arcade/dev-tools-router.ts` may statically import both `@bruff/sigil` and `@bruff/quilt` because the router itself is dev-only. `packages/arcade/app.ts` should dynamically import and delegate to `mountDevRoute()` only when `import.meta.env.DEV` is true and `routePathname(location.pathname)` is not `"game"`. Production code paths must not contain a static import, custom element registration, or route table entry for Quilt.

## Dependency Plan

Runtime dependencies:

- `@bruff/utils` for `Brand`, `Result`, `ok`, `error`, and universal helpers.
- `@bruff/contracts` for `BroughlikeMap`, `BroughlikeTerrain`, and `parseBroughlikeMap(input)` at the serialization boundary.

No runtime dependency on third-party UI frameworks, renderers, ECS packages, canvas libraries, map editor toolkits, or serialization libraries.

Dev dependencies follow `packages/game-element/package.json`:

- `@bruff/eslint-config`;
- `@vitest/browser`;
- `@vitest/browser-playwright`;
- `@vitest/coverage-v8`;
- `eslint`;
- `playwright`;
- `prettier`;
- `rimraf`;
- `typescript`;
- `vitest`.

`packages/arcade/package.json` adds `@bruff/quilt` as a `devDependency`, matching `@bruff/sigil`. The production bundle guard must reject `dev-tools-router`, `<tool-quilt>` registration strings, `<tool-quil>` typo registration strings, `tool-quilt`, `tool-quil`, `@bruff/quilt`, `@bruff/quil`, and the Quilt dev route string.

## Testing Strategy

Use TDD when executing the tasks:

1. Add package shell and empty exports.
2. Add failing tests for model coordinate/chunk helpers.
3. Implement model helpers.
4. Add failing tests for command execution and undo/redo.
5. Implement command execution.
6. Add failing tests for `BroughlikeMap` serialization and parsing through `@bruff/contracts`.
7. Implement contract-backed serialization.
8. Add browser tests for the Web Component lifecycle and canvas rendering boundary.

Pure tests cover:

- chunk key derivation and tile-to-chunk mapping;
- typed-array layer indexing;
- paint command application across one chunk;
- paint command application across multiple chunks;
- undo and redo stack transitions;
- dirty chunk tracking;
- entity metadata storage outside tile layers;
- `BroughlikeMap` JSON round-trip;
- invalid shared contract parse errors.

Browser tests cover:

- `QuiltElement` creates an open shadow root with Paint and Erase controls plus terrain and overlay canvases;
- `QuiltElement` delegates runtime creation to focused setup functions rather than implementing state, rendering, validation, preview-font, or browser-command methods;
- `connectedCallback` is idempotent;
- `disconnectedCallback` removes event listeners and stops pending render work;
- pointer input paints and erases through command execution;
- terrain canvas changes after paint and changes back after erase;
- runtime sizing sets the canvases to the smaller viewport dimension and redraws after resize;
- overlay canvas can redraw hover/selection without rewriting terrain chunks.

Arcade E2E tests cover:

- `/` mounts `<bruff-game>` and not `<tool-sigil>` or `<tool-quilt>`;
- `/tools` mounts `<tool-sigil>` and not `<bruff-game>` or `<tool-quilt>`;
- `/tools-map` mounts `<tool-quilt>` and not `<bruff-game>` or `<tool-sigil>`;
- unknown routes fall back to `<bruff-game>`;
- the development Quilt route passes the same accessibility check pattern used for `/tools`.
- a narrow `/tools-map` interaction test clicks one tile on the editor canvas, asserts the wall-colour pixel after Paint, clicks Erase, and asserts the floor-colour pixel returns.

The paint/erase interaction E2E must stay intentionally small. It should verify Arcade can load the development route, route pointer input through `<tool-quilt>`, and observe one changed tile returning to floor after erase. Detailed brush, undo, redo, chunk, and serialization behaviour belongs in `@bruff/quilt` package tests.

Arcade production build verification covers:

- `pnpm --filter @bruff/arcade run build` passes;
- `packages/arcade/scripts/check-bundle-clean.mjs` rejects production assets containing `dev-tools-router`, `<tool-quilt>` registration strings, `<tool-quil>` typo registration strings, `tool-quilt`, `tool-quil`, `@bruff/quilt`, `@bruff/quil`, or the quilt dev route string.

## Reuse Map

| Existing file                                      | Reuse                                                                         |
| -------------------------------------------------- | ----------------------------------------------------------------------------- |
| `packages/game-element/package.json`               | Web Component package metadata, scripts, and browser test dependency pattern. |
| `packages/game-element/tsconfig.json`              | Package-local TypeScript config pattern.                                      |
| `packages/game-element/vitest.config.ts`           | Browser Vitest + Playwright config and coverage threshold pattern.            |
| `packages/game-element/eslint.config.js`           | Shared ESLint config wiring.                                                  |
| `packages/game-element/module/game-element.ts`     | Open shadow DOM, idempotent lifecycle, and custom element class allowance.    |
| `packages/arcade/app.ts`                           | Dev-only dynamic import pattern for the tools router.                         |
| `packages/arcade/dev-tools-router.ts`              | Existing route mapping and dev-only `<tool-sigil>` import pattern.            |
| `packages/arcade/e2e/tools-route.spec.ts`          | E2E route mounting pattern for development-only tools.                        |
| `packages/arcade/scripts/check-bundle-clean.mjs`   | Production bundle contamination guard.                                        |
| `packages/contracts/module/broughlike-map-json.ts` | Shared rectangular map JSON schema and non-throwing parser.                   |
| `packages/contracts/module/sigil-glyph-json.ts`    | Stable glyph keys and per-entry `name` field for future glyph asset previews. |
| `packages/utils/module/types/brand.ts`             | Branded IDs for tiles and entities.                                           |
| `packages/utils/module/fp/result.ts`               | Exception-free parse and command result shapes.                               |
| `packages/utils/module/math/clamp.ts`              | Coordinate clamping for camera, bounds, and hit testing.                      |
| `packages/utils/module/fp/pipe.ts`                 | Pure transformation composition where it improves readability.                |

## Tradeoffs

### Chosen: Plain Web Component Package

Pros:

- Fits the requested new workspace package without adding a UI framework.
- Keeps editor UI reusable in browser hosts.
- Matches the existing `@bruff/game-element` shell pattern.

Cons:

- Requires manual DOM/template wiring for panels and toolbar controls.
- Does not get framework-provided state binding.

### Alternative: React Or Svelte Panels With Canvas Tiles

Pros:

- Faster to build complex panels and forms.
- Familiar state binding for toolbars and inspectors.

Cons:

- Violates the no-framework constraint for this package.
- Adds a dependency and build concern before the editor needs it.
- Risks blurring ownership between UI state and editor state.

### Chosen: Canvas 2D Rendering

Pros:

- Simple browser-native API.
- Enough for tile-based roguelike editing.
- Easy to test with existing browser test tooling.
- Avoids third-party renderers.

Cons:

- Advanced lighting, shaders, and very large animated views may eventually need WebGL.

### Alternative: WebGL From The Start

Pros:

- Better ceiling for huge maps, shader effects, and batched animated tiles.

Cons:

- More implementation complexity for the first package version.
- Harder test setup.
- Premature for a first editor scaffold.

### Chosen: Shared BroughlikeMap JSON Boundary

Pros:

- Reuses the existing `@bruff/contracts` runtime parser instead of inventing a second map JSON shape.
- Keeps editor exports compatible with future map consumers that already know `floor`, `wall`, and `door` terrain values.
- Lets the internal chunked typed-array model evolve independently from interchange JSON.

Cons:

- The first serialized shape does not expose chunks, objects, flags, or entity metadata.
- Import/export must translate between compact terrain strings and internal numeric terrain IDs.

### Alternative: Editor-Specific Chunk JSON

Pros:

- Mirrors the internal representation more directly.
- Could serialize dirty chunks and metadata without projection.

Cons:

- Duplicates the newly added shared map contract.
- Prematurely locks a chunk storage format before the editor needs one.

### Chosen: Command ADT And Pure Apply/Undo Helpers

Pros:

- Aligns with repository preference for data-first functional code.
- Makes undo, redo, replay, batching, and future collaboration easier.
- Keeps command tests black-box and deterministic.

Cons:

- Requires careful value copying for changed chunks and stacks.

### Alternative: Command Classes With `apply()` / `undo()`

Pros:

- Familiar object-oriented editor pattern.

Cons:

- Conflicts with repository guidance against classes in domain code.
- Couples command data to behaviour and hidden mutable state too easily.

### Chosen: Arcade Dev URL `/tools-map`

Pros:

- Reuses the existing development-only tools router.
- Keeps `/tools` stable for Sigil.
- Leaves production routing unchanged.
- Gives the editor a clear local URL for browser testing.

Cons:

- Requires a small change in `@bruff/arcade` even though the editor package is otherwise independent.
- Expands the dev-only production bundle guard list.

### Alternative: Reuse `/tools` For Quilt

Pros:

- Fewer routes to document.

Cons:

- Displaces the existing Sigil route.
- Makes multiple development tools harder to discover and test independently.

## Implementation Constraints

- The Web Component class may use `this` only for platform lifecycle and instance fields.
- The Web Component class must not own editor state transitions, rendering execution, validation, preview-font loading, or browser-command implementations.
- Domain modules must use standalone functions and readonly records.
- Do not use DOM globals outside shell modules.
- Do not add third-party runtime packages other than existing workspace packages.
- Do not statically import `@bruff/quilt` from production-reachable Arcade modules.
- Do not use type assertions to coerce typed-array, canvas, DOM, or serialized data.
- Do not render individual tiles as DOM nodes.
- Do not redraw the whole terrain canvas for single-tile changes once chunks exist.
- Every exported function must declare an explicit return type.
- Public types must use TSDoc.
