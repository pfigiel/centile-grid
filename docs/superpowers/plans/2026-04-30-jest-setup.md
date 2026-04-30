# Jest Test Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Jest + React Native Testing Library to both packages with a pre-push hook that gates all pushes on passing tests.

**Architecture:** Per-package `jest.config.mjs` files using the `jest-expo` preset. Turbo fans out a `test` task across the monorepo. A husky pre-push hook runs `pnpm test` at the root, blocking pushes when tests fail.

**Tech Stack:** Jest 29 (via jest-expo), jest-expo, @testing-library/react-native, husky, turborepo

---

## File Map

| Action | Path                                                           | Purpose                      |
| ------ | -------------------------------------------------------------- | ---------------------------- |
| Create | `packages/ui-kit-mobile/jest.config.mjs`                       | jest-expo preset for library |
| Modify | `packages/ui-kit-mobile/package.json`                          | add devDeps + `test` script  |
| Create | `packages/ui-kit-mobile/src/components/Button/Button.test.tsx` | Button test suite            |
| Create | `apps/mobile/jest.config.mjs`                                  | jest-expo preset for app     |
| Modify | `apps/mobile/package.json`                                     | add devDeps + `test` script  |
| Modify | `turbo.json`                                                   | add `test` task              |
| Modify | `package.json` (root)                                          | add `test` script            |
| Create | `.husky/pre-push`                                              | run all tests before push    |

---

### Task 1: Button test suite + jest infrastructure in packages/ui-kit-mobile

**Files:**

- Create: `packages/ui-kit-mobile/src/components/Button/Button.test.tsx`
- Create: `packages/ui-kit-mobile/jest.config.mjs`
- Modify: `packages/ui-kit-mobile/package.json`

- [ ] **Step 1: Write the failing test**

