# Create Contracts Package Tasks

- [x] T1 — Add `packages/contracts/package.json`, `packages/contracts/tsconfig.json`, `packages/contracts/eslint.config.js`, and `packages/contracts/vitest.config.ts`
- [x] T2 — Add `zod` to `pnpm-workspace.yaml` catalog and `packages/contracts/package.json` dependencies
- [x] T3 — Add empty public export files `packages/contracts/index.ts` and `packages/contracts/module/shared-object.ts`
- [x] T4 — Add failing parser tests in `packages/contracts/module/shared-object.test.ts`
- [x] T5 — Implement `sharedObjectSchema`, `SharedObject`, `ParseSharedObjectError`, and `parseSharedObject` in `packages/contracts/module/shared-object.ts`
- [x] T6 — Export the shared object contract API from `packages/contracts/index.ts`
- [ ] T7 — Add `packages/contracts/README.md` documenting exports, commands, and the no-consumer-migration boundary
- [ ] T8 — Add `packages/contracts/AGENTS.override.md` documenting contracts package rules
- [ ] T9 — Run `pnpm --filter @bruff/contracts run format`
- [ ] T10 — Run `pnpm --filter @bruff/contracts run lint`
- [ ] T11 — Run `pnpm --filter @bruff/contracts run typecheck`
- [ ] T12 — Run `pnpm --filter @bruff/contracts run test`
- [ ] T13 — Run root `pnpm run ok`
