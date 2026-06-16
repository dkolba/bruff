# Sigil Tool — Design

## Layer assignment

| Module or file                                         | Package         | Layer                                                                                                                   |
| ------------------------------------------------------ | --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `packages/sigil/module/tool-sigil.ts`                  | `@bruff/sigil`  | Imperative web-component shell: shadow DOM, file input, preview, object URLs, download click wiring.                    |
| `packages/sigil/module/tool-sigil-state.ts`            | `@bruff/sigil`  | Pure reducer-style state, state transition functions, selectors, and view-model helpers.                                |
| `packages/sigil/module/tool-sigil-render.ts`           | `@bruff/sigil`  | DOM rendering boundary for the tool shadow root from a view model and handler bundle.                                   |
| `packages/sigil/module/tool-sigil-bindings.ts`         | `@bruff/sigil`  | DOM event-listener binding boundary for root tool controls.                                                             |
| `packages/sigil/module/tool-sigil-preview-resource.ts` | `@bruff/sigil`  | Browser preview-font resource coordinator with load, clear, and disconnect commands.                                    |
| `packages/sigil/module/register-tool-sigil.ts`         | `@bruff/sigil`  | Imperative custom-element registration boundary.                                                                        |
| `packages/sigil/module/glyph-json.ts`                  | `@bruff/sigil`  | Pure data types and JSON serialization shape for extracted glyphs.                                                      |
| `packages/sigil/module/glyph-name.ts`                  | `@bruff/sigil`  | Pure glyph-name defaults and validation.                                                                                |
| `packages/sigil/module/extract-glyphs.ts`              | `@bruff/sigil`  | Pure-ish transformation over an already parsed `opentype.js` font object and input string; no DOM.                      |
| `packages/sigil/module/font-file.ts`                   | `@bruff/sigil`  | Shell boundary around `File.arrayBuffer()` and `opentype.parse()`, returning `Result` values.                           |
| `packages/sigil/index.ts`                              | `@bruff/sigil`  | Package entry point; registers `<tool-sigil>` by importing the registration module and exports public types/functions.  |
| `packages/arcade/dev-tools-router.ts`                  | `@bruff/arcade` | Dev-only application-shell router from `location.pathname` to a custom element tag name; excluded from production.      |
| `packages/arcade/app.ts`                               | `@bruff/arcade` | Imperative app bootstrap: dynamically imports the dev router only in dev mode and imports the game on the default path. |
| `packages/arcade/index.html`                           | `@bruff/arcade` | Stable host container for route mounting.                                                                               |

`@bruff/sigil` is an application tool package, not game logic. DOM APIs are allowed in the web component and file-loading shell modules. Extraction and JSON shaping stay as small testable functions so the browser UI is thin.

Pure state and view-model helpers avoid DOM access. Browser APIs stay in renderer, binding, download, and preview resource modules so `ToolSigil` remains a small coordinator.

## Public API surface

```ts
/** Extracted glyph bounds in font units. */
export type SigilGlyphBounds = Readonly<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}>;

/** Compact glyph payload suitable for future runtime rendering. */
export type SigilGlyph = Readonly<{
  name: string;
  unicode: string;
  advanceWidth: number;
  unitsPerEm: number;
  bounds: SigilGlyphBounds;
  path: string;
}>;

/** Downloadable glyph JSON keyed by stable glyph names. */
export type SigilGlyphMap = Readonly<Record<string, SigilGlyph>>;

/** Extracted glyph before the user-editable name is applied. */
export type SigilGlyphDraft = Readonly<{
  defaultName: string;
  glyph: SigilGlyph;
}>;

/** Extraction report that can carry valid drafts and non-fatal errors together. */
export type SigilExtractionReport = Readonly<{
  drafts: ReadonlyArray<SigilGlyphDraft>;
  errors: ReadonlyArray<SigilExtractionError>;
}>;

/** User-facing extraction failure. */
export type SigilExtractionError = Readonly<{
  type:
    | "empty-input"
    | "invalid-font"
    | "unsupported-font-format"
    | "missing-glyph"
    | "invalid-glyph-name"
    | "duplicate-glyph-name"
    | "download-failed";
  message: string;
}>;

export const extractSigilGlyphs: (
  font: opentype.Font,
  characters: string,
) => SigilExtractionReport;

export const codePointKey: (character: string) => string;

export const isValidGlyphName: (name: string) => boolean;

export const createSigilGlyphMap: (
  drafts: ReadonlyArray<SigilGlyphDraft>,
  namesByUnicode: Readonly<Record<string, string>>,
) => Result<SigilGlyphMap, ReadonlyArray<SigilExtractionError>>;
```

