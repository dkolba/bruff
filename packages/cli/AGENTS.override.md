# `@bruff/cli` — Terminal Shell Spike

This package owns the mock-only ANSI terminal renderer. It proves terminal
rendering mechanics without depending on game state, game render commands, or
browser packages.

- **Language**: TypeScript with TSDoc annotations.
- **Role**: Node terminal shell plus small pure ANSI/render projection helpers.
- **Runtime boundary**: Runtime and test source may import Node built-ins and
  `@bruff/glyph`. Do not import `@bruff/game`, `@bruff/game-element`,
  `@bruff/arcade`, `@bruff/sigil`, `@bruff/utils`, or workspace internals.

## Package-Specific Allowances

- **CL-1** ANSI terminal control is allowed only in `module/ansi.ts` as explicit
  `AnsiCommand` encoding.
- **CL-2** `process.stdin`, `process.stdout`, raw mode, and input listeners are
  allowed only in `bin/bruff-cli.ts`, behind injected `TextInput` and
  `TextWriter` ports.
- **CL-3** `@bruff/glyph` may be used only as a character catalog for mock
  terminal cells.

## Package-Specific Obligations

- **CL-4 (MUST)** The CLI remains mock-only until a future spec introduces an
  explicit public game API for headless terminal rendering.
- **CL-5 (MUST)** The CLI waits for only the minimal quit shortcuts: `q`, `Q`,
  and `Ctrl+C`. Do not add gameplay input, resize handling, alternate screen
  mode, mouse reporting, or a game loop in this package without a new spec.
- **CL-6 (MUST)** If raw mode is enabled while waiting for a quit shortcut, it
  must be disabled before input is paused.
- **CL-7 (MUST)** Writer failures remain typed `WriteFrameResult` values.
  Rendering or input setup must not throw for expected terminal failures.
- **CL-8 (MUST)** Tests use native Node TypeScript execution with `node:test`
  and `node:assert/strict`. Do not add Vitest, Jest, Playwright, browser APIs,
  DOM APIs, `tsx`, `ts-node`, Babel, or Vite to this package.
- **CL-9 (MUST)** Tests assert through public exports or injected CLI ports.
  They must not open a real TTY or depend on a pseudo-terminal.
