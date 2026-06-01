# `@bruff/sigil` — Development Tool Shell

This package owns the development-only `<tool-sigil>` Web Component used by `@bruff/arcade` in dev mode.

- **Language**: TypeScript with TSDoc annotations.
- **Role**: Browser tool shell plus small pure extraction, glyph-catalog, license-catalog, mapping, and JSON helpers. DOM, file input, Blob, object URL, and download side effects are allowed only in shell modules.

## Package-Specific Allowances

- **SG-1** The `this` keyword is permitted in Web Component lifecycle methods.
- **SG-2** DOM APIs, `File`, `Blob`, and object URLs are permitted in `tool-sigil.ts` and file-loading shell modules.
- **SG-3** `opentype.js` is allowed only in this package.
- **SG-4** `@bruff/glyph` may be imported only by pure catalog projection modules and tests so the browser tool can map source characters to shared glyph identities.

## Package-Specific Obligations

- **SG-5 (MUST)** Production-reachable arcade code must not statically import `@bruff/sigil`.
- **SG-6 (MUST)** Extraction, glyph-name, glyph-catalog, license-catalog, and JSON mapping functions stay typed, deterministic, and testable without DOM access.
- **SG-7 (MUST)** Font parsing and browser download failures return typed `Result` errors and surface visible UI text; do not throw from package code.
- **SG-8 (MUST)** Uploaded font data stays local to the browser session.
- **SG-9 (MUST)** Object URLs created for previews or downloads are revoked when replaced and when the component disconnects.
- **SG-10 (MUST)** `module/osi-license-catalog.ts` is generated local data for browser use. Refresh it with `pnpm run generate:osi-licenses`; do not fetch OSI licenses at runtime from `<tool-sigil>`.
- **SG-11 (MUST)** Downloadable glyph JSON entries include the source glyph data plus `mappedGlyph` and exact `"LICENSE"` fields once rows are included in a download.
- **SG-12 (MUST)** WOFF2 remains unsupported unless a future task explicitly adds a decompressor dependency.
