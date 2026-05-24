# @bruff/arcade

The web application that hosts and end-to-end tests the `@bruff/game` package. It renders the `<bruff-game>` Web Component in a minimal full-screen page, exposes development-only tools at `/tools`, runs Playwright E2E tests across desktop and mobile browsers, and reports Istanbul code coverage.

## Development

```sh
pnpm run dev        # Start Vite dev server at localhost:5173
pnpm run lint       # Lint with ESLint
pnpm run typecheck  # Type-check with TypeScript
pnpm run format     # Format with Prettier
```

The dev server exposes `/tools` for local tooling such as `<tool-sigil>`.
Production builds mount only `<bruff-game>`; the tools route and `@bruff/sigil`
are loaded through the development-only router.

## Testing

```sh
pnpm run test       # Clean coverage, run E2E tests, generate report
pnpm run test:e2e   # Run Playwright E2E tests only
```

Tests run headless across Chromium, Firefox, and WebKit on desktop, plus Pixel 5 (Chrome) and iPhone 12 (Safari) mobile viewports. Each test run collects Istanbul coverage from the browser and writes it to `.nyc_output/`.

The suite is split by responsibility:

- `state-assertions.spec.ts` drives `window.__bruffTestApi` and asserts on `GameState`.
- `accessibility.spec.ts` runs axe checks for the root game route and `/tools` in dark and light schemes.
- `hud-visual.spec.ts` captures the static DOM HUD region.
- `replay-checkpoint.spec.ts` loads a replay fixture, freezes the canvas, and captures one stable screenshot.

Use `?test=1` to opt into deterministic browser control. Playwright also starts Vite with `VITE_TEST_MODE=1`, which enables the build-time test-mode gate. Outside that mode, the browser test API is not exposed.

Coverage thresholds (branches, lines, functions, statements) are set at 80% and enforced via `.nycrc.json`.

## Building

```sh
pnpm run build:site   # Production build to site/
```

Source maps are enabled in the production build with source contents excluded. The production build also runs `check:bundle-clean`, which fails if emitted assets contain `__bruffTestApi`, `tool-sigil`, `@bruff/sigil`, `opentype`, or `dev-tools-router`.

## Workspace dependencies

| Package                | Role                                                          |
| ---------------------- | ------------------------------------------------------------- |
| `@bruff/game`          | Core game library — provides the `<bruff-game>` Web Component |
| `@bruff/sigil`         | Development-only glyph JSON extraction tool for `/tools`      |
| `@bruff/eslint-config` | Shared ESLint configuration                                   |
