# Sigil Component Composition Spec

## Goal

Refactor the development-only `<tool-sigil>` Web Component so it stays a small plain Web Component coordinator instead of accumulating state, rendering, validation, preview-font, and browser-command methods in one class.

## User-visible behaviour

- `<tool-sigil>` keeps the same public tag name and shadow DOM controls.
- Uploading, clearing, and replacing font files behaves the same.
- Character input, glyph extraction, missing-glyph errors, and editable glyph names behave the same.
- Valid glyph JSON downloads still use `sigil.json`.
- Invalid glyph names and empty glyph output still block downloads.
- Uploaded font previews still use a browser `FontFace` and release preview resources when replaced or disconnected.

## Out of scope

- Adding Lit, React, Vue, or another rendering framework.
- Adding child custom elements or slot-based composition.
- Changing the exported JSON shape.
- Supporting WOFF2 fonts.
- Changing the arcade dev route that hosts the tool.

## Open questions

- None. The refactor uses the minimal single-element approach requested by the user.

## Edge cases

- A stale font load must not overwrite a newer file selection.
- A stale preview-font rejection must not clear a newer preview.
- Clearing the file input must clear parsed font state, extraction results, errors, and preview font resources.
- Typing in a glyph-name input must preserve focus while visible errors and download state update.
- Object URLs and browser font resources must continue to be revoked or deleted at their current boundaries.

## Verification

- `pnpm --filter @bruff/sigil run format`
- `pnpm --filter @bruff/sigil run lint`
- `pnpm --filter @bruff/sigil run typecheck`
- `pnpm --filter @bruff/sigil run test`
- `pnpm run build`
