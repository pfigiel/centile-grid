# Monorepo Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the single Expo/React Native app into a pnpm + Turborepo monorepo with `apps/` and `packages/` workspace layout.

**Architecture:** The existing app moves to `apps/mobile/`. A new root `package.json` owns workspace tooling (turbo, husky, lint-staged, prettier). The mobile app keeps its own `package.json` with only app-level deps. Metro is configured to watch the monorepo root so it can resolve shared packages in the future.

**Tech Stack:** pnpm workspaces, Turborepo, Expo/React Native, Husky, lint-staged, TypeScript

---

## File Map

| Action  | Path                                                                                                                               | Responsibility                                               |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Rewrite | `package.json`                                                                                                                     | Root workspace: turbo, husky, lint-staged, prettier, backlog |
| Create  | `pnpm-workspace.yaml`                                                                                                              | Declare `apps/*` and `packages/*`                            |
| Create  | `turbo.json`                                                                                                                       | Task pipeline: build, lint                                   |
| Modify  | `.npmrc`                                                                                                                           | Add `node-linker=hoisted`                                    |
| Modify  | `.lintstagedrc.json`                                                                                                               | Prefix globs with `apps/mobile/`                             |
| Modify  | `.husky/pre-commit`                                                                                                                | Use `pnpm exec lint-staged`                                  |
| Rewrite | `.gitignore`                                                                                                                       | Root-level: only global ignores                              |
| Move    | `app/`, `app.json`, `tsconfig.json`, `eslint.config.mjs`, `expo-env.d.ts`, `README.md`, `.prettierrc`, `.vscode/` → `apps/mobile/` | App-level files                                              |
| Modify  | `apps/mobile/package.json`                                                                                                         | Rename, remove root devDeps, fix scripts                     |
| Create  | `apps/mobile/metro.config.js`                                                                                                      | Metro monorepo config                                        |
| Create  | `apps/mobile/.gitignore`                                                                                                           | Expo-specific ignores                                        |
| Create  | `packages/.gitkeep`                                                                                                                | Track empty packages dir                                     |

---

## Task 1: Create root workspace scaffold

**Files:**

- Rewrite: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Modify: `.npmrc`

- [ ] **Step 1: Rewrite root `package.json`**

Replace the entire file contents with:

```json
{
  "name": "centile-grid",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "turbo build",
    "lint": "turbo lint",
    "format": "prettier --write .",
    "backlog": "pnpm exec backlog browser",
    "prepare": "husky"
  },
  "devDependencies": {
    "backlog.md": "1.44.0",
    "husky": "9.1.7",
    "lint-staged": "16.4.0",
    "prettier": "3.8.3",
    "turbo": "latest"
  }
}
```

- [ ] **Step 2: Create `pnpm-workspace.yaml`**

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

- [ ] **Step 3: Create `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "lint": {}
  }
}
```

- [ ] **Step 4: Add `node-linker=hoisted` to `.npmrc`**

The current `.npmrc` contains `save-exact=true`. Add one line so the full file is:

```
save-exact=true
node-linker=hoisted
```

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-workspace.yaml turbo.json .npmrc
git commit -m "chore: add root workspace scaffold (pnpm + turbo)"
```

---

## Task 2: Move app files to `apps/mobile/`

**Files:**

- Move: all app-level files → `apps/mobile/`
- Delete: `node_modules/`, `package-lock.json`
- Create: `packages/.gitkeep`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p apps/mobile packages
```

- [ ] **Step 2: Move app files**

```bash
mv app apps/mobile/app
mv app.json apps/mobile/app.json
mv tsconfig.json apps/mobile/tsconfig.json
mv eslint.config.mjs apps/mobile/eslint.config.mjs
mv expo-env.d.ts apps/mobile/expo-env.d.ts
mv README.md apps/mobile/README.md
mv .prettierrc apps/mobile/.prettierrc
mv .vscode apps/mobile/.vscode
mv package.json apps/mobile/package.json
```

Note: `package-lock.json` and `node_modules/` are intentionally left at the root — they will be deleted in the next step. Root `package.json` was already rewritten in Task 1 and is at the root, not inside `apps/mobile/` — do NOT move it.

- [ ] **Step 3: Delete npm artifacts**

```bash
rm package-lock.json
rm -rf node_modules
```

- [ ] **Step 4: Create `packages/.gitkeep`**

```bash
touch packages/.gitkeep
```

- [ ] **Step 5: Commit**

```bash
git add apps/ packages/.gitkeep
git rm --cached package-lock.json
git commit -m "chore: move app files to apps/mobile/"
```

---

## Task 3: Configure `apps/mobile/`

**Files:**

