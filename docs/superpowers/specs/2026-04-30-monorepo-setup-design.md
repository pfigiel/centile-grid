# Monorepo Setup Design

**Date:** 2026-04-30
**Status:** Approved

## Overview

Migrate the existing single Expo/React Native app into a monorepo structure using pnpm workspaces and Turborepo. The structure is prepared for future backend and web apps but starts with only the mobile app.

## Repository Structure

```
centile-grid/
├── apps/
│   └── mobile/                  ← all current app files moved here
├── packages/                    ← empty, ready for future shared code
├── package.json                 ← workspace root (turbo + husky + lint-staged devDeps)
├── pnpm-workspace.yaml          ← declares apps/* and packages/*
├── turbo.json                   ← task pipeline: build, lint, test
├── .npmrc                       ← node-linker=hoisted (required for Expo + pnpm)
├── .husky/                      ← stays at root (git hooks are always repo-level)
├── .lintstagedrc.json           ← stays at root, scoped per-app via glob patterns
├── .gitignore
└── README.md
```

All current app files (`app/`, `app.json`, `package.json`, `tsconfig.json`, `eslint.config.mjs`, etc.) move into `apps/mobile/`. `.husky/` and `.lintstagedrc.json` stay at the repo root — git hooks are always repo-level, and lint-staged uses per-glob rules to scope behaviour per app.

## Key Configuration

### Root `pnpm-workspace.yaml`

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### Root `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "lint": {},
    "test": {}
  }
}
```

### Root `.npmrc`

```
node-linker=hoisted
```

Required so pnpm hoists dependencies the same way npm does, which Expo's Metro bundler requires to resolve modules.

### `apps/mobile/metro.config.js`

Add `watchFolders` pointing to the repo root so Metro can resolve packages from the monorepo root `node_modules`.

```js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = config;
```

### `apps/mobile/package.json`

- Set `name` to `@centile-grid/mobile`
- All existing dependencies and scripts remain unchanged

## Migration Steps

1. Delete `node_modules/` and `package-lock.json` at the root
2. Move all current app files into `apps/mobile/`
3. Create root `package.json` (workspace root, turbo as devDep)
4. Create `pnpm-workspace.yaml`
5. Create root `turbo.json`
6. Create root `.npmrc` with `node-linker=hoisted`
7. Add `metro.config.js` in `apps/mobile/`
8. Update `apps/mobile/package.json` — set `name` to `@centile-grid/mobile`
9. Update `.gitignore` at root (adjust paths as needed)
10. Update `.lintstagedrc.json` glob patterns to prefix `apps/mobile/` (e.g. `apps/mobile/**/*.{ts,tsx}`)
11. Move husky + lint-staged devDeps to root `package.json`; remove them from `apps/mobile/package.json`
12. Run `pnpm install` from root
13. Verify `pnpm --filter @centile-grid/mobile start` launches the Expo dev server

## Decisions

| Decision            | Choice                | Reason                                                               |
| ------------------- | --------------------- | -------------------------------------------------------------------- |
| Package manager     | pnpm                  | Better disk efficiency, strict isolation, excellent monorepo support |
| Build orchestration | Turborepo             | Task caching and parallelization; good fit for JS/TS monorepos       |
| Directory layout    | `apps/` + `packages/` | Future-proof; `packages/` empty for now                              |
| pnpm node linker    | hoisted               | Required for Expo/Metro compatibility                                |
