# @bruff/arcade

The web application that hosts and end-to-end tests the `@bruff/game` package. It renders the `<bruff-game>` Web Component in a minimal full-screen page, runs Playwright E2E tests across desktop and mobile browsers, and reports Istanbul code coverage.

## Development

```sh
pnpm run dev        # Start Vite dev server at localhost:5173
pnpm run lint       # Lint with ESLint
pnpm run typecheck  # Type-check with TypeScript
pnpm run format     # Format with Prettier
```

## Testing

```sh
pnpm run test       # Clean coverage, run E2E tests, generate report
pnpm run test:e2e   # Run Playwright E2E tests only
```

Tests run headless across Chromium, Firefox, and WebKit on desktop, plus Pixel 5 (Chrome) and iPhone 12 (Safari) mobile viewports. Each test run collects Istanbul coverage from the browser and writes it to `.nyc_output/`.

Coverage thresholds (branches, lines, functions, statements) are set at 80% and enforced via `.nycrc.json`.

## Building

```sh
pnpm run build:site   # Production build to site/
```

Source maps are enabled in the production build. The Vite build instruments the game library and app entry point with Istanbul for coverage collection.

## Workspace dependencies

| Package                | Role                                                          |
| ---------------------- | ------------------------------------------------------------- |
| `@bruff/game`          | Core game library — provides the `<bruff-game>` Web Component |
| `@bruff/eslint-config` | Shared ESLint configuration                                   |