`ToolSigil` is exported for tests and registration, but consumers normally import `@bruff/sigil` for the side effect of defining `<tool-sigil>`. Production-reachable code must not import `@bruff/sigil`.

Component composition keeps the public element API stable while adding internal module APIs:

- `tool-sigil-state.ts` exports `ToolSigilState`, `createToolSigilState`, state transition functions, and selectors for visible errors, download eligibility, and downloadable glyph maps.
- `tool-sigil-render.ts` exports `renderToolSigil(shadowRoot, viewModel, handlers)`.
- `tool-sigil-bindings.ts` exports `connectToolSigilControls(shadowRoot, handlers)` for root control listeners.
- `tool-sigil-preview-resource.ts` exports `ToolSigilPreviewResource`, a small composed object with `load`, `clear`, and `disconnect` methods.
- `tool-sigil.ts` keeps exporting `ToolSigil` and `ToolSigil.template()`.

## Data flow

```
/tools route
   │
   ▼
@bruff/arcade dev router
   │
   ▼
<tool-sigil>
   │
   ├── font file ──► File.arrayBuffer() ──► opentype.parse()
   │                                      │
   │                                      ▼
   ├── typed characters ───────────► extractSigilGlyphs()
   │                                      │
   │                                      ▼
   ├── editable names + preview ◄── SigilExtractionReport
   │                                      │
   │                                      ▼
   ├── current names ──────────────► createSigilGlyphMap() as entry name fields
   │
   ▼
Blob(JSON.stringify(map, null, 2)) ──► object URL ──► download link click
```

Component composition keeps the same user-facing flow but decomposes the element internals:

```text
DOM event -> ToolSigil handler -> state transition -> renderer
font file -> font loader + preview resource -> state transition -> renderer
download click -> selector -> glyph-download command
```

The extractor uses `font.charToGlyph(character)` for each distinct code point. For each glyph it calls `glyph.getPath(0, 0, font.unitsPerEm)` and serializes the result with `path.toPathData(2)`. Bounds are captured with `glyph.getBoundingBox()`. `font.unitsPerEm` is preserved in every glyph entry so later canvas rendering can scale with `size / unitsPerEm` and flip the Y axis at draw time.

`extractSigilGlyphs` returns a `SigilExtractionReport`, not the final JSON object. Missing glyphs are non-fatal report errors: the report keeps every successfully extracted draft and carries missing-glyph errors beside them. Empty input reports an empty draft list plus an empty-input error. The web component owns the editable name form state and download availability. `createSigilGlyphMap` validates the current names, rejects empty/control-character/duplicate names, and then creates the final JSON object in the same order as the drafts. Name validation is Unicode-permissive: printable emoji and symbols are valid entry `name` values and must be preserved exactly.

## Review follow-up design

### Partial extraction

- **Chosen — return `SigilExtractionReport` from `extractSigilGlyphs`.** Missing glyphs and empty input are user-correctable extraction states, not thrown or fatal errors. A report can carry valid drafts and visible errors together without overloading `Result.error`.
- **Rejected — keep `Result<ReadonlyArray<SigilGlyphDraft>, ReadonlyArray<SigilExtractionError>>`.** It cannot represent `★` extracted and `?` missing at the same time without dropping either the valid draft or the error.

### Uploaded-font preview

- **Chosen — create a per-selection browser font face and apply its family to glyph previews.** `ToolSigil` should create a unique preview font family for the selected file, load it through the shell, apply that family to `.glyph-preview`, and clean up the prior preview resource when the selected font changes or the component disconnects.
- **Rejected — render raw Unicode characters with browser fallback fonts.** It fails icon and private-use fonts because the visible glyph may come from a system font instead of the uploaded font.
- **Rejected — convert every glyph path into SVG preview markup.** It would avoid `FontFace`, but it duplicates rendering logic and makes the form heavier than needed for a first fix.

### Font-load ordering

- **Chosen — gate every asynchronous font parse and preview-font load with a monotonically increasing selection token.** Selecting or clearing a file increments the token. Promise completions apply only when their captured token still matches the current token.
- **Rejected — compare filenames only.** Users can select two different files with the same name, and parse completion order can still race.