Create `packages/ui-kit-mobile/src/components/Button/Button.test.tsx`:

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    const { getByText } = render(<Button>Label</Button>);
    expect(getByText('Label')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button onPress={onPress}>Press me</Button>);
    fireEvent.press(getByText('Press me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run from the repo root:

```bash
cd packages/ui-kit-mobile && npx jest 2>&1 | head -20
```

Expected: error such as `jest: command not found` or `Cannot find module 'jest'` — confirms the test cannot run yet.

- [ ] **Step 3: Install dependencies**

From the repo root:

```bash
pnpm --filter @centile-grid/ui-kit-mobile add -D jest jest-expo @testing-library/react-native @types/jest
```

Expected: packages installed, `packages/ui-kit-mobile/package.json` devDependencies updated.

- [ ] **Step 4: Create jest.config.mjs**

Create `packages/ui-kit-mobile/jest.config.mjs`:

```js
export default { preset: 'jest-expo' };
```

- [ ] **Step 5: Add test script to package.json**

In `packages/ui-kit-mobile/package.json`, add `"test": "jest"` to the `scripts` section. The scripts block should look like:

```json
"scripts": {
  "typecheck": "tsc --noEmit",
  "test": "jest"
}
```

- [ ] **Step 6: Run tests and verify they pass**

```bash
pnpm --filter @centile-grid/ui-kit-mobile test
```

Expected output:

```
PASS src/components/Button/Button.test.tsx
  Button
    ✓ renders children
    ✓ calls onPress when pressed

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
```

If you see `ThemeProvider` or context errors, wrap the renders in the test with `PaperProvider`:

```tsx
import { PaperProvider } from 'react-native-paper';
// inside each test:
render(<PaperProvider><Button ...>...</Button></PaperProvider>);
```

- [ ] **Step 7: Commit**

```bash
git add packages/ui-kit-mobile/jest.config.mjs packages/ui-kit-mobile/package.json packages/ui-kit-mobile/src/components/Button/Button.test.tsx pnpm-lock.yaml
git commit -m "feat(ui-kit-mobile): add jest setup and Button tests"
```

---

### Task 2: Jest infrastructure in apps/mobile

**Files:**

- Create: `apps/mobile/jest.config.mjs`
- Modify: `apps/mobile/package.json`

- [ ] **Step 1: Install dependencies**

```bash
pnpm --filter @centile-grid/mobile add -D jest jest-expo @testing-library/react-native @types/jest
```

Expected: packages installed, `apps/mobile/package.json` devDependencies updated.

- [ ] **Step 2: Create jest.config.mjs**

Create `apps/mobile/jest.config.mjs`:

```js
export default { preset: 'jest-expo' };
```

- [ ] **Step 3: Add test script to package.json**

In `apps/mobile/package.json`, add `"test": "jest --passWithNoTests"` to the `scripts` section. The `--passWithNoTests` flag prevents jest from exiting with code 1 when no test files exist yet, which would otherwise break the pre-push hook. The final scripts block should look like:

```json
"scripts": {
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web",
  "lint": "expo lint",
  "typecheck": "tsc --noEmit",
  "test": "jest --passWithNoTests"
}
```

- [ ] **Step 4: Verify jest runs with exit code 0**

```bash
pnpm --filter @centile-grid/mobile test
```

Expected output:

```
Test Suites: 0 skipped, 0 total
Tests:       0 total
```

Exit code 0. If you see a config parse error instead, re-check `jest.config.mjs`.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/jest.config.mjs apps/mobile/package.json pnpm-lock.yaml
git commit -m "feat(mobile): add jest setup"
```

---

### Task 3: Turbo test task and root test script

**Files:**

- Modify: `turbo.json`
- Modify: `package.json` (root)

- [ ] **Step 1: Add test task to turbo.json**

Current `turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": [".expo/**", "dist/**"] },
    "lint": { "outputs": [] },
    "typecheck": { "outputs": [] }
  }
}
```

Add the `test` task — no `dependsOn` because tests in each package are independent:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": [".expo/**", "dist/**"] },
    "lint": { "outputs": [] },
    "typecheck": { "outputs": [] },
    "test": { "outputs": [] }
  }
}
```

- [ ] **Step 2: Add test script to root package.json**

Current root `package.json` scripts:

```json
"scripts": {
  "build": "turbo build",
  "lint": "turbo lint",
  "typecheck": "turbo typecheck",
  "format": "prettier --write .",
  "backlog": "pnpm exec backlog browser",
  "prepare": "husky"
}
```

Add `"test": "turbo test"`:

```json
"scripts": {
  "build": "turbo build",
  "lint": "turbo lint",
  "typecheck": "turbo typecheck",
  "test": "turbo test",
  "format": "prettier --write .",
  "backlog": "pnpm exec backlog browser",
  "prepare": "husky"
}
```

- [ ] **Step 3: Run full test suite via turbo and verify**

```bash
pnpm test
```

Expected: turbo fans out to both packages. `@centile-grid/ui-kit-mobile` runs 2 passing tests. `@centile-grid/mobile` runs 0 tests (no test files yet). Overall exit code 0.

- [ ] **Step 4: Commit**

```bash
git add turbo.json package.json
git commit -m "feat: add turbo test task and root test script"
```

---

### Task 4: Pre-push hook

**Files:**

- Create: `.husky/pre-push`

- [ ] **Step 1: Create the pre-push hook**

```bash
echo '#!/usr/bin/env sh
pnpm test' > .husky/pre-push
chmod +x .husky/pre-push
```

- [ ] **Step 2: Verify the hook file looks correct**

```bash
cat .husky/pre-push
```

Expected:

```
#!/usr/bin/env sh
pnpm test
```

- [ ] **Step 3: Dry-run the hook manually**

```bash
sh .husky/pre-push
```

Expected: same output as `pnpm test` — all tests pass, exit code 0.

- [ ] **Step 4: Commit**

```bash
git add .husky/pre-push
git commit -m "chore: add pre-push hook to run tests"
```
