# Use Glyph in Sigil — Design

## Layer Assignment

| Module or file                                            | Package        | Layer                                                                                                                      |
| --------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `packages/glyph/index.ts`                                 | `@bruff/glyph` | Existing pure readonly glyph catalog and string helpers.                                                                   |
| `packages/sigil/module/glyph-catalog.ts`                  | `@bruff/sigil` | Pure projection from `@bruff/glyph` exports into ordered group and option data for the UI.                                 |
| `packages/sigil/module/osi-license-catalog.ts`            | `@bruff/sigil` | Generated pure readonly OSI license option data.                                                                           |
| `packages/sigil/scripts/generate-osi-license-catalog.mjs` | `@bruff/sigil` | Development script that refreshes `osi-license-catalog.ts` from OSI's official API/page.                                   |
| `packages/sigil/module/glyph-json.ts`                     | `@bruff/sigil` | Pure exported JSON type changes for emoji/glyph/license combinations.                                                      |
| `packages/sigil/module/tool-sigil-state.ts`               | `@bruff/sigil` | Pure state transitions, validation, selectors, memorized license state, and view model projection.                         |
| `packages/sigil/module/tool-sigil-render.ts`              | `@bruff/sigil` | DOM rendering for staged selects, license selects, previews, and visible validation errors.                                |
| `packages/sigil/module/tool-sigil-bindings.ts`            | `@bruff/sigil` | DOM event binding for group, glyph, and license select changes.                                                            |
| `packages/sigil/module/tool-sigil.ts`                     | `@bruff/sigil` | Imperative Web Component coordinator that wires state, bindings, rendering, font loading, preview resources, and download. |
| `packages/sigil/package.json`                             | `@bruff/sigil` | Workspace dependency on `@bruff/glyph` and a package-local script for refreshing OSI licenses.                             |

`@bruff/sigil` may import `@bruff/glyph` because both packages are development/workspace packages and `@bruff/sigil` remains excluded from production arcade bundles. The new catalog projection must stay pure and DOM-free. The projection includes every exported readonly object table whose values are string glyphs and excludes helper functions such as `braille()` and `combine()`.

## Public API Surface

```ts
/** Stable group name for a top-level @bruff/glyph export table. */
export type SigilGlyphGroupName = string;

/** One selectable glyph from the shared glyph catalog. */
export type SigilGlyphOption = Readonly<{
  groupName: SigilGlyphGroupName;
  glyphKey: string;
  glyph: string;
  label: string;
}>;

/** One selectable glyph group from the shared glyph catalog. */
export type SigilGlyphGroup = Readonly<{
  groupName: SigilGlyphGroupName;
  label: string;
  glyphs: ReadonlyArray<SigilGlyphOption>;
}>;

/** One selectable OSI license option. */
export type SigilLicenseOption = Readonly<{
  id: string;
  name: string;
  spdxId: string | undefined;
  label: string;
  value: string;
}>;

/** Selected @bruff/glyph mapping for one source Unicode character. */
export type SigilGlyphMapping = Readonly<{
  groupName: SigilGlyphGroupName;
  glyphKey: string;
  glyph: string;
}>;

/** Downloaded payload for one source emoji/glyph combination. */
export type SigilGlyph = Readonly<{
  unicode: string;
  mappedGlyph: SigilGlyphMapping;
  LICENSE: string;
  advanceWidth: number;
  unitsPerEm: number;
  bounds: SigilGlyphBounds;
  path: string;
}>;
```

`SigilGlyph` currently carries the extracted source-font glyph data. This feature extends each downloaded entry with `mappedGlyph` and `"LICENSE"` instead of replacing the extraction fields. Existing consumers of `unicode`, `advanceWidth`, `unitsPerEm`, `bounds`, and `path` keep those fields.

## Data Shape Changes

`ToolSigilState` gains pure mapping state:

```ts
export type ToolSigilState = Readonly<{
  characters: string;
  drafts: ReadonlyArray<SigilGlyphDraft>;
  errors: ReadonlyArray<SigilExtractionError>;
  font: Font | undefined;
  fontFileName: string | undefined;
  fontLoadToken: number;
  namesByUnicode: Readonly<Record<string, string>>;
  previewFontFamily: string;
  stagedGlyphGroupsByUnicode: Readonly<Record<string, SigilGlyphGroupName>>;
  selectedGlyphsByUnicode: Readonly<Record<string, SigilGlyphMapping>>;
  selectedLicensesByUnicode: Readonly<Record<string, string>>;
  lastSelectedLicense: string | undefined;
}>;
```

`ToolSigilViewModel` gains catalog and row-level selection data:

```ts
export type ToolSigilViewModel = Readonly<{
  downloadDisabled: boolean;
  drafts: ReadonlyArray<SigilGlyphDraft>;
  errors: ReadonlyArray<SigilExtractionError>;
  fontFileNameText: string;
  glyphCountText: string;
  glyphGroups: ReadonlyArray<SigilGlyphGroup>;
  licenseOptions: ReadonlyArray<SigilLicenseOption>;
  namesByUnicode: Readonly<Record<string, string>>;
  previewFontFamily: string;
  stagedGlyphGroupsByUnicode: Readonly<Record<string, SigilGlyphGroupName>>;
  selectedGlyphsByUnicode: Readonly<Record<string, SigilGlyphMapping>>;
  selectedLicensesByUnicode: Readonly<Record<string, string>>;
}>;
```

The state helpers add these functions:

```ts
export const setToolSigilGlyphGroup: (
  state: ToolSigilState,
  unicode: string,
  groupName: SigilGlyphGroupName,
) => ToolSigilState;

export const setToolSigilMappedGlyph: (
  state: ToolSigilState,
  unicode: string,
  mapping: SigilGlyphMapping,
) => ToolSigilState;

export const setToolSigilLicense: (
  state: ToolSigilState,
  unicode: string,
  licenseValue: string,
) => ToolSigilState;
```

`setToolSigilLicense` updates both `selectedLicensesByUnicode[unicode]` and `lastSelectedLicense`. When drafts are re-extracted, selectors apply `lastSelectedLicense` as the default license for any new row without an explicit license.

## Data Flow

```text
@bruff/glyph exports
  -> glyph-catalog.ts
  -> glyph group select
  -> filtered glyph select
  -> selectedGlyphsByUnicode

OSI API/page during development
  -> generate-osi-license-catalog.mjs
  -> osi-license-catalog.ts
  -> license select
  -> selectedLicensesByUnicode + lastSelectedLicense

uploaded font + characters
  -> extractSigilGlyphs()
  -> SigilGlyphDraft rows
  -> createSigilGlyphMap()
  -> JSON entries with mappedGlyph + "LICENSE"
```

The render layer creates one row with three selection controls after the existing glyph-name input:

| Control            | Source data               | State update                                        |
| ------------------ | ------------------------- | --------------------------------------------------- |
| Glyph group select | `glyphGroups`             | `setToolSigilGlyphGroup(state, unicode, groupName)` |
| Glyph select       | selected group's `glyphs` | `setToolSigilMappedGlyph(state, unicode, mapping)`  |
| License select     | `licenseOptions`          | `setToolSigilLicense(state, unicode, licenseValue)` |

The second-stage glyph select is derived from the staged group for the row. It must not render every glyph from every group into a single long select.

## Reuse Map

- `packages/glyph/index.ts` provides the source glyph tables and their existing Unicode/category ordering: `ASCII`, `LATIN_EXTENDED`, `GREEK`, `CYRILLIC`, `RUNIC`, `BOX`, `BLOCK`, `BRAILLE`, `GEO`, `ARROWS`, `MATH`, `MISC_SYMBOLS`, `DINGBATS`, `ARROWS_SUPP`, `LETTERLIKE`, `CURRENCY`, `SUPER_SUB`, `ENCLOSED`, `OGHAM`, `ALCHEMICAL`, `COPTIC`, and `COMBINING`.
- `packages/sigil/module/tool-sigil-state.ts` already owns immutable state transitions, selectors, download disabled logic, and view-model projection.
- `packages/sigil/module/tool-sigil-render.ts` already renders rows from `ToolSigilViewModel` without owning state.
- `packages/sigil/module/tool-sigil-bindings.ts` already delegates row input events through one glyph-list listener.
- `packages/sigil/module/glyph-name.ts` already builds the downloaded glyph map and validates row names.
- `packages/sigil/module/glyph-json.ts` already defines the downloadable JSON record shape.
- `packages/sigil/module/tool-sigil.test.ts`, `tool-sigil-state.test.ts`, `tool-sigil-bindings.test.ts`, and `tool-sigil-focus.test.ts` provide the existing browser/state test style.

