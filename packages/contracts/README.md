# @bruff/contracts

Shared runtime object and type contracts for the monorepo.

This package owns Zod schemas, inferred readonly TypeScript types, and small pure parser helpers for object shapes that need to cross package boundaries.

## Exports

### `@bruff/contracts`

The root export is universal. It is safe for Node.js and browser code, and must not depend on DOM globals, Canvas APIs, game shell code, or package-specific runtime state.

Use it for shared contract schemas and parser helpers:

- `broughlikeTerrainSchema`
- `broughlikeMapSchema`
- `parseBroughlikeMap(input)`
- `BroughlikeTerrain`
- `BroughlikeMap`
- `ParseBroughlikeMapError`
- `requiredSigilGlyphNames`
- `RequiredSigilGlyphName`
- `sigilGlyphBoundsSchema`
- `sigilSourceGlyphSchema`
- `sigilGlyphMappingSchema`
- `sigilGlyphSchema`
- `sigilGlyphMapSchema`
- `parseSigilGlyphMap(input)`
- `SigilGlyphBounds`
- `SigilSourceGlyph`
- `SigilGlyphMapping`
- `SigilGlyph`
- `SigilGlyphMap`
- `ParseSigilGlyphMapError`

## API

### `broughlikeMapSchema`

Zod schema for future small broughlike map JSON. Version `1` maps are compact rectangular grids up to 7×7 whose terrain values are `"floor"`, `"wall"`, or `"door"`.

### `parseBroughlikeMap(input)`

Parses an `unknown` input with `broughlikeMapSchema.safeParse()` and returns a `Result<BroughlikeMap, ParseBroughlikeMapError>` from `@bruff/utils`.

Invalid inputs return an explicit error value with reason `"INVALID_BROUGHLIKE_MAP"` and the Zod issues.

### `sigilGlyphMapSchema`

Zod schema for downloadable Sigil glyph JSON keyed by required glyph names. Each value contains the editable display `name`, source glyph metrics, bounds, SVG path data, selected `@bruff/glyph` mapping, and exact `"LICENSE"` value. The keys `floor`, `wall`, `door`, `player`, and `enemy` are required; additional glyph keys are allowed.

### `parseSigilGlyphMap(input)`

Parses an `unknown` input with `sigilGlyphMapSchema.safeParse()` and returns a `Result<SigilGlyphMap, ParseSigilGlyphMapError>` from `@bruff/utils`.

Invalid inputs return an explicit error value with reason `"INVALID_SIGIL_GLYPH_MAP"` and the Zod issues. Parser helpers in this package do not throw.

## Boundary

`@bruff/sigil` consumes the Sigil glyph JSON payload contracts so the development tool validates downloadable glyph maps against a shared runtime schema before browser download.

Add concrete contract domains only when a shape is shared across package boundaries and needs runtime validation.

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
pnpm run test:chromium
pnpm run test:firefox
pnpm run test:webkit
pnpm run test:watch
```
