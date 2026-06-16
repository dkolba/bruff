# Quilt Grid Size and Glyph I/O Design

## Layer assignment

| Area                    | Files                                                                                                                       | Responsibility                                                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Contracts               | `packages/contracts/module/broughlike-map-json.ts`, `packages/contracts/module/broughlike-map-json.test.ts`                 | Extend the shared broughlike map contract so square maps up to 9x9 are valid. Keep `BroughlikeTerrain` as the source of terrain values. |
| Contracts export        | `packages/contracts/index.ts`                                                                                               | Continue exporting broughlike map and Sigil glyph contracts used by Quilt.                                                              |
| Quilt model             | `packages/quilt/module/model/tile-map-data.ts`, `packages/quilt/module/model/tile-map-data.test.ts`                         | Add pure map resizing that preserves in-bounds terrain and initializes new cells as floor.                                              |
| Quilt state             | `packages/quilt/module/state/quilt-state.ts`, `packages/quilt/module/state/quilt-state.test.ts`                             | Store selected draw terrain explicitly and optional imported glyph rendering data in immutable editor state.                            |
| Quilt commands          | `packages/quilt/module/commands/editor-command.ts`, `packages/quilt/module/state/execute-editor-command.ts`, matching tests | Add resize command data and reducer handling so resize is undoable and dirty chunks are deterministic.                                  |
| Quilt storage           | `packages/quilt/module/storage/broughlike-map.ts`, `packages/quilt/module/storage/broughlike-map.test.ts`                   | Serialize resized maps through `BroughlikeMap`; retain typed `Result.error` parsing for invalid map JSON.                               |
| Quilt glyph import      | `packages/quilt/module/storage/sigil-glyph-map.ts`, `packages/quilt/module/storage/sigil-glyph-map.test.ts`                 | Parse uploaded Sigil glyph JSON through `parseSigilGlyphMap` and project only terrain glyph paths into Quilt rendering data.            |
| Quilt rendering         | `packages/quilt/module/render/map-draw-plan.ts`, `packages/quilt/module/render/canvas-renderer.ts`, matching tests          | Add terrain draw commands that can render imported glyph paths in dark gray, while preserving fallback fill rendering.                  |
| Quilt browser commands  | `packages/quilt/module/browser/quilt-browser-command.ts`, `packages/quilt/module/browser/quilt-browser-command.test.ts`     | Add command data for JSON download and file upload/read boundaries; keep side effects out of `QuiltElement`.                            |
| Quilt template          | `packages/quilt/module/template.ts`, `packages/quilt/module/template.test.ts`                                               | Add grid-size select, terrain draw buttons, export button, import button/file input, and error region.                                  |
| Quilt controller        | `packages/quilt/module/controller/quilt-controller.ts`, `packages/quilt/module/controller/quilt-controller.test.ts`         | Wire toolbar DOM events to pure state updates and commands; keep pointer drawing using the currently selected terrain.                  |
| Quilt runtime           | `packages/quilt/module/runtime/quilt-runtime.ts`, `packages/quilt/module/runtime/quilt-runtime.test.ts`                     | Own runtime references to toolbar controls, import/export callbacks, canvas resizing, redraw scheduling, and cleanup.                   |
| Quilt element           | `packages/quilt/module/quilt-element.ts`, `packages/quilt/module/quilt-element.test.ts`                                     | Keep the custom element as a small lifecycle coordinator that delegates to runtime helpers.                                             |
| Quilt public API        | `packages/quilt/index.ts`                                                                                                   | Export new pure resize, glyph parsing, and terrain selection types that are safe for consumers.                                         |
| Arcade E2E              | `packages/arcade/e2e/quilt-interaction.spec.ts`, `packages/arcade/e2e/tools-route.spec.ts`                                  | Cover resize preservation, terrain draw buttons, JSON export, glyph import rendering, and existing dev-only route behaviour.            |
| Arcade production guard | `packages/arcade/scripts/check-bundle-clean.mjs`                                                                            | Keep existing production bundle checks for Quilt and `/tools-map`; no new production route exposure.                                    |

Quilt keeps a functional core and imperative shell. Model, command, storage, and render-plan modules stay pure. DOM APIs, `File`, object URLs, download clicks, file input events, and Canvas 2D execution stay in browser/runtime/controller/render executor modules allowed by `packages/quilt/AGENTS.md`.

## Public API surface

Contracts remain the source of JSON shapes:

```ts
export type {
  BroughlikeMap,
  BroughlikeTerrain,
  SigilGlyphMap,
} from "@bruff/contracts";
```

Model resize API:

