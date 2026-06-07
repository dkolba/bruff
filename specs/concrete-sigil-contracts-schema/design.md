# Concrete Sigil Contracts Schema Design

## Layer assignment

| Module | Layer | Responsibility |
| --- | --- | --- |
| `packages/sigil/module/sigil-schema-catalog.ts` | Pure catalog | Defines available concrete schema presets and default selection. |
| `packages/sigil/module/tool-sigil-state-types.ts` | Pure state types | Adds selected schema id and schema options to `ToolSigilState` and `ToolSigilViewModel`. |
| `packages/sigil/module/tool-sigil-state.ts` | Pure state transitions | Initializes the selected schema, derives characters and required names from the selected schema, completes missing schema rows after extraction, and handles schema changes. |
| `packages/sigil/module/tool-sigil-missing-drafts.ts` | Pure projection helper | Creates renderable placeholder drafts for requested schema characters that the uploaded font cannot extract. |
| `packages/sigil/module/tool-sigil-state-selectors.ts` | Pure projection | Projects schema selector state for rendering and preserves validation semantics. |
| `packages/sigil/module/tool-sigil-template.ts` | Web component shell template | Replaces the textarea markup with a labeled select. |
| `packages/sigil/module/tool-sigil-bindings.ts` | Web component shell bindings | Replaces textarea input handling with schema select change handling. |
| `packages/sigil/module/tool-sigil-render.ts` | Web component shell render | Renders glyph rows with required names and delegates schema selector rendering. |
| `packages/sigil/module/tool-sigil-schema-render.ts` | Web component shell render | Renders selected schema options into the schema select. |
| `packages/sigil/module/tool-sigil.ts` | Web component coordinator | Wires schema change events into pure state transitions. |

## Public API surface

```ts
/** Stable id for a concrete sigil contract schema preset. */
export type SigilSchemaId = Brand<string, "SigilSchemaId">;

/** One schema preset selectable in the sigil tool. */
export type SigilSchemaOption = Readonly<{
  id: SigilSchemaId;
  label: string;
  requiredGlyphs: ReadonlyArray<SigilSchemaGlyph>;
}>;

/** One required glyph entry within a schema preset. */
export type SigilSchemaGlyph = Readonly<{
  name: RequiredSigilGlyphName;
  unicode: string;
}>;

export const SIGIL_GLYPH_MAP_SCHEMA_ID: SigilSchemaId;
export const SIGIL_SCHEMA_OPTIONS: ReadonlyArray<SigilSchemaOption>;
export const DEFAULT_SIGIL_SCHEMA_ID: SigilSchemaId;
export const findSigilSchemaOption: (
  schemaOptions: ReadonlyArray<SigilSchemaOption>,
  schemaId: SigilSchemaId,
) => Option<SigilSchemaOption>;
```

State APIs to add or update:

```ts
export const setToolSigilSchema: (
  state: ToolSigilState,
  schemaId: SigilSchemaId,
) => ToolSigilState;
```

`ToolSigilControlHandlers` gains:

```ts
onSchemaChange: (schemaId: string) => void;
```

The existing `onCharactersInput` handler is removed because free-form character entry is no longer available.

## Data shape changes

`ToolSigilState` adds:

```ts
selectedSchemaId: SigilSchemaId;
schemaOptions: ReadonlyArray<SigilSchemaOption>;
```

`ToolSigilViewModel` adds:

```ts
selectedSchemaId: SigilSchemaId;
schemaOptions: ReadonlyArray<SigilSchemaOption>;
```

`characters` remains in state as a derived extraction input for `extractSigilGlyphs()`, not as user-editable free-form state. Initial state sets it from the default schema to `".#+@e"` in schema order.

`namesByUnicode` is prefilled from the selected schema:

```ts
{
  ".": "floor",
  "#": "wall",
  "+": "door",
  "@": "player",
  "e": "enemy",
}
```

No `GameState`, action, replay, or migration changes are required.

## Reuse map

- `packages/contracts/module/sigil-glyph-json.ts` provides `requiredSigilGlyphNames`, `RequiredSigilGlyphName`, and the `SigilGlyphMap` contract shape.
- `packages/sigil/module/glyph-json.ts` already re-exports contract glyph names and types for sigil modules.
- `packages/sigil/module/tool-sigil-state.ts` already owns pure initialization, character updates, and font-load extraction.
- `packages/sigil/module/tool-sigil-missing-drafts.ts` completes the renderable draft list after extraction so every requested schema character has a row, while the original extraction errors remain visible.
- `packages/sigil/module/extract-glyphs.ts` remains the only extraction function and continues to accept a string of source characters.
- `packages/sigil/module/tool-sigil-render.ts` already renders row names from `namesByUnicode` before falling back to draft names.
- `packages/sigil/module/tool-sigil-schema-render.ts` owns schema selector DOM option replacement so `tool-sigil-render.ts` stays under the package line limit.
- `packages/sigil/module/tool-sigil-bindings.ts` already routes select `change` events for glyph group, mapped glyph, and license controls.
- `packages/sigil/module/tool-sigil.test.ts`, `tool-sigil-state.test.ts`, `tool-sigil-bindings.test.ts`, and `tool-sigil-render.test.ts` cover the changed component, state, binding, and render behaviour.

## Data flow

```text
SIGIL_SCHEMA_OPTIONS
        |
createToolSigilState()
        |
selected schema -> characters + namesByUnicode
        |
font load -> extractSigilGlyphs(font, characters)
        |
completeMissingDrafts(font, characters, drafts)
        |
ToolSigilViewModel -> selector + all required glyph rows
        |
select change -> setToolSigilSchema() -> re-extract with current font
```

## Tradeoffs

### Chosen approach: schema catalog with derived extraction input

Pros:

- Keeps extraction unchanged by deriving the existing character string from schema metadata.
- Keeps every schema row visible by completing missing extraction drafts at the state boundary instead of weakening extraction error semantics.
- Keeps the Web Component shell thin and delegates schema decisions to pure state/catalog modules.
- Allows future schemas to be added by appending catalog entries.

Cons:

- Retains a `characters` field in state even though it is no longer directly editable.

### Alternative: remove `characters` from state completely

Pros:

- Makes illegal free-form character state unrepresentable.

Cons:

- Forces wider changes across selectors, font-load handling, tests, and extraction call sites for little user-visible gain.
- Makes future comparison with existing character-driven extraction tests harder.

### Alternative: hard-code `SigilGlyphMap` in the component template

Pros:

- Smallest immediate implementation.

Cons:

- Makes future schema additions a template and shell refactor.
- Hides contract metadata outside pure testable code.

## Test strategy

- Add pure catalog tests for the default `SigilGlyphMap` option and its required glyph mapping.
- Add state tests proving initial state selects `SigilGlyphMap`, derives `".#+@e"`, and preloads `namesByUnicode`.
- Add state tests proving schema selection re-extracts using the current font when present.
- Add state tests proving partial fonts still render every required schema row and keep missing-glyph errors visible.
- Update binding tests to assert schema select changes call `onSchemaChange` and textarea input handling is absent.
- Update render/component tests to assert no textarea is present and the schema selector is labeled and preselected.
- Run `pnpm --filter @bruff/sigil run format`, `lint`, `typecheck`, and targeted browser tests while implementing; run broader repo `pnpm run ok` before final completion if available.
