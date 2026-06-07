# Concrete Sigil Contracts Schema Tasks

- [x] T1 — Add `SigilSchemaId`, `SigilSchemaGlyph`, `SigilSchemaOption`, `SIGIL_GLYPH_MAP_SCHEMA_ID`, `DEFAULT_SIGIL_SCHEMA_ID`, `SIGIL_SCHEMA_OPTIONS`, and `findSigilSchemaOption` to `packages/sigil/module/sigil-schema-catalog.ts`
- [x] T2 — Add catalog tests for the `SigilGlyphMap` option in `packages/sigil/module/sigil-schema-catalog.test.ts`
- [x] T3 — Add `selectedSchemaId` and `schemaOptions` fields to `ToolSigilState` and `ToolSigilViewModel` in `packages/sigil/module/tool-sigil-state-types.ts`
- [x] T4 — Initialize `ToolSigilState` from `DEFAULT_SIGIL_SCHEMA_ID` in `packages/sigil/module/tool-sigil-state.ts`
- [x] T5 — Add state tests for initial selected schema, derived characters, and prefilled required glyph names in `packages/sigil/module/tool-sigil-state.test.ts`
- [x] T6 — Implement `setToolSigilSchema` in `packages/sigil/module/tool-sigil-state.ts`
- [x] T7 — Add state tests for schema selection re-extraction with the current font in `packages/sigil/module/tool-sigil-state.test.ts`
- [x] T8 — Project schema selector fields from `selectToolSigilViewModel` in `packages/sigil/module/tool-sigil-state-selectors.ts`
- [x] T9 — Replace the `Characters` textarea with a schema select in `packages/sigil/module/tool-sigil-template.ts`
- [x] T10 — Update control bindings to query the schema select and emit `onSchemaChange` from `packages/sigil/module/tool-sigil-bindings.ts`
- [x] T11 — Update binding tests for schema select changes and removed textarea input in `packages/sigil/module/tool-sigil-bindings.test.ts`
- [ ] T12 — Render schema select options and selected value in `packages/sigil/module/tool-sigil-render.ts`
- [ ] T13 — Update render tests for the preselected `SigilGlyphMap` selector and absent textarea in `packages/sigil/module/tool-sigil-render.test.ts`
- [ ] T14 — Wire `onSchemaChange` into `ToolSigil` and remove character input handling in `packages/sigil/module/tool-sigil.ts`
- [ ] T15 — Update component regression tests for initial `SigilGlyphMap` selection and required glyph row names in `packages/sigil/module/tool-sigil.test.ts` and `packages/sigil/module/tool-sigil-regression.test.ts`
- [ ] T16 — Run `pnpm --filter @bruff/sigil run format`, `pnpm --filter @bruff/sigil run lint`, `pnpm --filter @bruff/sigil run typecheck`, and affected `@bruff/sigil` browser tests