### Preview-resource disconnect

- **Chosen — invalidate the preview resource token on `clear()` and `disconnect()`.** This keeps `ToolSigil` as a small coordinator while ensuring late `FontFace.load()` completions cannot install browser fonts or call back into a disconnected component.
- **Rejected — rely only on `ToolSigilState` stale-token checks.** State checks can prevent visible state changes, but they run after the preview resource has already had a chance to install a `FontFace` into `document.fonts`.

### Glyph-name editing focus

- **Chosen — update validation and download state without replacing focused glyph-name rows on every `input` event.** The component should preserve the current input element and value while typing, then rerender rows only when the draft set changes.
- **Rejected — rerender the whole glyph list and restore focus afterward.** It is more fragile because selection ranges and browser composition state can still be disrupted.

## Dev-only routing design

The route helper lives in `packages/arcade/dev-tools-router.ts`, not in a production-reachable route module:

```ts
export type ArcadeRoute = "game" | "tools";

export const routePathname = (pathname: string): ArcadeRoute =>
  pathname === "/tools" ? "tools" : "game";

const routeElementName = (route: ArcadeRoute): "bruff-game" | "tool-sigil" =>
  route === "tools" ? "tool-sigil" : "bruff-game";
```

`app.ts` mounts `<bruff-game>` as the production default and imports `@bruff/game` only on the default route path. It may only import the dev router through an `import.meta.env.DEV` guard:

```ts
const mountApp = async (): Promise<void> => {
  if (import.meta.env.DEV) {
    const { mountDevRoute, routePathname } =
      await import("./dev-tools-router.js");
    if (routePathname(globalThis.location.pathname) === "tools") {
      mountDevRoute(globalThis.location.pathname);
      return;
    }

    mountElement("bruff-game");
    await import("@bruff/game");
    return;
  }

  mountElement("bruff-game");
  await import("@bruff/game");
};
```

`dev-tools-router.ts` imports `@bruff/sigil`, registers `<tool-sigil>`, maps `/tools` to the tool element, and maps all other paths to `<bruff-game>`. Because the dev router and `@bruff/sigil` are reached only through the `import.meta.env.DEV` branch, Vite production builds should tree-shake the branch and omit the router chunk, custom element, and `opentype.js`.

## Placeholder-first implementation

The first implementation task creates a registered `<tool-sigil>` placeholder that renders static shell content and has no file parsing. This establishes the package and custom element registration before adding OpenType extraction. The `/tools` route wires that placeholder only through `dev-tools-router.ts`. The placeholder is removed or expanded in later tasks; no temporary public API should leak beyond the custom element tag.

## Component composition design

- **Chosen — reducer-style state helpers plus composed resource, binding, and render modules.** This keeps the existing public element and tests stable while reducing `ToolSigil` method count.
- **Rejected — child custom elements for glyph rows and controls.** This would improve decomposition further, but it would expand the public DOM/component surface and is not needed for the minimal refactor.
- **Rejected — mixins.** They would reduce methods on `ToolSigil`, but still rely on inheritance mechanics and are less explicit than composed helpers.

The composition refactor reuses the existing extractor, glyph-name validation, preview-font, DOM fragment, error element, text, and download modules instead of changing tool behaviour.

## Production bundle guard

`packages/arcade/scripts/check-bundle-clean.mjs` rejects production bundles that expose test-only APIs or development-only tool code. It scans emitted production assets for:

- `__bruffTestApi`
- `tool-sigil`
- `@bruff/sigil`
- `opentype`
- `dev-tools-router`

The check runs as part of `pnpm --filter @bruff/arcade run build`, so accidental static imports of the dev router or sigil package fail before merge. Production source maps remain emitted with source contents excluded so dev-only source text is not embedded in production assets.

## OpenType dependency notes

The `opentype.js` README documents browser file input via `File.arrayBuffer()` followed by `opentype.parse(...)`, Node loading via `fs`, `font.unitsPerEm`, `font.charToGlyph(char)`, `glyph.getPath(x, y, fontSize)`, `glyph.getBoundingBox()`, and path serialization through `Path.toPathData()`. The project page describes the library as a parser/writer for OpenType and TrueType fonts and points to a live demo. The package supports TTF, OTF, and WOFF; WOFF2 requires separate decompression and is excluded from the first version. Add `@types/opentype.js` as a `devDependency` of `@bruff/sigil` so TypeScript can type `opentype.Font`, `Glyph`, and parser APIs without weakening local types.

