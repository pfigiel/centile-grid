# ui-kit-mobile Package Design

**Date:** 2026-04-30
**Status:** Approved

## Overview

Create a `packages/ui-kit-mobile` package in the monorepo that exposes domain-agnostic UI components for the mobile app. Components wrap React Native Paper (RNP) under the hood, defining their own `Props` types that restrict and map to the underlying library's props. The package is consumed as TypeScript source directly by Metro — no build step.

## Package Structure

```
packages/ui-kit-mobile/
├── src/
│   ├── components/
│   │   └── Button/
│   │       ├── Button.tsx      ← component logic + Props type
│   │       └── index.ts        ← re-exports public API
│   └── index.ts                ← barrel: re-exports all components
├── package.json
└── tsconfig.json
```

Each component folder (e.g. `Button/`) holds:

- `Button.tsx` — component implementation and its `Props` type
- `index.ts` — selectively re-exports what consumers should see (component + Props type)
- Future additions: `Button.test.tsx`, style files, etc.

The package barrel `src/index.ts` re-exports from each component's `index.ts`.

## package.json

- `name`: `@centile-grid/ui-kit-mobile`
- `main`: `src/index.ts` — Metro resolves TypeScript source directly
- `peerDependencies`: `react`, `react-native`, `react-native-paper` — not bundled, provided by the host app
- No `build` script — source-only package

## tsconfig.json

Extends `expo/tsconfig.base`, sets `"noEmit": true`. No compilation expected.

## Mobile App Changes

- `react-native-paper` added to `apps/mobile/package.json` dependencies
- `apps/mobile/tsconfig.json` gets a path entry so TypeScript resolves types:
  ```json
  "@centile-grid/ui-kit-mobile": ["../../packages/ui-kit-mobile/src/index.ts"]
  ```
- Metro already watches the monorepo root (`watchFolders`), so no additional Metro config is needed

## Button Component (Initial Version)

```ts
type Props = { children: React.ReactNode };
const Button = ({ children }: Props) => <RNPButton>{children}</RNPButton>;
```

Only `children` is accepted in this version. The mapping to RNP's props is internal.

Consumers import as:

```ts
import { Button } from '@centile-grid/ui-kit-mobile';
```

## Decisions

| Decision         | Choice                       | Reason                                                                        |
| ---------------- | ---------------------------- | ----------------------------------------------------------------------------- |
| Consumption mode | Source-only (no build)       | Metro resolves TS directly; no compilation overhead for a mobile-only package |
| Export pattern   | Barrel + per-component index | Scales cleanly as components grow; internal structure stays hidden            |
| RNP as peer dep  | Yes                          | RNP must be installed in the host app (Expo peer dep requirements)            |
| Import aliases   | None                         | Added complexity not worth it; package name import is sufficient              |
