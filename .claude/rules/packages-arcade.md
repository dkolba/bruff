---
paths:
  - "packages/arcade/**/*.*"
---

# `@bruff/arcade` — E2E Host & Showcase

This package hosts `<bruff-game>` in a Vite-served page so the game can be exercised by end-to-end tests across browsers and viewports. It is the only place that bundles and runs the full game in a browser context.

- **Language**: TypeScript with TSDoc annotations.
- **Role**: Imperative shell at the *application* level — bootstraps the Web Component, runs Playwright E2E tests, and reports Istanbul coverage.

## Test conventions specific to this package

- **AR-1 (MUST)** E2E tests use the `*.spec.ts` extension and run via Playwright (not Vitest). This is the inverse of the universal `*.test.ts` convention used elsewhere.
- **AR-2 (MUST)** Tests run across desktop (Chromium / Firefox / WebKit) and mobile (Pixel 5 Chrome, iPhone 12 Safari) viewports. New tests must pass on all five.
- **AR-3 (MUST)** Coverage is collected with NYC / Istanbul instrumentation injected by `vite-plugin-istanbul`. Thresholds are 80% for branches, lines, functions, statements (per `.nycrc.json`).
- **AR-4 (MUST)** Accessibility checks run via `@axe-core/playwright` against both light and dark colour schemes.

## Package-specific allowances

- **AR-5** DOM access and full-page navigation are allowed — this is the application shell.
- **AR-6** The package may import `@bruff/game` and rely on its side-effecting registration of the `<bruff-game>` custom element.

## Package-specific obligations

- **AR-7 (MUST)** No game logic lives here. The arcade only mounts the component, runs the tests, and reports coverage.
- **AR-8 (MUST)** Vite production build (`pnpm run build:site`) emits to `site/` with sourcemaps enabled and minification disabled.