## Tradeoffs and alternatives considered

### Browser tool vs Node extractor

- **Chosen — browser web component extractor.** Matches the requested `/tools` frontend workflow and keeps this feature immediately usable by uploading local fonts.
- **Rejected — Node-only extractor script.** Best matches a production build step, but it would not satisfy the requested web component UI.
- **Deferred — shared browser and Node extractor package.** Useful later if glyph extraction becomes part of CI or asset generation, but it adds API pressure before the first tool exists.

### Direct `HTMLElement` vs extending `GameElement`

- **Chosen — direct `HTMLElement`.** The sigil tool needs form controls and download behaviour, not a full-viewport game canvas or HUD.
- **Rejected — extend `GameElement`.** It would inherit game-specific markup and responsibilities, violating the "one responsibility per file/package" guidance.

### Glyph names and JSON fields

- **Chosen — editable Unicode names with deterministic defaults (`u2605`) stored in glyph `name` fields.** Gives the user meaningful names such as `star`, `⭐`, and `heart★` while preserving stable top-level keys and a no-typing path.
- **Rejected — deterministic code point names only.** Simpler, but produces less useful assets and no longer matches the required editable glyph-name workflow.
- **Rejected — ASCII identifier names only.** Easier to consume as dot-property names in code, but it blocks the requested emoji and symbol names. Consumers can use bracket access for symbolic keys.
- **Rejected — raw character keys.** Compact, but hard to inspect for whitespace and some symbols, and awkward for downstream imports.

### Path format

- **Chosen — SVG path strings.** `Path2D(svgPath)` can consume them later, and `opentype.js` exposes `toPathData(decimalPlaces)`.
- **Rejected — command arrays or binary packing.** Smaller possible output, but unnecessary complexity before runtime use proves a size problem.

### Dev-only routing boundary

- **Chosen — dynamic import behind `import.meta.env.DEV`.** Keeps the router and `@bruff/sigil` out of production while preserving a simple `/tools` route during local development.
- **Rejected — static route module imported by `app.ts`.** Even if the route never activates in production, static imports risk pulling the router and `opentype.js` into the production graph.
- **Rejected — production route with hidden UI.** It violates the requirement that neither the router nor the web component be present in the production bundle.

## Reuse map

- `packages/game-element/package.json` — package script and browser-test dependency template.
- `packages/game-element/tsconfig.json` — package-level TypeScript config shape.
- `packages/game-element/vitest.config.ts` — real-browser Vitest setup and coverage style.
- `packages/game-element/eslint.config.js` — shared ESLint config import pattern.
- `packages/game-element/module/game-element.ts` — shadow-DOM idempotency pattern, not the base class.
- `packages/utils/module/fp/result.ts` — existing `Result` shape for typed name-validation and extraction errors.
- `packages/sigil/module/extract-glyphs.ts` — pure extraction.
- `packages/sigil/module/glyph-name.ts` — glyph name validation and JSON mapping.
- `packages/sigil/module/preview-font.ts` — `FontFace` allocation, loading, install, and deletion.
- `packages/sigil/module/glyph-preview.ts`, `packages/sigil/module/error-elements.ts`, and `packages/sigil/module/dom-text.ts` — DOM fragments and safe text helpers.
- `packages/sigil/module/glyph-download.ts` — browser download command.
- `packages/arcade/app.ts` — current app bootstrap, to be expanded from a single import into production game mounting plus dev-only dynamic router import.
- `packages/arcade/index.html` — current host document, to gain a stable mount node.
- `packages/arcade/scripts/check-bundle-clean.mjs` — production asset scan to extend with dev-tool exclusion checks.
- `packages/arcade/e2e/accessibility.spec.ts` — precedent for route-level browser accessibility checks.

## Documentation updates

- Add `packages/sigil/README.md` describing the tool, JSON output schema, development commands, and unsupported WOFF2/complex-shaping limitations.
- Add `packages/sigil/AGENTS.md` allowing DOM/file/download side effects only in shell modules and keeping extraction functions typed and testable.
- Update root `AGENTS.md` workspace map with `@bruff/sigil`.
- Update `packages/arcade/README.md` to document `/tools` as a development-only tools route and state that production builds exclude it.
