# Prepare DOMless Game - Acceptance

## Browser Import

- Given a browser app imports `@bruff/game`, `<bruff-game>` is registered and the existing canvas loop starts as before.
- Given the arcade app runs its existing E2E suite, browser test-mode APIs still work through `window.__bruffTestApi`.

## Headless Import

- Given a Node test imports `@bruff/game/headless`, the import succeeds without defining `window`, `document`, `customElements`, `HTMLElement`, `CanvasRenderingContext2D`, or `requestAnimationFrame`.
- Given `@bruff/cli` runs in the workspace, it imports `@bruff/game/headless` through the `bruff-source` condition and native Node TypeScript flags without first building `@bruff/game`.
- Given `createHeadlessGame({ canvas: { width: 7, height: 7 }, seed: 1 })` is called twice, both states are deeply equal.
- Given the same headless state and the same input sequence are passed to `stepHeadlessGame()`, the resulting state is deterministic and matches existing replay semantics.

## Terminal Rendering

- Given a headless frame contains the player and enemies, `@bruff/cli` converts it into a `TerminalFrame` with corresponding positioned cells.
- Given the CLI receives a movement key through injected input, it normalises the key through `@bruff/game/headless`, advances state, and writes an ANSI frame through the injected writer.
- Given the CLI receives `\u001B[A`, `\u001B[B`, `\u001B[C`, or `\u001B[D`, `normaliseKey()` maps it to the matching movement action.
- Given the CLI writer returns `false`, the CLI returns a typed write error instead of throwing.

## Verification Commands

- `CI=true pnpm --filter @bruff/game run format`
- `CI=true pnpm --filter @bruff/game run lint`
- `CI=true pnpm --filter @bruff/game run typecheck`
- `CI=true pnpm --filter @bruff/game run test`
- `CI=true pnpm --filter @bruff/cli run format`
- `CI=true pnpm --filter @bruff/cli run lint`
- `CI=true pnpm --filter @bruff/cli run typecheck`
- `CI=true pnpm --filter @bruff/cli run test`
- `CI=true pnpm --filter @bruff/utils run lint`
- `CI=true pnpm --filter @bruff/utils run typecheck`
- `CI=true pnpm --filter @bruff/utils run test:node`
- `CI=true pnpm --filter @bruff/arcade run test`
