# Sigil Tool

## Goal

Create a development-only frontend tool for extracting selected glyphs from an uploaded font into a compact JSON asset. The tool is exposed as a new `<tool-sigil>` web component from a new workspace package at `packages/sigil`, and `@bruff/arcade` routes `/tools` to that component only while running in dev mode. Production builds must not include the dev-tools router, the `<tool-sigil>` registration, `@bruff/sigil`, or `opentype.js`.

The `<tool-sigil>` web component must remain a small plain Web Component coordinator instead of accumulating state, rendering, validation, preview-font, and browser-command methods in one class.

## User-visible behaviour

- Navigating to `/tools` in the arcade dev server displays the sigil tool instead of `<bruff-game>`.
- In production builds, `/tools` is not a tool route and falls back to the normal game experience.
- Navigating to any current game route, including `/`, continues to display `<bruff-game>`.
- The `<tool-sigil>` custom element is registered only in dev mode.
- Production bundles contain no sigil tool router code, no `<tool-sigil>` registration code, no `@bruff/sigil` module, and no `opentype.js` parser code.
- The sigil tool shows a file input for a local font file.
- The sigil tool accepts TTF, OTF, and WOFF font files supported by `opentype.js`.
- After a font is loaded, the user can enter a string of characters into a text input or textarea.
- The entered characters render in the uploaded font so the user can visually confirm the glyphs before extraction.
- The tool shows one editable glyph-name field for each distinct typed Unicode code point, in first-seen order.
- Each glyph-name field is prefilled with a deterministic code point name such as `u2605`.
- The user can edit glyph names before downloading.
- The tool exposes a clear download action only when a font is loaded, at least one character has been entered, and every included glyph has a valid unique name.
- Activating the download action creates a JSON file containing one entry per distinct typed Unicode code point, keyed by the current user-editable glyph name.
- Each JSON entry includes the original character, its `advanceWidth`, the font `unitsPerEm`, the glyph bounds, and SVG path data generated at `font.unitsPerEm`.
- The generated JSON is suitable for later runtime use without shipping `opentype.js` or the original font file.
- Missing glyphs are reported in the UI and excluded from the downloadable JSON.
- When the input mixes extractable and missing glyphs, the extractable glyphs remain editable and downloadable while the missing glyphs are reported.
- Glyph previews use the uploaded font, not browser fallback fonts.
- Editing a glyph-name field keeps focus in that field while the user types multi-character names.
- Invalid or unsupported font files report a visible error state without throwing uncaught exceptions.
- Refactoring the component internals must keep the same public tag name and shadow DOM controls.
- Uploading, clearing, and replacing font files must keep the same behaviour after component composition refactors.
- Character input, glyph extraction, missing-glyph errors, editable glyph names, invalid-name handling, empty glyph output handling, and `sigil.json` downloads must keep the same behaviour after component composition refactors.
- Uploaded font previews must continue using a browser `FontFace` and must continue releasing preview resources when replaced or disconnected.
- Pending preview-font loads must be ignored after the component disconnects, including avoiding late `document.fonts.add(...)` calls and late preview-loaded callbacks.

## Out of scope

- Shipping extracted glyph JSON with the game.
- Adding a Node CLI extractor.
- Adding Lit, React, Vue, or another rendering framework.
- Adding child custom elements or slot-based composition.
- Preserving ligatures, complex script shaping, kerning pairs, or glyph substitutions. The first version extracts one glyph per Unicode code point.
- Supporting WOFF2 decompression in the browser.
- Supporting color glyph layers, emoji palettes, COLR/CPAL rendering, or SVG-in-font color output.
- Editing, subsetting, or saving a new font file.
- Adding authenticated or persistent storage for uploaded fonts or extracted JSON.
- Exposing the sigil tool in production, even behind a hidden route.
- Changing the exported JSON shape during component composition refactors.
- Changing the arcade dev route that hosts the tool during component composition refactors.

## Open questions (resolved)

- **Q: Should the package name be `sigil` or `@bruff/sigil`?**  
  A: Use directory `packages/sigil` and package name `@bruff/sigil` to match existing workspace package naming.

- **Q: Does "use `packages/game-element` as template" mean `ToolSigil` should extend `GameElement`?**  
  A: No. Reuse the package structure, scripts, browser-test setup, ESLint config shape, TypeScript config shape, and README conventions from `packages/game-element`. `ToolSigil` should extend `HTMLElement` directly because `GameElement` creates a game canvas and HUD that are not part of this tool.

- **Q: Should the custom element tag be `<tool-sigils>` or `<tool-sigil>`?**  
  A: Use singular `<tool-sigil>` to match the requested tag name. The package can remain `@bruff/sigil` because it owns the sigil tool domain.

