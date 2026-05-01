# Jest Test Setup Design

**Date:** 2026-04-30  
**Scope:** `apps/mobile`, `packages/ui-kit-mobile`

## Architecture

Per-package Jest configuration, consistent with how `typecheck` and `lint` are structured. Turbo fans out a `test` task to all packages. A pre-push hook blocks pushes when any test fails.

```
centile-grid/
  package.json            ← add "test": "turbo test"
  turbo.json              ← add "test" task
  .husky/pre-push         ← new: runs pnpm test
  apps/mobile/
    jest.config.mjs       ← new: jest-expo preset
    package.json          ← add devDeps + "test" script
  packages/ui-kit-mobile/
    jest.config.mjs       ← new: jest-expo preset
    package.json          ← add devDeps + "test" script
    src/components/Button/
      Button.test.tsx     ← new: basic test suite
```

## Dependencies

Both packages install the same devDependencies:

- `jest` — test runner
- `jest-expo` — preset that handles Babel transforms, native module mocks, and asset stubs for Expo/React Native
- `@testing-library/react-native` — render and query utilities
- `@types/jest` — TypeScript types

## Jest Configuration

Each package gets a minimal `jest.config.mjs`:

```js
export default { preset: 'jest-expo' };
```

No additional transform configuration needed; `jest-expo` handles everything.

## Button Test Suite (`packages/ui-kit-mobile`)

Two tests covering the component's public interface:

1. **Renders children** — mounts `<Button>Label</Button>`, asserts the text "Label" is visible
2. **Calls onPress** — fires a press event, asserts the mock callback was called once

## Turbo Task

`turbo.json` gains a `test` task with no `dependsOn` — tests in each package run independently:

```json
"test": { "outputs": [] }
```

## Scripts

- Each package `package.json`: `"test": "jest"`
- Root `package.json`: `"test": "turbo test"`

## Pre-push Hook

`.husky/pre-push` runs `pnpm test` at the monorepo root. If any test fails, the push is blocked.
