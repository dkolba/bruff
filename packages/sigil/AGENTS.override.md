# `@bruff/sigil` — Development Tool Shell

This package owns the development-only `<tool-sigil>` Web Component used by `@bruff/arcade` in dev mode.

- **Language**: TypeScript with TSDoc annotations.
- **Role**: Browser tool shell plus small pure extraction helpers. DOM, file input, Blob, object URL, and download side effects are allowed only in shell modules.

## Package-Specific Allowances

- **SG-1** The `this` keyword is permitted in Web Component lifecycle methods.
- **SG-2** DOM APIs, `File`, `Blob`, and object URLs are permitted in `tool-sigil.ts` and file-loading shell modules.
- **SG-3** `opentype.js` is allowed only in this package.

## Package-Specific Obligations

- **SG-4 (MUST)** Production-reachable arcade code must not statically import `@bruff/sigil`.
- **SG-5 (MUST)** Extraction and glyph-name functions stay typed, deterministic, and testable without DOM access.
- **SG-6 (MUST)** Font parsing and browser download failures return typed `Result` errors and surface visible UI text; do not throw from package code.
- **SG-7 (MUST)** Uploaded font data stays local to the browser session.
- **SG-8 (MUST)** Object URLs created for previews or downloads are revoked when replaced and when the component disconnects.
- **SG-9 (MUST)** WOFF2 remains unsupported unless a future task explicitly adds a decompressor dependency.
