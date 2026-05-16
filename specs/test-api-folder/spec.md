# Test API Folder — Spec

## Goal

Move the browser test API runtime modules into a narrowly named folder so the effects layer distinguishes production shell modules from test-mode browser control code without changing runtime behaviour.

## User-visible Behaviour

- The browser test API remains available only when test mode is enabled.
- Existing arcade E2E tests continue to use `window.__bruffTestApi` unchanged.
- Production runtime behaviour remains unchanged.

## Out of Scope

- Moving `clock.ts`, `frame-step-driver.ts`, or `test-mode.ts`.
- Changing the `BruffTestApi` shape.
- Changing arcade coverage thresholds or exclusions.

## Open Questions

- None.

## Edge Cases

- Dynamic import from `loop.ts` must still resolve the test API module.
- Existing unit tests must import the moved module paths.

## Verification

- `window.__bruffTestApi` behaviour is covered by `packages/game/lib/effects/test-api/attach-test-api.test.ts`.
- Dynamic test-mode import resolution is covered by `packages/game/lib/effects/loop.test.ts`.
- Arcade E2E compatibility and NYC coverage exclusions are covered by `CI=true pnpm --filter @bruff/arcade run test`.
- Full repository health is covered by `npm run ok`.
