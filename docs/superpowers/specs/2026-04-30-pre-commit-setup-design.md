# Pre-commit Setup Design

**Date:** 2026-04-30  
**Status:** Approved

## Overview

Add a pre-commit hook that runs lint and format checks on staged files only, using husky + lint-staged.

## Dependencies

- `husky` — manages git hooks, auto-installs via `prepare` npm script
- `lint-staged` — runs configured commands against staged files only

## package.json Changes

### Scripts

Add `prepare` script to auto-install husky after `npm install`:

```json
"prepare": "husky"
```

### lint-staged config

```json
"lint-staged": {
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
```

## Git Hook

`.husky/pre-commit` — runs `npx lint-staged` on every commit attempt.

## Behavior

- Only staged files are linted/formatted, keeping runs fast
- ESLint auto-fixes where possible; if unfixable errors remain, the commit is blocked
- Prettier rewrites staged files in place; git will include the formatted version in the commit
- Teammates get hooks automatically after `npm install` via the `prepare` script
