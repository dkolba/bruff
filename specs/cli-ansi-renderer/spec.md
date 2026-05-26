# CLI ANSI Renderer

## Goal

Create a new workspace package at `packages/cli` named `@bruff/cli` that renders a small, deterministic mock scene to an ANSI-compatible terminal using plain Node.js and TypeScript. The first version is a terminal rendering spike only: it proves colored foregrounds, colored backgrounds, cursor positioning, glyph output, screen clearing, and a minimal quit shortcut without importing game state or game render commands. Runtime source may import only `@bruff/glyph` from the workspace for character selection; package tooling must reuse the local shared lint package `@bruff/eslint-config`.

## User-visible behaviour

- The repo contains a new workspace package called `@bruff/cli` in `packages/cli`.
- Running the package's CLI command from an interactive terminal prints a mock text-cell scene to stdout.
- The mock scene contains multiple glyph characters sourced from `@bruff/glyph`.
- The mock scene uses at least three distinct foreground colors.
- The mock scene uses at least two distinct background colors.
- The renderer positions cells with ANSI cursor movement rather than relying only on newline layout.
- The renderer clears the terminal before drawing the mock scene.
- The renderer resets terminal styling after drawing so subsequent shell output is not colored.
- The renderer moves the cursor below the mock scene before returning control to the shell.
- The command waits after drawing the mock scene until the user presses `q`, `Q`, or `Ctrl+C`.
- The command does not start a game loop.
- The command can render to a fake writer and listen to fake input in tests without opening a real TTY.
- The package source does not import `@bruff/game`, `@bruff/game-element`, `@bruff/arcade`, `@bruff/utils`, or package internals from any workspace package except `@bruff/glyph`.
- The package lint config imports `@bruff/eslint-config` from the workspace instead of duplicating package-local lint rules.
- The package runs TypeScript directly with native Node.js TypeScript support; no `tsx`, `ts-node`, Babel, Vite, Vitest, Jest, or Playwright runtime is used.
- Package tests use `node:test` and `node:assert/strict` against public exports and pure rendering helpers.

## Out of scope

- Rendering actual `@bruff/game` state, render commands, replay data, fixtures, or snapshots.
- Adding or changing any game-related package, including `packages/game`, `packages/game-element`, and `packages/arcade`.
- Adding a `@bruff/game/headless` export.
- Creating a playable terminal game loop.
- Reading gameplay keyboard, mouse, resize, or continuous terminal input.
- Entering alternate screen mode or mouse reporting mode.
- Implementing terminal lifecycle cleanup or process signal handling beyond the minimal quit shortcut and raw-mode restoration.
- Implementing terminal capability negotiation through `terminfo`.
- Depending on a third-party TUI framework.
- Emitting JavaScript build artifacts from TypeScript source.
- Introducing external TypeScript runtime transpilers or compilers for execution.
- Sharing CLI renderer types with game packages.

## Open questions (resolved)

- **Q: Should this spec integrate with `@bruff/game` now?**  
  A: No. The first package renders mock data only. A later spec will upgrade the CLI renderer to consume game-owned data.

- **Q: Which workspace package may `@bruff/cli` import?**  
  A: Runtime and test source may import only `@bruff/glyph`, and only to choose characters for terminal cells. Tooling config may import `@bruff/eslint-config`.

- **Q: Should `@bruff/cli` use shared utility types from `@bruff/utils`?**  
  A: No. The package should use local types and Node built-ins for this first mock renderer.

- **Q: Should the package use Vitest because other packages do?**  
  A: No. Tests must use native Node.js test support with `node:test` and `node:assert/strict`.

- **Q: Should TypeScript be compiled before execution?**  
  A: No. Runtime execution uses Node's native TypeScript support. `tsc --noEmit` may still be used as a type-checking gate.

- **Q: Should the renderer require a real interactive TTY?**  
  A: No. The command writes ANSI text to stdout and listens for quit input when available. Tests must be able to inject a fake writer and fake input.

- **Q: Should the command exit immediately after drawing?**  
  A: No. The command should keep the process alive after drawing and exit only when the user presses `q`, `Q`, or `Ctrl+C`.

- **Q: Should stdout non-TTY handling be implemented now?**  
  A: No. The renderer may write ANSI text to any writable stdout-like target. Rich TTY detection belongs to a later terminal-session spec.

## Edge cases

- The mock scene has no cells.
- A cell has the same foreground and background color.
- Multiple adjacent cells share the same colors.
- Multiple cells occupy different rows and columns.
- A glyph from `@bruff/glyph` is a multi-byte Unicode character.
- ANSI output must reset styles even after rendering the final cell.
- ANSI output must clear the screen before drawing so it does not overwrite the command line.
- ANSI output must leave the cursor below the rendered scene so the next shell prompt is clean.
- A writer reports a failed write by returning `false`.
- A writer throws while receiving output.
- Writing fails before input listeners are registered.
- Input runs in a TTY that supports raw mode.
- Input runs without raw-mode support, such as piped input.
- The user quits with `q`.
- The user quits with `Q`.
- The user quits with `Ctrl+C`.
- The renderer is called more than once with the same mock scene.
- Tests run without a browser, DOM, pseudo-terminal, or external TypeScript transpiler.

## Verification

- `pnpm --filter @bruff/cli run format` passed and left package files unchanged.
- `pnpm --filter @bruff/cli run lint` passed with `@bruff/eslint-config`.
- `pnpm --filter @bruff/cli run typecheck` passed with native Node TypeScript settings.
- `pnpm --filter @bruff/cli run test` passed 20 native `node:test` tests covering ANSI encoding, mock scene composition, frame rendering, writer errors, injected CLI writer behaviour, and quit input lifecycle.
- `printf q | CI=true pnpm --filter @bruff/cli run cli` wrote ANSI text containing screen clearing, cursor movement, truecolor foregrounds, truecolor backgrounds, glyphs from `@bruff/glyph`, a final prompt cursor move, and a final reset sequence before exiting from the quit shortcut.
