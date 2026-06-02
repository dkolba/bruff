# Frame-by-Frame ANSI Render Test - Acceptance

## Required Scenarios

- Creating a driver with no `initialState` starts from the same deterministic seed and canvas currently used by `runBruffCli()`.
- Creating a driver with `initialState` starts from that state and returns a cloned state from `getState()`.
- Calling `loadState(state)` replaces the running state with a clone and clears queued input.
- Dispatching `"\u001B[C"` followed by `stepFrames(1)` moves the player right, increments `frameIndex` to `1`, writes exactly one ANSI frame, and returns that ANSI text in the frame result.
- Calling `stepFrames(1)` with no queued movement input writes one ANSI frame but leaves `frameIndex` unchanged.
- Dispatching invalid input followed by `stepFrames(1)` writes one ANSI frame but leaves `frameIndex` unchanged.
- Dispatching several valid inputs before `stepFrames(1)` applies them FIFO in one logical tick and increments `frameIndex` once.
- Dispatching valid input before `stepFrames(3)` writes three ANSI frames and increments `frameIndex` once.
- `renderFrame()` writes one ANSI frame without changing state.
- A writer returning `false` records `{ type: "error", reason: "write-failed" }`.
- A writer throwing records `{ type: "error", reason: "write-threw" }`.
- `runBruffCli()` uses the frame-step driver for initial render and movement redraws while keeping existing quit and raw-mode behaviour.

## Verification Commands

Run these before marking the implementation complete:

```sh
pnpm --filter @bruff/cli run format
pnpm --filter @bruff/cli run lint
pnpm --filter @bruff/cli run typecheck
pnpm --filter @bruff/cli run test
```