- **Q: Is `opentype.js` a runtime dependency of the shipped game?**  
  A: No. It is a dependency of the development tool package only. `@types/opentype.js` is added as a package-local development dependency so TypeScript can type the parser API. The output JSON is the asset intended for future game/runtime use.

- **Q: Should extraction happen in Node.js or the browser?**  
  A: The requested user experience is browser-based file upload, preview, and JSON download, so the first implementation extracts in the browser with `opentype.parse(await file.arrayBuffer())`. The JSON schema follows the recommended build-time output so a future Node extractor can share it.

- **Q: How are JSON object keys generated?**  
  A: Each distinct character gets an editable glyph-name field. The default is a deterministic lowercase Unicode key: `u` plus the code point in hexadecimal, joined with `_` only if a later version supports multi-code-point sequences. Example: `★` defaults to `u2605`, and the user may rename it to `star` before downloading.

- **Q: What names are valid?**  
  A: Glyph names must be non-empty after trimming, unique within the current export, and contain no Unicode control characters. Names may use printable Unicode characters, including emoji and symbols such as `⭐`, `★`, `♥`, `star★`, `heart-fill`, and `check_2`. JSON keys are strings, so the tool should preserve these names exactly in the downloaded JSON.

- **Q: How should repeated characters be handled?**  
  A: Deduplicate by code point while preserving first-seen order. Repeating `★★` produces one `u2605` entry.

- **Q: What happens when `font.charToGlyph(char)` returns `.notdef` or no usable outline?**  
  A: Treat it as missing if the glyph has no Unicode match for the requested code point or only the notdef glyph is returned. Spaces and other legitimate zero-outline glyphs may be included with zero bounds and an empty path if the font maps them.

- **Q: How is the dev-only bundle boundary enforced?**  
  A: `@bruff/arcade` must keep the game bootstrap as the production path and load the sigil route through a dev-only dynamic import guarded by `import.meta.env.DEV`. No static import from production-reachable arcade code may reference the dev router or `@bruff/sigil`.

- **Q: Should the component composition refactor add another framework or child custom elements?**
  A: No. The refactor uses the minimal single-element approach requested by the user: reducer-style state helpers, renderer/binding modules, and composed browser-resource helpers behind the existing `<tool-sigil>` element.

## Edge cases

- No font selected: preview and download remain unavailable.
- Empty character input: download remains unavailable and no JSON is generated.
- Whitespace characters: supported if present in the font; visible preview may not show them clearly, but JSON still records their Unicode value and advance width.
- Duplicate characters: only one JSON entry is emitted per code point.
- Duplicate glyph names: download remains unavailable and the conflicting names are shown as validation errors.
- Empty or invalid glyph names: download remains unavailable and the invalid rows are shown as validation errors.
- Editing glyph names: input focus and the current selection should not be lost after each keystroke.
- Supplementary-plane characters: handled as code points with `Array.from(input)`, not UTF-16 code units.
- Combining marks: extracted as independent code points; grapheme-cluster shaping is out of scope.
- Unsupported font file: parsing returns a typed error displayed in the component.
- WOFF2 file: explicitly rejected with a typed unsupported-format error.
- Rapid font reselection: stale parse or preview completions from older selections must not overwrite the latest selected font, errors, previews, or extracted glyphs.
- Stale preview-font rejection: a rejected preview-font load from an older selection must not clear a newer preview.
- Disconnected component with pending preview load: if `FontFace.load()` resolves after disconnect, the preview resource must not install the font or call back into the component.
- Clearing the file input: clears parsed font state, extraction results, errors, and preview font resources.
- Very large character input: extraction is bounded by the number of distinct code points and should keep the UI responsive for typical icon-font use.
- Glyph with no contours: included only if it is a valid mapped glyph, with empty path data and zero bounds.
- Browser without `Path2D`: JSON extraction still works; only optional canvas preview paths are skipped.
- Download URL creation failure: returns and displays a typed error instead of silently doing nothing.
- Production build accidentally includes `tool-sigil`, `@bruff/sigil`, `opentype`, or the dev router: the bundle-clean check fails.

## Review follow-up comments

- **P2 — Preserve valid drafts when reporting missing glyphs.** Input such as `★?` must keep the `★` draft available for editing and download while reporting `?` as missing.
- **P2 — Render previews with the uploaded font.** Preview glyphs must use the selected font so icon fonts, private-use glyphs, and fonts with non-system shapes can be visually confirmed.
- **P2 — Ignore stale font-load completions.** If a second font is selected before the first parse completes, only the latest selection may update component state.
- **P2 — Preserve glyph-name input focus while typing.** Typing a name longer than one character must not require repeatedly clicking back into the same input after every keystroke.
- **P2 — Ignore pending preview-font loads after disconnect.** If the component disconnects before `FontFace.load()` resolves, the preview resource must invalidate the pending load so it cannot install a font or render into a detached shadow root.
