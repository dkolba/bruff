# Sigil Tool — Constraints

## Dependency constraints

- Add `opentype.js` only to `@bruff/sigil`, not `@bruff/game`, `@bruff/game-element`, `@bruff/utils`, or `@bruff/arcade`.
- Add `@types/opentype.js` only to `@bruff/sigil` as a `devDependency`.
- `@bruff/sigil` must be imported only by the dev-only arcade router and package-local tests/docs.
- Verify the current `opentype.js` package version at implementation time before editing `pnpm-lock.yaml`.
- Verify the current `@types/opentype.js` package version at implementation time before editing `pnpm-lock.yaml`.
- Do not add a WOFF2 decompressor dependency in the first version.
- Keep generated glyph JSON independent of `opentype.js`; downstream runtime consumers should need only the JSON and Canvas `Path2D`.

## Bundle constraints

- The dev tools router must be loaded only behind an `import.meta.env.DEV` branch.
- Production-reachable arcade modules must not statically import `@bruff/sigil`.
- Production builds must not contain `tool-sigil`, `@bruff/sigil`, `opentype`, or the dev tools router module name in emitted assets.
- `/tools` is a dev route only. Production builds fall back to the default game mount instead of exposing a dormant tool page.

## Font and glyph constraints

- Generate glyph paths at `font.unitsPerEm` to preserve font-unit precision.
- Store `unitsPerEm` with each glyph entry.
- Store `advanceWidth` from the glyph.
- Store bounds from `glyph.getBoundingBox()` as `{ x1, y1, x2, y2 }`.
- Serialize paths with a fixed decimal precision of `2` unless implementation testing shows this loses required shape detail.
- Extract one glyph per Unicode code point with `font.charToGlyph(char)`.
- Do not attempt complex shaping, ligature substitution, or grapheme-cluster extraction in the first version.
- Default glyph names must be deterministic lowercase code point keys such as `u2605`.
- Edited glyph names must be non-empty after trimming, unique within the export, contain no Unicode control characters, and preserve printable Unicode characters exactly, including emoji and symbols.
- The final JSON object is keyed by the edited glyph names, not by raw characters.

## Browser and UX constraints

- Uploaded font data stays local to the browser session.
- Revoke object URLs created for font preview and JSON download when replaced or when the component disconnects.
- Do not trigger a download until the user activates the download control.
- The download filename should be deterministic, defaulting to `sigil.json`.
- Render visible error text for invalid fonts, unsupported WOFF2, and missing glyphs.
- Render visible validation text for invalid or duplicate glyph names.
- Keep the download action disabled until every included glyph has a valid unique name.
- Missing glyph errors must not discard successfully extracted glyph drafts from the same input.
- Glyph previews must render with the latest uploaded font face.
- Glyph-name input events must not recreate the focused input element or otherwise drop focus while the user is typing.
- Stale asynchronous font parse or preview-font load completions must not overwrite the current selected font state.
- Stale preview-font rejections must not clear a newer preview.
- Clearing the file input must clear parsed font state, extraction results, errors, and preview font resources.
- The component must remain usable in desktop and mobile Playwright viewports.

## Component composition constraints

- Keep `<tool-sigil>` as a plain custom element with no Lit, React, Vue, or other rendering framework.
- Do not introduce child custom elements or slot-based composition for the minimal component decomposition.
- `ToolSigil` should coordinate handlers and lifecycle while state transitions, selectors, rendering, bindings, preview resources, and download commands live in focused modules.
- Pure state and view-model helpers must avoid DOM access.
- Browser APIs must stay in renderer, binding, download, and preview resource modules.
- Component composition must not change the exported glyph JSON shape, WOFF2 support policy, public tag name, shadow DOM controls, or arcade dev route.

## Testing constraints

- Use TDD during implementation: placeholder test first, then implementation; extractor tests before extraction implementation.
- `@bruff/sigil` package tests run in real browsers via Vitest + Playwright, matching `@bruff/game-element`.
- `@bruff/arcade` route tests run through Playwright E2E.
- Production bundle exclusion is verified by `packages/arcade/scripts/check-bundle-clean.mjs`.
- Tests assert the JSON schema and representative extraction behaviour through public functions or visible UI only.
- Avoid snapshot tests for the tool UI unless static DOM regression coverage is explicitly needed later.

## Source references

- `opentype.js` README documents browser loading via `File.arrayBuffer()` and `opentype.parse(...)`: https://github.com/opentypejs/opentype.js
- `opentype.js` README documents `font.unitsPerEm`, `font.charToGlyph`, `glyph.getPath`, `glyph.getBoundingBox`, and drawing/path APIs: https://github.com/opentypejs/opentype.js
- Project homepage and live demo: https://opentype.js.org/
