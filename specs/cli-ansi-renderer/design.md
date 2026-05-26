# CLI ANSI Renderer — Design

## Layer Assignment

| Module or file                         | Package      | Layer                       | Purpose                                                      |
| -------------------------------------- | ------------ | --------------------------- | ------------------------------------------------------------ |
| `packages/cli/package.json`            | `@bruff/cli` | Package metadata            | Defines native Node TypeScript scripts and dependencies.     |
| `packages/cli/tsconfig.json`           | `@bruff/cli` | Type-check config           | Enables erasable TypeScript syntax for direct Node runtime.  |
| `packages/cli/eslint.config.js`        | `@bruff/cli` | Package-local lint config   | Reuses the workspace `@bruff/eslint-config` flat config.     |
| `packages/cli/README.md`               | `@bruff/cli` | Package documentation       | Documents the mock-only scope and commands.                  |
| `packages/cli/module/ansi.ts`          | `@bruff/cli` | Pure ANSI encoding          | Converts terminal commands into ANSI strings.                |
| `packages/cli/module/terminal-cell.ts` | `@bruff/cli` | Pure render model           | Defines terminal cells, RGB colors, and frames.              |
| `packages/cli/module/mock-scene.ts`    | `@bruff/cli` | Pure mock data              | Creates the deterministic sample frame using `@bruff/glyph`. |
| `packages/cli/module/render-frame.ts`  | `@bruff/cli` | Pure frame projection       | Converts a terminal frame into ANSI commands and cleanup.    |
| `packages/cli/module/write-frame.ts`   | `@bruff/cli` | Node writer boundary        | Writes encoded ANSI text to an injected stdout-like writer.  |
| `packages/cli/index.ts`                | `@bruff/cli` | Public package API          | Exports pure renderer helpers and mock scene creation.       |
| `packages/cli/bin/bruff-cli.ts`        | `@bruff/cli` | Executable Node entry point | Renders the mock scene and waits for a quit shortcut.        |
| `packages/cli/**/*.test.ts`            | `@bruff/cli` | Native Node tests           | Uses `node:test` and `node:assert/strict` only.              |

`@bruff/cli` is intentionally standalone at runtime. Its runtime and test source may import Node built-ins and `@bruff/glyph`; it must not import any other workspace package or any game package. Tooling files may import `@bruff/eslint-config` so lint behaviour stays aligned with the rest of the monorepo. The package does not own game abstractions yet.

## Public API Surface

```ts
// packages/cli/module/terminal-cell.ts
export type TerminalColor = Readonly<{
  blue: number;
  green: number;
  red: number;
}>;

export type TerminalPosition = Readonly<{
  column: number;
  row: number;
}>;

export type TerminalCell = Readonly<{
  backgroundColor: TerminalColor;
  foregroundColor: TerminalColor;
  glyph: string;
  position: TerminalPosition;
}>;

export type TerminalFrame = Readonly<{
  cells: ReadonlyArray<TerminalCell>;
}>;
```

```ts
// packages/cli/module/ansi.ts
import type { TerminalColor, TerminalPosition } from "./terminal-cell.ts";

export type AnsiCommand =
  | { readonly type: "clear-screen" }
  | { readonly type: "cursor-move"; readonly position: TerminalPosition }
  | { readonly type: "reset-style" }
  | { readonly color: TerminalColor; readonly type: "set-background" }
  | { readonly color: TerminalColor; readonly type: "set-foreground" }
  | { readonly glyph: string; readonly type: "write-glyph" };

export const encodeAnsiCommand: (command: AnsiCommand) => string;
export const encodeAnsiCommands: (
  commands: ReadonlyArray<AnsiCommand>,
) => string;
```

```ts
// packages/cli/module/mock-scene.ts
export const createMockTerminalFrame: () => TerminalFrame;
```

`createMockTerminalFrame()` imports glyph constants from `@bruff/glyph` and returns fixed mock cells such as a player marker, wall marker, treasure marker, and hazard marker. It does not import game state or package internals.

```ts
// packages/cli/module/render-frame.ts
export const renderTerminalFrame: (
  frame: TerminalFrame,
) => ReadonlyArray<AnsiCommand>;
```