```ts
export type QuiltGridSize = 4 | 5 | 6 | 7 | 8 | 9;

export const QUILT_GRID_SIZES: ReadonlyArray<QuiltGridSize>;

export type ResizeTileMapDataInput = Readonly<{
  tileMapData: TileMapData;
  width: QuiltGridSize;
  height: QuiltGridSize;
}>;

export const resizeTileMapData = (
  input: ResizeTileMapDataInput,
): TileMapData;
```

State additions:

```ts
export type QuiltTerrainDrawMode = BroughlikeTerrain;

export type QuiltTerrainGlyph = Readonly<{
  terrain: BroughlikeTerrain;
  path: string;
  bounds: SigilGlyphBounds;
  advanceWidth: number;
  unitsPerEm: number;
}>;

export type QuiltTerrainGlyphMap = Readonly<
  Partial<Record<BroughlikeTerrain, QuiltTerrainGlyph>>
>;
```

`QuiltState` gains readonly fields:

```ts
selectedTerrain: QuiltTerrainDrawMode;
terrainGlyphs: QuiltTerrainGlyphMap;
visibleErrors: ReadonlyArray<QuiltUserVisibleError>;
```

Command additions:

```ts
export type ResizeMapCommand = Readonly<{
  type: "RESIZE_MAP";
  beforeTileMapData: TileMapData;
  afterTileMapData: TileMapData;
}>;

export type EditorCommand = PaintTilesCommand | ResizeMapCommand;

export const createResizeMapCommand = (
  input: CreateResizeMapCommandInput,
): ResizeMapCommand;
```

Glyph import storage API:

```ts
export type ParseQuiltTerrainGlyphsError = Readonly<{
  reason: "INVALID_QUILT_TERRAIN_GLYPHS";
  source: ParseSigilGlyphMapError;
}>;

export const parseQuiltTerrainGlyphs = (
  input: unknown,
): Result<QuiltTerrainGlyphMap, ParseQuiltTerrainGlyphsError>;
```

Browser command API:

```ts
export type DownloadJsonCommand = Readonly<{
  type: "downloadJson";
  filename: string;
  json: string;
}>;

export type ReadJsonFileCommand = Readonly<{
  type: "readJsonFile";
  file: File;
}>;
```

The exact names can be adjusted during implementation if current Quilt naming requires it, but the exposed API must keep contracts as the source of `BroughlikeTerrain`, `BroughlikeMap`, and `SigilGlyphMap`.

## Data shape changes

No `GameState` changes are required.

`BroughlikeMap` in `packages/contracts/module/broughlike-map-json.ts` changes its maximum accepted width and height from 7 to 9 so Quilt can export and validate 8x8 and 9x9 maps through the shared contract.

`TileMapData` remains chunked typed-array data. Resizing returns a new `TileMapData` with the requested width and height, new chunks, preserved in-bounds terrain values, and floor-filled new cells. Existing entity metadata is preserved only when entity tile coordinates remain in bounds; if current entity records do not expose enough position data to filter safely, this design will leave entity maps empty during resize because this slice edits terrain only.

`QuiltState` adds selected terrain and imported terrain glyphs. `selectedTool` may remain `"paint" | "erase" | "select"` for existing behaviour, but the terrain draw buttons set `selectedTool` to `"paint"` and set both `selectedTerrain` and `selectedTileId` consistently.

## Data flow

```text
Toolbar select/button/file input
        |
        v
controller/runtime shell
        |
        v
pure command or parser ---------------------+
        |                                   |
        v                                   v
QuiltState + TileMapData              QuiltTerrainGlyphMap
        |                                   |
        +---------------+-------------------+
                        v
               render draw plan
                        v
              Canvas 2D executor
```

Export flow:

```text
QuiltState.tileMapData -> serializeBroughlikeMapData -> JSON.stringify -> download command executor
```

Import flow:

```text
File -> Blob#text() -> JSON.parse -> parseQuiltTerrainGlyphs -> QuiltState.terrainGlyphs -> redraw
```

## Architectural decisions and tradeoffs

### Grid size contract

Chosen: update `@bruff/contracts` to allow broughlike maps up to 9x9, then reuse that contract from Quilt export and any map parse tests.

Alternative considered: keep contracts capped at 7 and let Quilt export 8x8/9x9 with a local schema. That would violate the request to use `packages/contracts` for available shapes and types and would make 8x8/9x9 exports invalid to the shared parser.

### Resize semantics

Chosen: top-left anchored resize that copies every preserved coordinate from the old map to the same coordinate in the new map.

Alternative considered: center-anchored resize. Center anchoring can be useful for visual layout, but it silently shifts authored tile coordinates and makes deterministic export comparisons harder.

### Resize command storage

