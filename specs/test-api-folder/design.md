# Test API Folder — Design

## Layer Assignment

| Module                                                    | Layer   | Purpose                                      |
| --------------------------------------------------------- | ------- | -------------------------------------------- |
| `packages/game/lib/effects/test-api/attach-test-api.ts`   | effects | Attaches the browser test API in test mode.  |
| `packages/game/lib/effects/test-api/test-api-types.ts`    | effects | Defines the browser test API public shape.   |
| `packages/game/lib/effects/test-api/attach-test-api.test.ts` | effects | Browser-provider coverage for API behaviour. |

## Public API Surface

`attachTestApi(driver)` keeps the same export name and behaviour. `BruffTestApi` keeps the same type shape.

## Tradeoffs

- **Chosen: `effects/test-api/`.** This keeps browser-control runtime code inside the effects layer, satisfying GT-4, while making the test-mode boundary visible.
- **Alternative: `lib/testing/`.** Rejected because these modules still access DOM globals and are runtime shell code, not test-runner fixtures.
- **Alternative: leave files flat in `effects/`.** Rejected because the flat layout makes test-mode browser control look like ordinary production shell wiring.

## Reuse Map

- `packages/game/lib/effects/loop.ts` keeps the dynamic import but points to the moved module.
- `packages/game/lib/effects/frame-step-driver.ts` remains the driver dependency for `attachTestApi`.
- `packages/game/lib/effects/test-api/attach-test-api.test.ts` reuses the existing behaviour tests.

## Verification

- `CI=true pnpm --filter @bruff/game run format`
- `CI=true pnpm --filter @bruff/game run lint`
- `CI=true pnpm --filter @bruff/game run typecheck`
- `CI=true pnpm --filter @bruff/game run test`
