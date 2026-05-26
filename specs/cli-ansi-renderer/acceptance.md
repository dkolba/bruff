# CLI ANSI Renderer — Acceptance

- Running `pnpm --filter @bruff/cli run cli` writes ANSI text to stdout.
- The CLI output begins with an ANSI clear-screen sequence.
- The CLI output includes at least one cursor movement sequence such as `\x1b[<row>;<column>H`.
- The CLI output includes at least one truecolor foreground sequence using `38;2`.
- The CLI output includes at least one truecolor background sequence using `48;2`.
- The CLI output includes at least three different glyphs sourced from `@bruff/glyph`.
- The CLI output moves the cursor below the mock scene before the final ANSI reset sequence.
- Running the CLI from an interactive terminal waits after drawing until the user presses `q`, `Q`, or `Ctrl+C`.
- Running `printf q | pnpm --filter @bruff/cli run cli` exits normally after drawing and receiving the quit shortcut.
- `packages/cli` runtime and test source imports no workspace package other than `@bruff/glyph`.
- `packages/cli/eslint.config.js` imports and spreads the local shared `@bruff/eslint-config`.
- No game-related package files are modified while implementing this spec.
- `pnpm --filter @bruff/cli run test` runs native `node:test` TypeScript tests directly.
- `pnpm --filter @bruff/cli run typecheck` succeeds without emitting JavaScript.
- Tests cover ANSI encoding, mock scene composition, frame rendering, writer failures, executable entry boundary, raw-mode input setup, quit shortcuts, and writer failure before input registration.