`renderTerminalFrame()` emits screen clearing, cursor movement, foreground color, background color, glyph write, a cursor move below the scene, and a final reset command for every frame.

```ts
// packages/cli/module/write-frame.ts
export type TextWriter = Readonly<{
  write: (text: string) => boolean;
}>;

export type WriteFrameResult =
  | { readonly type: "ok" }
  | { readonly reason: "write-failed" | "write-threw"; readonly type: "error" };

export const writeTerminalFrame: (
  writer: TextWriter,
  frame: TerminalFrame,
) => WriteFrameResult;
```

```ts
// packages/cli/index.ts
export { encodeAnsiCommand, encodeAnsiCommands } from "./module/ansi.ts";
export { createMockTerminalFrame } from "./module/mock-scene.ts";
export { renderTerminalFrame } from "./module/render-frame.ts";
export { writeTerminalFrame } from "./module/write-frame.ts";
export type { AnsiCommand } from "./module/ansi.ts";
export type { TextWriter, WriteFrameResult } from "./module/write-frame.ts";
export type {
  TerminalCell,
  TerminalColor,
  TerminalFrame,
  TerminalPosition,
} from "./module/terminal-cell.ts";
```

The public API must stay package-local and game-free.

```ts
// packages/cli/bin/bruff-cli.ts
import type { TextWriter, WriteFrameResult } from "../module/write-frame.ts";

export type TextInputChunk = Buffer | string;

export type TextInput = Readonly<{
  isTTY?: boolean;
  pause: () => TextInput;
  resume: () => TextInput;
  setRawMode?: (enabled: boolean) => TextInput;
  on: (
    eventName: "data",
    listener: (chunk: TextInputChunk) => void,
  ) => TextInput;
  off: (
    eventName: "data",
    listener: (chunk: TextInputChunk) => void,
  ) => TextInput;
}>;

export type BruffCliPorts = Readonly<{
  input: TextInput;
  writer: TextWriter;
}>;

export const runBruffCli: (ports: BruffCliPorts) => WriteFrameResult;
```

`runBruffCli()` renders the deterministic mock scene through an injected writer,
then registers an injected input listener for `q`, `Q`, and `Ctrl+C`. If the
input is a TTY with `setRawMode`, the CLI enables raw mode while waiting and
restores it before pausing input on quit. If writing fails, it returns the write
error without registering input. When `bin/bruff-cli.ts` is executed directly by
Node, it wraps `process.stdin` and `process.stdout` in these ports and sets
`process.exitCode = 1` if writing fails.

## Data Flow

```text
@bruff/glyph constants
  |
  v
mock-scene.ts
  |
  | TerminalFrame
  v
render-frame.ts
  |
  | ReadonlyArray<AnsiCommand>
  v
ansi.ts
  |
  | ANSI string
  v
write-frame.ts
  |
  | writer.write(text)
  v
process.stdout in bin/bruff-cli.ts

process.stdin in bin/bruff-cli.ts
  |
  | q, Q, or Ctrl+C
  v
remove input listener, restore raw mode, pause input
```

Tests can stop at any pure boundary. The executable entry point is a thin shell over `createMockTerminalFrame()`, `writeTerminalFrame(process.stdout, frame)`, and an injected `process.stdin` quit listener.

## Data Shape Changes

No `GameState` migration is required. No game action, render command, replay fixture, browser API, or canvas type changes are allowed.

`@bruff/cli` introduces terminal-local ADTs for colors, positions, cells, frames, ANSI commands, writer results, injected text writers, injected text input, and CLI ports. These types do not flow into any game package.

## Native Node TypeScript Setup

`packages/cli/package.json` should use `"type": "module"` and run `.ts` files directly:

```json
{
  "dependencies": {
    "@bruff/glyph": "workspace:0.0.0"
  },
  "devDependencies": {
    "@bruff/eslint-config": "workspace:0.0.0",
    "@types/node": "catalog:",
    "eslint": "catalog:",
    "prettier": "catalog:",
    "typescript": "catalog:"
  },
  "scripts": {
    "cli": "node bin/bruff-cli.ts",
    "format": "prettier --write .",
    "lint": "eslint",
    "test": "node --test \"**/*.test.ts\"",
    "typecheck": "tsc --noEmit"
  }
}
```

