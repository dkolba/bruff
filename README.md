# bruff

A modern JavaScript/TypeScript roguelike game collection with focus on functional programming patterns and type safety.

## About Roguelikes

Roguelike games are a genre of role-playing games characterized by procedurally generated levels, turn-based gameplay, and permanent death mechanics. They traditionally feature ASCII or tile-based graphics and emphasize strategic decision-making.

## Project Structure

This monorepo contains the following packages:

- `@bruff/eslint-config`: Shared ESLint configuration enforcing consistent code style and best practices
- `@bruff/arcade`: Vite showcase and Playwright E2E host
- `@bruff/cli`: Terminal shell for DOM-free game rendering
- `@bruff/contracts`: Shared Zod schemas, readonly inferred types, and parser helpers
- `@bruff/game`: Core game and roguelike mechanics implementation
- `@bruff/game-element`: Web Component shell that mounts the game canvas
- `@bruff/glyph`: Shared glyph catalog package
- `@bruff/sigil`: Development-only glyph extraction and mapping tool
- `@bruff/utils`: Functional programming utilities and helper functions used across packages

## Documentation

- [Development](./docs/development.md)