## OSI License Catalog

OSI's June 2025 API announcement states that the official license API is served from `opensource.org` and that the collection endpoint exposes the full license data. The generator should prefer `https://opensource.org/api/license` or the current collection endpoint linked from OSI documentation, normalize each entry to `SigilLicenseOption`, and sort by display name for scanning.

The generated module stores only data needed by the browser:

```ts
export const OSI_LICENSE_OPTIONS: ReadonlyArray<SigilLicenseOption> = [
  {
    id: "apache-2-0",
    label: "Apache License, Version 2.0 (Apache-2.0)",
    name: "Apache License, Version 2.0",
    spdxId: "Apache-2.0",
    value: "Apache-2.0",
  },
];
```

Entries without `spdx_id` use `id` as `value` and omit the SPDX parenthetical from `label`. The generator must return a non-zero exit code when it cannot produce at least one option so stale or empty data is caught before commit.

## Tradeoffs

- **Chosen: generate a local OSI license module.** The tool remains available offline and browser tests do not depend on network timing. The generated file makes review diffs explicit when OSI's list changes.
- **Alternative: fetch OSI licenses at runtime.** This would always be current, but it introduces network failure into a local dev tool and would require typed browser fetch error states.
- **Alternative: hand-maintain a static license array.** This is simple at first, but it is likely to drift from OSI's source of truth.

- **Chosen: group-first glyph staging from `@bruff/glyph` export tables.** The package already groups glyphs by Unicode/category, so the UI can use existing domain structure and preserve catalog ordering.
- **Alternative: one flat select with all glyphs.** It is simpler to implement, but violates the requirement that users should not traverse all glyphs.
- **Alternative: search-only glyph picker.** It can be efficient for known names, but it adds text matching and keyboard interaction scope not requested here.

- **Chosen: store `mappedGlyph` beside the existing extracted glyph fields.** The downloaded JSON remains self-contained: it records the emoji's source-font extraction and the selected game glyph mapping.
- **Alternative: replace `unicode` with the selected game glyph.** This loses the original emoji/source character and makes the mapping impossible to audit.

- **Chosen: memorize the last license in `ToolSigilState`.** This satisfies the session-only requirement without adding persistence or privacy concerns.
- **Alternative: persist the license in `localStorage`.** It would survive reloads but is explicitly out of scope and adds another shell boundary.

## Validation Rules

- Download is disabled if any draft row lacks a selected `mappedGlyph`.
- Download is disabled if any draft row lacks a selected `"LICENSE"` value.
- Download is disabled if `glyphGroups` or `licenseOptions` is empty.
- `selectedGlyphsByUnicode` must be validated against the current catalog before download so stale group/key values cannot leak into JSON.
- `selectedLicensesByUnicode` and `lastSelectedLicense` must be validated against `licenseOptions` before use.
- Existing glyph-name validation remains unchanged.

## Testing Approach

- Add pure catalog tests for `glyph-catalog.ts` to verify known `@bruff/glyph` groups, option labels, ordering, and no empty groups.
- Add pure generated-data tests for `osi-license-catalog.ts` to verify non-empty options, unique values, stable labels, and representative SPDX values such as `Apache-2.0`, `MIT`, and `OFL-1.1` when present in the generated source.
- Add state tests for group selection, glyph selection, clearing invalid glyphs after group changes, license memorization, and defaulting new rows to the last selected license.
- Add JSON selection tests proving `createSigilGlyphMap` emits `mappedGlyph` and `"LICENSE"` per entry.
- Add browser component tests for staged selects, filtered second-stage options, license select defaults, focus preservation, and disabled download state.
- Run `pnpm --filter @bruff/sigil run format`, `lint`, `typecheck`, and `test`.