`packages/cli/tsconfig.json` should keep all TypeScript erasable at runtime:

```json
{
  "compilerOptions": {
    "allowImportingTsExtensions": true,
    "erasableSyntaxOnly": true,
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "noEmit": true,
    "rewriteRelativeImportExtensions": true,
    "target": "esnext",
    "verbatimModuleSyntax": true
  }
}
```

Tests must import from `.ts` files with explicit extensions and use only `node:test` plus `node:assert/strict`.

`packages/cli/eslint.config.js` should follow the existing flat-config pattern used by sibling packages:

```js
import bruffEslintConfig from "@bruff/eslint-config";

export default [
  {
    ignores: ["coverage/**/*.*"],
  },
  ...bruffEslintConfig,
];
```

## Reuse Map

| Existing file                               | Reuse                                                                 |
| ------------------------------------------- | --------------------------------------------------------------------- |
| `packages/glyph/index.ts`                   | Source of characters for mock terminal cells.                         |
| `packages/eslint-config/README.md`          | Shared flat ESLint config usage pattern for package lint setup.       |
| `packages/eslint-config/eslint.config.js`   | Local package export consumed by `packages/cli/eslint.config.js`.     |
| `package.json`                              | Confirms root Node version supports native TypeScript execution.      |
| `pnpm-workspace.yaml`                       | Existing `packages/*` workspace glob already includes `packages/cli`. |
| `.agents/skills/node-native-tests/SKILL.md` | Test runner and TypeScript runtime constraints.                       |

No other workspace package is reused by runtime or test source code.

## Tradeoffs

### Package Boundary

- **Chosen: standalone mock renderer importing only `@bruff/glyph`.** This satisfies the current need to prove terminal rendering without forcing premature game package API decisions.
- **Alternative: add `@bruff/game/headless` now.** Rejected because this spec explicitly defers game integration to a later spec.
- **Alternative: import deep files from `packages/game`.** Rejected because it violates package ownership and the mock-only scope.

### Runtime TypeScript

- **Chosen: run `.ts` files directly with Node's native TypeScript support.** This keeps the CLI simple and avoids runtime transpiler dependencies.
- **Alternative: use `tsx` or `ts-node`.** Rejected because the package must not rely on external runtime transpilers.
- **Alternative: compile TypeScript to JavaScript before running.** Rejected for this first CLI because emitted artifacts are unnecessary; `tsc --noEmit` is enough for type checking.

### Test Runner

- **Chosen: native `node:test` with `node:assert/strict`.** It matches the package's Node-only scope and avoids browser or bundler infrastructure.
- **Alternative: Vitest.** Rejected because this package must demonstrate plain Node execution without a test transpiler.
- **Alternative: Playwright.** Rejected because the renderer is not browser code and does not use DOM or canvas APIs.

### ANSI Rendering Strategy

- **Chosen: encode explicit ANSI commands from a terminal frame.** Tests can assert exact escape sequences while keeping command construction readable. The command stream clears the screen before drawing and moves the cursor below the scene before resetting styles so shell output remains clean.
- **Alternative: concatenate ANSI strings inline in the mock scene.** Rejected because it makes color and cursor behaviour harder to test independently.
- **Alternative: adopt a TUI framework.** Rejected because the current scope is a tiny renderer with no input, layout engine, or terminal session lifecycle.

### Quit Shortcut Strategy

- **Chosen: wait for `q`, `Q`, or `Ctrl+C` through an injected stdin-like port.** This keeps the CLI visibly open after rendering while preserving deterministic tests and avoiding a game loop.
- **Alternative: exit immediately after drawing.** Rejected because the terminal scene disappears into the shell prompt flow too quickly and does not behave like an interactive CLI.
- **Alternative: implement a full input loop or terminal session manager.** Rejected because this spike only needs a quit shortcut, not gameplay input, resize handling, alternate screen mode, or terminal capability negotiation.
