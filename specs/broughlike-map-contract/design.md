# Broughlike Map Contract Design

## Layer assignment

| Area        | Files                                                         | Responsibility                                                                    |
| ----------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Contracts   | `packages/contracts/module/broughlike-map-json.ts`            | Zod schema, readonly inferred types, parse helper for compact map JSON.           |
| Contracts   | `packages/contracts/module/broughlike-map-json.test.ts`       | Contract tests for valid maps and parse failures.                                 |
| Contracts   | `packages/contracts/module/sigil-glyph-json.ts`               | Require the core glyph keys and the per-glyph display `name` field.               |
| Contracts   | `packages/contracts/module/sigil-glyph-json.test.ts`          | Contract tests for required glyph keys, glyph `name`, and extra glyph acceptance. |
| Contracts   | `packages/contracts/index.ts`, `packages/contracts/README.md` | Public exports and documentation.                                                 |
| Sigil       | `packages/sigil/module/glyph-name.test.ts`                    | Verify Sigil output satisfies required keys and rejects omissions.                |
| Sigil       | `packages/sigil/README.md`                                    | Document required downloadable glyph names.                                       |
| Game policy | `packages/game/AGENTS.md`                                     | Allow future `@bruff/game` contract adoption without changing game code now.      |

## Public API surface

```ts
export const broughlikeTerrainSchema: z.ZodEnum<["floor", "wall", "door"]>;
export const broughlikeMapSchema: z.ZodType<BroughlikeMap>;
export const parseBroughlikeMap(input: unknown): Result<BroughlikeMap, ParseBroughlikeMapError>;

export type BroughlikeTerrain = "floor" | "wall" | "door";
export type BroughlikeMap = Readonly<{
  version: 1;
  width: number;
  height: number;
  rows: ReadonlyArray<ReadonlyArray<BroughlikeTerrain>>;
}>;
export type ParseBroughlikeMapError = Readonly<{
  reason: "INVALID_BROUGHLIKE_MAP";
  issues: ReadonlyArray<core.$ZodIssue>;
}>;
```

`SigilGlyphMap` becomes a readonly record with required keys. Each `SigilGlyph` entry carries a `name` field for the user-edited row name while the map keeps stable top-level contract keys:

```ts
export type RequiredSigilGlyphName =
  | "floor"
  | "wall"
  | "door"
  | "player"
  | "enemy";
export const requiredSigilGlyphNames: ReadonlyArray<RequiredSigilGlyphName>;
export type SigilGlyphMap = Readonly<
  Record<RequiredSigilGlyphName, SigilGlyph> & Record<string, SigilGlyph>
>;
```

## Data shape changes

The broughlike map contract is intentionally small:

- `version` is exactly `1`.
- `width` and `height` are positive integers.
- `rows` stores terrain symbols directly as strings.
- terrain values are only `floor`, `wall`, and `door`.
- dimensions are capped to keep this a broughlike board contract rather than a full roguelike dungeon contract.

No `GameState`, replay fixture, headless API, or Arcade route shape changes are included. `packages/game/AGENTS.md` is updated so a future task may import `@bruff/contracts` for shared replay fixture or headless API contracts without violating package policy.

## Data flow

```text
unknown JSON
  |
  v
@bruff/contracts broughlikeMapSchema.safeParse
  |
  v
Result<BroughlikeMap, ParseBroughlikeMapError>

Sigil drafts + required top-level keys + edited glyph names
  |
  v
@bruff/sigil createSigilGlyphMap
  |
  v
@bruff/contracts parseSigilGlyphMap
  |
  v
required glyph map or typed Sigil error
```

## Tradeoffs

### Chosen: simple rectangular rows

Pros:

- Easy for humans and future browser tools to read.
- Keeps the contract independent from future editor internals.
- Avoids prematurely choosing chunking, entity metadata, or typed-array storage.

Cons:

- Less compact than numeric tile IDs.
- Not optimized for runtime game simulation.

### Alternative: numeric tile IDs plus palette

Pros:

- Smaller JSON for larger maps.
- Closer to a future editor storage format.

Cons:

- Adds indirection before the editor exists.
- Makes fixtures less readable.

### Chosen: require Sigil keys in the shared contract

Pros:

- Guarantees consumers can rely on core glyphs.
- Keeps enforcement at the package boundary where downloads are validated.
- Keeps user-edited row names inside each glyph object's `name` field without changing top-level keys.

Cons:

- Existing ad-hoc Sigil exports must include required top-level keys and per-glyph `name` values before validation succeeds.

### Alternative: enforce required keys only in Sigil UI

Pros:

- Keeps the contract looser.

Cons:

- Other producers could create incomplete glyph maps.
- Runtime consumers would need defensive missing-glyph checks.

## Reuse map

| Existing file                                         | Reuse                                                                         |
| ----------------------------------------------------- | ----------------------------------------------------------------------------- |
| `packages/contracts/module/sigil-glyph-json.ts`       | Zod contract and non-throwing parse helper pattern.                           |
| `packages/contracts/module/sigil-glyph-json.test.ts`  | Browser contract test style.                                                  |
| `packages/sigil/module/glyph-name.ts`                 | Existing Sigil contract-validation bridge.                                    |
| `packages/sigil/module/tool-sigil-state-selectors.ts` | Passes required top-level keys and edited row names into download projection. |
| `packages/sigil/module/glyph-name.test.ts`            | Sigil glyph map construction coverage.                                        |
| `packages/contracts/AGENTS.md`                        | Package boundary and contract rules.                                          |
| `packages/sigil/AGENTS.md`                            | Allowed Sigil imports from contracts.                                         |