- Modify: `apps/mobile/package.json`
- Create: `apps/mobile/metro.config.js`
- Create: `apps/mobile/.gitignore`

- [ ] **Step 1: Rewrite `apps/mobile/package.json`**

Replace the entire file with (all original deps preserved, name updated, root-level tooling devDeps removed, scripts cleaned up):

```json
{
  "name": "@centile-grid/mobile",
  "main": "expo-router/entry",
  "version": "0.1.0",
  "scripts": {
    "start": "expo start",
    "reset-project": "node ./scripts/reset-project.js",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "expo lint"
  },
  "dependencies": {
    "@expo/vector-icons": "15.0.3",
    "@react-navigation/bottom-tabs": "7.4.0",
    "@react-navigation/elements": "2.6.3",
    "@react-navigation/native": "7.2.2",
    "expo": "54.0.33",
    "expo-constants": "18.0.13",
    "expo-font": "14.0.11",
    "expo-haptics": "15.0.8",
    "expo-image": "3.0.11",
    "expo-linking": "8.0.11",
    "expo-router": "6.0.23",
    "expo-splash-screen": "31.0.13",
    "expo-status-bar": "3.0.9",
    "expo-symbols": "1.0.8",
    "expo-system-ui": "6.0.9",
    "expo-web-browser": "15.0.10",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-native": "0.81.5",
    "react-native-gesture-handler": "2.28.0",
    "react-native-reanimated": "4.1.1",
    "react-native-safe-area-context": "5.6.0",
    "react-native-screens": "4.16.0",
    "react-native-web": "0.21.0",
    "react-native-worklets": "0.5.1"
  },
  "devDependencies": {
    "@types/react": "19.1.0",
    "eslint": "9.25.0",
    "eslint-config-expo": "10.0.0",
    "eslint-config-prettier": "10.1.8",
    "eslint-plugin-prefer-arrow": "1.2.3",
    "typescript": "5.9.2"
  },
  "private": true
}
```

- [ ] **Step 2: Create `apps/mobile/metro.config.js`**

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

- [ ] **Step 3: Create `apps/mobile/.gitignore`**

```
# Expo
.expo/
dist/
web-build/
expo-env.d.ts

# Native
.kotlin/
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# generated native folders
/ios
/android

app-example
```

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/package.json apps/mobile/metro.config.js apps/mobile/.gitignore
git commit -m "chore: configure apps/mobile for monorepo"
```

---

## Task 4: Update root tooling config

**Files:**

- Modify: `.lintstagedrc.json`
- Modify: `.husky/pre-commit`
- Rewrite: `.gitignore`

- [ ] **Step 1: Update `.lintstagedrc.json` with app-scoped globs**

Replace the file contents with:

```json
{
  "apps/mobile/**/*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "**/*.{json,md}": ["prettier --write"]
}
```

- [ ] **Step 2: Update `.husky/pre-commit`**

Replace the file contents with:

```sh
#!/usr/bin/env sh
pnpm exec lint-staged
```

- [ ] **Step 3: Rewrite root `.gitignore`**

The Expo-specific entries are now in `apps/mobile/.gitignore`. Replace the root `.gitignore` with only global ignores:

```
# dependencies
node_modules/

# debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# local env files
.env*.local

# typescript
*.tsbuildinfo

# turbo
.turbo
```

- [ ] **Step 4: Commit**

```bash
git add .lintstagedrc.json .husky/pre-commit .gitignore
git commit -m "chore: update root tooling config for monorepo"
```

---

## Task 5: Install and verify

- [ ] **Step 1: Install dependencies from repo root**

```bash
pnpm install
```

Expected: pnpm resolves workspaces, installs all deps, creates `pnpm-lock.yaml`. No errors.

- [ ] **Step 2: Verify Turborepo lint task runs**

```bash
pnpm lint
```

Expected: turbo runs `lint` in `@centile-grid/mobile`, `expo lint` exits with no errors.

- [ ] **Step 3: Verify Expo dev server starts**

```bash
pnpm --filter @centile-grid/mobile start
```

Expected: Expo CLI starts, QR code shown, no Metro bundler errors. Press `q` to quit.

- [ ] **Step 4: Verify pre-commit hook fires**

```bash
# Stage any file and run the hook manually
echo "" >> apps/mobile/app/index.tsx
git add apps/mobile/app/index.tsx
pnpm exec lint-staged
```

Expected: eslint + prettier run on `apps/mobile/app/index.tsx` with no errors. Revert the dummy change: `git checkout apps/mobile/app/index.tsx`.

- [ ] **Step 5: Commit lockfile and finalize**

```bash
git add pnpm-lock.yaml packages/.gitkeep
git commit -m "chore: install pnpm workspace deps and add lockfile"
```