Chosen: store `beforeTileMapData` and `afterTileMapData` in `ResizeMapCommand` for simple exact undo/redo.

Alternative considered: store only old/new dimensions and reconstruct terrain deltas. Delta storage uses less memory for large maps, but Quilt maps in this slice are at most 9x9 and full snapshots keep the reducer obvious and safe.

### Terrain draw controls

Chosen: replace the previous generic Paint/Erase distinction in the visible toolbar with explicit terrain draw buttons for `floor`, `wall`, and `door`, while preserving the existing command model of paint tile changes.

Alternative considered: keep Paint/Erase and add a separate terrain palette. That creates two controls that both affect one tile click and is less direct for the requested workflow.

### Glyph rendering

Chosen: project imported Sigil glyph entries into terrain draw-plan commands, then execute paths in `canvas-renderer.ts` with dark gray fill after scaling each glyph path to the tile rectangle. The glyph bounding-box is centered within the tile so the visible path content is evenly positioned. Each tile is cleared before its glyph is drawn so replacing a terrain type (e.g. drawing wall over floor) does not leave the old glyph visible underneath.

Alternative considered: convert glyph paths into offscreen raster images during import. Raster caching may help later, but it adds browser-specific cache lifecycle and image invalidation before performance requires it.

### Import boundary

Chosen: parse JSON in the browser shell, pass the unknown parsed value to a pure `parseQuiltTerrainGlyphs`, and store only validated terrain glyph data in `QuiltState`.

Alternative considered: store raw uploaded JSON and validate inside rendering. That would push validation errors into rendering, make failures harder to test, and risk runtime exceptions during draw.

### Error handling

Chosen: browser file and JSON parse failures become typed result/error values that the runtime projects into a visible error region.

Alternative considered: let `JSON.parse` or file APIs throw to the component. That violates the project exception-free rule and makes browser tests flaky.

## Reuse map

- `packages/contracts/module/broughlike-map-json.ts` supplies `BroughlikeMap`, `BroughlikeTerrain`, `broughlikeTerrainSchema`, and `parseBroughlikeMap`.
- `packages/contracts/module/sigil-glyph-json.ts` supplies `SigilGlyphMap`, `SigilGlyphBounds`, and `parseSigilGlyphMap`.
- `packages/quilt/module/model/tile-map-data.ts` supplies `createTileMapData`, `getTile`, `setTile`, `floorTileId`, `wallTileId`, and `doorTileId`.
- `packages/quilt/module/storage/broughlike-map.ts` supplies `serializeBroughlikeMapData` and `parseBroughlikeMapData`.
- `packages/quilt/module/commands/editor-command.ts` supplies existing paint command data.
- `packages/quilt/module/state/execute-editor-command.ts` supplies existing undo/redo patterns and dirty chunk calculation.
- `packages/quilt/module/render/map-draw-plan.ts` supplies terrain and overlay draw-plan projection.
- `packages/quilt/module/render/canvas-renderer.ts` supplies the Canvas 2D execution boundary, including per-tile clear-before-glyph and centering logic.
- `packages/quilt/module/runtime/quilt-runtime.ts` applies `devicePixelRatio` when sizing the canvas buffer to produce crisp vector rendering on high-DPI displays.
- `packages/quilt/module/runtime/quilt-runtime.ts` supplies mounted state, redraw, and cleanup patterns.
- `packages/quilt/module/controller/quilt-controller.ts` supplies pointer-to-command conversion.
- `packages/quilt/module/template.ts` supplies toolbar and canvas DOM creation.
- `packages/quilt/module/browser/quilt-browser-command.ts` supplies browser command data patterns.
- `packages/arcade/e2e/quilt-interaction.spec.ts` supplies deterministic Quilt interaction testing at `/tools-map`.
- `packages/arcade/scripts/check-bundle-clean.mjs` supplies production bundle exclusion checks.

## Testing strategy

- Contract unit tests prove 4x4 through 9x9 broughlike maps parse and invalid sizes still fail.
- Quilt model tests prove smaller and larger resizes preserve coordinates and initialize new cells as floor.
- Quilt command tests prove resize command data is plain, undoable, redoable, and marks all chunks dirty.
- Quilt state/controller tests prove `floor`, `wall`, and `door` buttons select the correct terrain and draw clicks write matching tile IDs.
- Quilt storage tests prove export serializes deterministic JSON and glyph import uses `parseSigilGlyphMap`.
- Render-plan and canvas executor tests prove imported paths create dark-gray path commands and fallback fills still work.
- Runtime/template tests prove controls exist, file import errors are visible, downloads use current map JSON, and cleanup removes listeners.
- Arcade E2E tests cover the complete browser flow on `/tools-map` without weakening production bundle guards.
