# `@bruff/cli` — Terminal Shell Spike

This package owns the ANSI terminal renderer shell. It renders game-owned
headless frame data without depending on browser packages or game internals.

- **Language**: TypeScript with TSDoc annotations.
- **Role**: Node terminal shell plus small pure ANSI/render projection helpers.
- **Runtime boundary**: Runtime and test source may import Node built-ins,
  `@bruff/glyph`, and the public `@bruff/game/headless` subpath. Do not import
  `@bruff/game` root, `@bruff/game-element`, `@bruff/arcade`, `@bruff/sigil`,
  `@bruff/utils`, game internals, or workspace internals.

## Package-Specific Allowances

- **CL-1** ANSI terminal control is allowed only in `module/ansi.ts` as explicit
  `AnsiCommand` encoding.
- **CL-2** `process.stdin`, `process.stdout`, raw mode, and input listeners are
  allowed only in `bin/bruff-cli.ts`, behind injected `TextInput` and
  `TextWriter` ports.
- **CL-3** `@bruff/glyph` may be used only as a character catalog for terminal
  cells.
- **CL-3a** `@bruff/game/headless` is the only allowed game package import. The
  CLI must not deep-import `packages/game/lib/**`.

## Package-Specific Obligations

- **CL-4 (MUST)** Game integration uses pure headless state functions and the
  terminal adapter in `module/game-frame.ts`; terminal rendering must not depend
  on Canvas render commands.
- **CL-5 (MUST)** The CLI handles normalised movement keys plus the minimal quit
  shortcuts: `q`, `Q`, and `Ctrl+C`. Do not add resize handling, alternate
  screen mode, mouse reporting, or a timed game loop in this package without a
  new spec.
- **CL-6 (MUST)** If raw mode is enabled while waiting for a quit shortcut, it
  must be disabled before input is paused.
- **CL-7 (MUST)** Writer failures remain typed `WriteFrameResult` values.
  Rendering or input setup must not throw for expected terminal failures.
- **CL-8 (MUST)** Tests use native Node TypeScript execution with `node:test`
  and `node:assert/strict`. Do not add Vitest, Jest, Playwright, browser APIs,
  DOM APIs, `tsx`, `ts-node`, Babel, or Vite to this package.
- **CL-9 (MUST)** Tests assert through public exports or injected CLI ports.
  They must not open a real TTY or depend on a pseudo-terminal.
