# @bruff/sigil

Development-only browser tool for extracting selected glyphs from a local font into compact JSON. The package registers `<tool-sigil>` for the arcade `/tools` dev route; production arcade builds must not import this package.

## Development

```sh
pnpm run format
pnpm run lint
pnpm run typecheck
```

## Testing

Tests run in real browsers via Vitest + Playwright:

```sh
pnpm run test
pnpm run test:watch
```

## JSON Output

The downloadable JSON is keyed by editable glyph names. Each entry stores the source Unicode character, `advanceWidth`, `unitsPerEm`, glyph bounds, and SVG path data generated at `font.unitsPerEm`.

## Font Limits

The first version targets TTF, OTF, and WOFF files supported by `opentype.js`. WOFF2 decompression, complex shaping, ligatures, kerning pairs, color glyph layers, and font editing are out of scope.
