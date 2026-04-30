# ui-kit-mobile Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the `packages/ui-kit-mobile` package with a `Button` component wrapping React Native Paper, consumed as TypeScript source by the mobile app.

**Architecture:** Source-only package (no build step) — Metro resolves `.tsx` files directly via the monorepo `watchFolders` setup already in place. The mobile app adds the package as a `workspace:*` dependency so pnpm symlinks it into `node_modules`. Each component lives in its own folder with `ComponentName.tsx` for logic and `index.ts` for public re-exports.

**Tech Stack:** React Native 0.81, Expo 54, React Native Paper 5.x, TypeScript (strict), pnpm workspaces, Turborepo

---

### Task 1: Create package scaffold

**Files:**

- Create: `packages/ui-kit-mobile/package.json`
- Create: `packages/ui-kit-mobile/tsconfig.json`

- [ ] **Step 1: Create `packages/ui-kit-mobile/package.json`**

```json
{
  "name": "@centile-grid/ui-kit-mobile",
  "version": "0.1.0",
  "main": "src/index.ts",
  "peerDependencies": {
    "react": "*",
    "react-native": "*",
    "react-native-paper": "*"
  }
}
```

- [ ] **Step 2: Create `packages/ui-kit-mobile/tsconfig.json`**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noEmit": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/ui-kit-mobile/package.json packages/ui-kit-mobile/tsconfig.json
git commit -m "feat: scaffold ui-kit-mobile package"
```

---

### Task 2: Create Button component

**Files:**

- Create: `packages/ui-kit-mobile/src/components/Button/Button.tsx`
- Create: `packages/ui-kit-mobile/src/components/Button/index.ts`
- Create: `packages/ui-kit-mobile/src/index.ts`

- [ ] **Step 1: Create `packages/ui-kit-mobile/src/components/Button/Button.tsx`**

```tsx
import React from 'react';
import { Button as RNPButton } from 'react-native-paper';

type Props = {
  children: React.ReactNode;
};

const Button = ({ children }: Props) => <RNPButton>{children}</RNPButton>;

export { Button };
export type { Props as ButtonProps };
```

- [ ] **Step 2: Create `packages/ui-kit-mobile/src/components/Button/index.ts`**

```ts
export { Button } from './Button';
export type { ButtonProps } from './Button';
```

- [ ] **Step 3: Create `packages/ui-kit-mobile/src/index.ts`**

```ts
export { Button } from './components/Button';
export type { ButtonProps } from './components/Button';
```

- [ ] **Step 4: Commit**

```bash
git add packages/ui-kit-mobile/src/
git commit -m "feat: add Button component to ui-kit-mobile"
```

---

### Task 3: Wire up mobile app

**Files:**

- Modify: `apps/mobile/package.json`
- Modify: `apps/mobile/tsconfig.json`

- [ ] **Step 1: Add dependencies to `apps/mobile/package.json`**

Add to the `dependencies` object (keep alphabetical order within the block):

```json
"@centile-grid/ui-kit-mobile": "workspace:*",
"react-native-paper": "^5.12.0",
```

The full `dependencies` block becomes:

```json
"dependencies": {
  "@centile-grid/ui-kit-mobile": "workspace:*",
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
  "react-native-paper": "^5.12.0",
  "react-native-reanimated": "4.1.1",
  "react-native-safe-area-context": "5.6.0",
  "react-native-screens": "4.16.0",
  "react-native-web": "0.21.0",
  "react-native-worklets": "0.5.1"
}
```

- [ ] **Step 2: Add path alias to `apps/mobile/tsconfig.json`**

Add `@centile-grid/ui-kit-mobile` to the `paths` object:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"],
      "@centile-grid/ui-kit-mobile": ["../../packages/ui-kit-mobile/src/index.ts"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

- [ ] **Step 3: Run pnpm install from monorepo root**

```bash
pnpm install
```

Expected: pnpm links `packages/ui-kit-mobile` into `node_modules/@centile-grid/ui-kit-mobile` and installs `react-native-paper` in the mobile app's node_modules.

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/package.json apps/mobile/tsconfig.json pnpm-lock.yaml
git commit -m "feat: add ui-kit-mobile and react-native-paper to mobile app"
```

---

### Task 4: Update lint-staged config

**Files:**

- Modify: `.lintstagedrc.json`

- [ ] **Step 1: Add `packages/ui-kit-mobile` pattern to `.lintstagedrc.json`**

```json
{
  "apps/mobile/**/*.{js,jsx,ts,tsx}": [
    "eslint --config apps/mobile/eslint.config.mjs --fix",
    "prettier --write"
  ],
  "packages/ui-kit-mobile/**/*.{ts,tsx}": [
    "eslint --config apps/mobile/eslint.config.mjs --fix",
    "prettier --write"
  ],
  "**/*.{json,md}": ["prettier --write"]
}
```

The package reuses the mobile eslint config — both use the same React Native + TypeScript rule set.

- [ ] **Step 2: Commit**

```bash
git add .lintstagedrc.json
git commit -m "chore: add ui-kit-mobile to lint-staged"
```

---

### Task 5: Verify setup

- [ ] **Step 1: Run TypeScript check on the package**

From the monorepo root:

```bash
cd packages/ui-kit-mobile && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2: Run TypeScript check on the mobile app**

```bash
cd apps/mobile && npx tsc --noEmit
```

Expected: no errors. TypeScript resolves `@centile-grid/ui-kit-mobile` via the path alias.

- [ ] **Step 3: Run lint on the new package files**

```bash
eslint --config apps/mobile/eslint.config.mjs packages/ui-kit-mobile/src/
```

Expected: no errors.

- [ ] **Step 4: Commit** (only if any auto-fixes were applied in Step 3)

```bash
git add packages/ui-kit-mobile/src/
git commit -m "style: apply eslint fixes to ui-kit-mobile"
```
