# Sigil Tool — Acceptance

## Route acceptance

- Given the arcade dev server is opened at `/`, then the document contains a registered `<bruff-game>` element and does not mount `<tool-sigil>`.
- Given the arcade dev server is opened at `/tools`, then the document contains a registered `<tool-sigil>` element and does not mount `<bruff-game>`.
- Given an unknown route is opened on the arcade dev server, then the app falls back to the game route.
- Given the arcade production build is opened at `/tools`, then the app falls back to the game route and does not register `<tool-sigil>`.
- Given the arcade production build is inspected, then emitted assets contain none of `tool-sigil`, `@bruff/sigil`, `opentype`, or `dev-tools-router`.

## Placeholder acceptance

- Given `@bruff/sigil` is imported in dev/test code, then `customElements.get("tool-sigil")` returns the registered constructor.
- Given `<tool-sigil>` is connected before the full extractor is implemented, then it renders a minimal accessible placeholder in its shadow DOM.

## Extraction acceptance

- Given a supported font and input `★♥✓★`, then extraction returns exactly three entries in first-seen order.
- Given a glyph for `★` in a font with `unitsPerEm` `1000`, then the generated draft has the default name `u2605`, `"unicode": "★"`, the glyph `advanceWidth`, `"unitsPerEm": 1000`, bounds, and non-empty SVG path data.
- Given the user renames `u2605` to `star`, then the downloaded JSON uses the key `"star"` for that glyph.
- Given the user renames `u2605` to `⭐` or `star★`, then the downloaded JSON preserves that edited Unicode key exactly.
- Given the user leaves the default name `u2605`, then the downloaded JSON uses the key `"u2605"` for that glyph.
- Given two glyph rows have the same edited name, then the duplicate names are reported and the download action is disabled.
- Given a glyph row has an empty edited name or a name containing a Unicode control character, then the invalid name is reported and the download action is disabled.
- Given the input contains a missing character, then the missing character is reported to the user and omitted from the downloadable JSON.
- Given the input is `★?` and only `★` exists in the selected font, then the `★` glyph row remains editable, the missing `?` is reported, and the downloaded JSON can contain the edited `★` glyph.
- Given the character input is empty, then no JSON is generated and the download action is disabled.
- Given a WOFF2 file is selected, then the component reports an unsupported-format error without attempting decompression.
- Given an invalid font file is selected, then the component reports an invalid-font error and does not expose a download action.

## Preview and interaction acceptance

- Given a supported font file is selected and glyph rows are rendered, then each glyph preview uses the uploaded font family rather than browser/system fallback.
- Given one font is selected and then another font is selected before the first load finishes, then only the second selection may update the visible filename, preview font, errors, extracted glyph rows, and downloadable JSON.
- Given a glyph-name input is focused, when the user types a multi-character name such as `star`, then focus remains in that input and the full typed value is preserved without requiring repeated clicks.

## Component composition acceptance

- Given `<tool-sigil>` is refactored into state, render, binding, preview-resource, and download helpers, then the public tag name and shadow DOM controls remain unchanged.
- Given a font file is uploaded, cleared, or replaced after the refactor, then the visible filename, parsed font state, extraction results, errors, preview font resources, and download eligibility match the previous behaviour.
- Given character input changes after the refactor, then glyph extraction, missing-glyph errors, editable glyph names, invalid-name validation, empty output handling, and `sigil.json` downloads match the previous behaviour.
- Given a preview-font load or parse completion from an older file selection resolves or rejects after a newer selection, then it does not overwrite or clear the newer preview, errors, extracted glyph rows, or downloadable JSON.
- Given the component disconnects after the refactor, then browser font resources and object URLs are still released at their existing boundaries.
- Given the component disconnects while a preview `FontFace.load()` is still pending, then the late completion does not install a font, call the preview-loaded callback, or render into the detached component.

## Download acceptance

- Given a font is loaded and at least one glyph is extracted, then activating the download action creates a `Blob` with `application/json` content and a filename of `sigil.json`.
- Given the JSON is parsed after download creation, then it conforms to `SigilGlyphMap` and its top-level keys match the current edited glyph names.
- Given the component disconnects after creating preview or download object URLs, then those URLs are revoked.

## Verification notes

- 2026-05-18 — Reviewed `spec.md`, `design.md`, `constraints.md`, and `acceptance.md` against the implemented `@bruff/sigil` package, arcade dev route, production bundle guard, and browser test coverage.
- 2026-05-18 — `pnpm --filter @bruff/sigil run format` passed.
- 2026-05-18 — `pnpm --filter @bruff/sigil run lint` passed.
- 2026-05-18 — `pnpm --filter @bruff/sigil run test` passed after T31-T40: 6 browser test files, 41 tests, 100% Chromium coverage, plus Firefox and WebKit runs.
- 2026-05-18 — `pnpm --filter @bruff/sigil run typecheck` passed.
- 2026-05-18 — `pnpm --filter @bruff/arcade run format` passed.
- 2026-05-18 — `pnpm --filter @bruff/arcade run lint` passed.
- 2026-05-18 — `pnpm --filter @bruff/arcade run typecheck` passed.
- 2026-05-18 — `pnpm --filter @bruff/arcade run test:e2e` passed: 60 Playwright tests across desktop and mobile projects.
- 2026-05-18 — `pnpm --filter @bruff/arcade run build` passed, including `check-bundle-clean` rejecting none of `__bruffTestApi`, `tool-sigil`, `@bruff/sigil`, `opentype`, or `dev-tools-router` in production assets.
- 2026-05-18 — `npm run ok` passed after the final review updates: workspace format, lint, tests, typecheck, and build all completed successfully.
- 2026-05-18 — Review follow-up tasks T31-T40 are implemented and verified: partial extraction preserves valid drafts, previews use the uploaded font, stale font parse/preview completions are ignored, and glyph-name input focus is preserved while typing multi-character names.
- 2026-06-01 — Added T46 preview-resource disconnect coverage and verified the focused Chromium regression: `pnpm --filter @bruff/sigil exec vitest run --browser=chromium module/tool-sigil-preview-resource.test.ts`.
- 2026-06-01 — Verified the disconnect fix with `pnpm --filter @bruff/sigil run format`, `pnpm --filter @bruff/sigil run lint`, `pnpm --filter @bruff/sigil run typecheck`, `pnpm --filter @bruff/sigil run test`, and repo-wide `pnpm run lint`.
- Production source maps remain emitted, but source contents are excluded so dev-only route source text is not embedded in production assets.

## Component composition verification checklist

- `pnpm --filter @bruff/sigil run format`
- `pnpm --filter @bruff/sigil run lint`
- `pnpm --filter @bruff/sigil run typecheck`
- `pnpm --filter @bruff/sigil run test`
- `pnpm run build`
