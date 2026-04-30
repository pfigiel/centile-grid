# Pre-commit Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a pre-commit git hook that runs ESLint and Prettier on staged files before every commit.

**Architecture:** husky v9 manages the git hook; lint-staged filters commands to only staged files. The `prepare` npm script auto-installs the hook for all contributors after `npm install`.

**Tech Stack:** husky 9.1.7, lint-staged 16.4.0, ESLint (expo flat config), Prettier

---

### Task 1: Install dependencies and initialize husky

**Files:**

- Modify: `package.json` (devDependencies + prepare script added by husky init)
- Create: `.husky/pre-commit` (created by husky init)

- [ ] **Step 1: Install husky and lint-staged**

```bash
npm install --save-dev husky@9.1.7 lint-staged@16.4.0
```

Expected output: packages added to `node_modules`, `package.json` devDependencies updated.

- [ ] **Step 2: Initialize husky**

```bash
npx husky init
```

Expected: creates `.husky/pre-commit` containing `npm test`, adds `"prepare": "husky"` to `package.json` scripts.

- [ ] **Step 3: Verify .husky/pre-commit was created**

```bash
cat .husky/pre-commit
```

Expected output:

```
npm test
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .husky/pre-commit
git commit -m "chore: install husky and lint-staged"
```

---

### Task 2: Configure the pre-commit hook and lint-staged

**Files:**

- Modify: `.husky/pre-commit` — replace default content with lint-staged invocation
- Modify: `package.json` — add `lint-staged` config block

- [ ] **Step 1: Replace pre-commit hook content**

Overwrite `.husky/pre-commit` with:

```sh
npx lint-staged
```

- [ ] **Step 2: Add lint-staged config to package.json**

In `package.json`, add the following top-level key (e.g. after `"devDependencies"`):

```json
"lint-staged": {
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md}": [
    "prettier --write"
  ]
}
```

- [ ] **Step 3: Verify package.json is valid JSON**

```bash
node -e "require('./package.json')" && echo "valid"
```

Expected: `valid`

- [ ] **Step 4: Commit**

```bash
git add .husky/pre-commit package.json
git commit -m "chore: configure pre-commit hook with lint-staged"
```

---

### Task 3: Verify the hook works end-to-end

**Files:** None modified — this is a verification step only.

- [ ] **Step 1: Create a temporary file with a fixable prettier violation**

```bash
echo 'const x = "hello"' > /tmp/test-hook.ts
cp /tmp/test-hook.ts app/test-hook.ts
```

(Uses double quotes, which `.prettierrc` requires to be single quotes.)

- [ ] **Step 2: Stage the file and attempt a commit**

```bash
git add app/test-hook.ts
git commit -m "test: hook verification"
```

Expected: lint-staged runs, prettier rewrites `app/test-hook.ts` (single quotes), ESLint may flag `no-unused-vars` and block the commit — either outcome confirms the hook fired.

- [ ] **Step 3: Remove the test file and clean up**

```bash
git restore --staged app/test-hook.ts
rm app/test-hook.ts
```
