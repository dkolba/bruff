# Sigil Component Composition Design

## Layer assignment

All new modules live in `packages/sigil/module` because `@bruff/sigil` is the browser-only development tool shell. Pure state and view-model helpers avoid DOM access; browser APIs stay in renderer, binding, download, and preview resource modules.

## Public API surface

- `tool-sigil-state.ts` exports `ToolSigilState`, `createToolSigilState`, state transition functions, and selectors for visible errors, download eligibility, and downloadable glyph maps.
- `tool-sigil-render.ts` exports `renderToolSigil(shadowRoot, viewModel, handlers)`.
- `tool-sigil-bindings.ts` exports `connectToolSigilControls(shadowRoot, handlers)` for root control listeners.
- `tool-sigil-preview-resource.ts` exports `ToolSigilPreviewResource`, a small composed object with `load`, `clear`, and `disconnect` methods.
- `tool-sigil.ts` keeps exporting `ToolSigil` and `ToolSigil.template()`.

## Data flow

```text
DOM event -> ToolSigil handler -> state transition -> renderer
font file -> font loader + preview resource -> state transition -> renderer
download click -> selector -> glyph-download command
```

## Tradeoffs

- Chosen: reducer-style state helpers plus composed resource/binding/render modules. This keeps the existing public element and tests stable while reducing `ToolSigil` method count.
- Alternative considered: child custom elements for glyph rows and controls. That would improve decomposition further, but it would expand the public DOM/component surface and is not needed for the minimal refactor.
- Alternative considered: mixins. They would reduce methods on `ToolSigil`, but still rely on inheritance mechanics and are less explicit than composed helpers.

## Reuse map

- Reuse `packages/sigil/module/extract-glyphs.ts` for pure extraction.
- Reuse `packages/sigil/module/glyph-name.ts` for glyph name validation and JSON mapping.
- Reuse `packages/sigil/module/preview-font.ts` for `FontFace` allocation, loading, install, and deletion.
- Reuse `packages/sigil/module/glyph-preview.ts`, `error-elements.ts`, and `dom-text.ts` for DOM fragments.
- Reuse `packages/sigil/module/glyph-download.ts` for the browser download command.
