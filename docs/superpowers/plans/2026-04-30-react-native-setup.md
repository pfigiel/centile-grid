# React Native App Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a minimal Expo + TypeScript + Expo Router app with a single "Hello world" home screen, ESLint/Prettier, npm run scripts, and a README.

**Architecture:** Use `create-expo-app@latest` to generate the TypeScript default template into the existing repo directory, then strip the tab-based boilerplate down to a single root screen. ESLint is included by the Expo template; Prettier is added separately.

**Tech Stack:** Expo SDK (latest), React Native, TypeScript, Expo Router, ESLint (`eslint-config-expo`), Prettier

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Modify | `package.json` | Add `start`/`ios`/`android` scripts; preserve `backlog` script and `backlog.md` dependency |
| Modify | `app/_layout.tsx` | Root Stack layout, no header |
| Create/replace | `app/index.tsx` | Home screen — "Hello world" |
| Create | `.prettierrc` | Prettier config |
| Create | `README.md` | Prerequisites and run instructions |
| Delete | `app/(tabs)/` | Remove tab boilerplate |
| Delete | `app/+not-found.tsx` | Remove unused screen |
| Delete | `components/` | Remove scaffold demo components |
| Delete | `constants/` | Remove scaffold constants |
| Delete | `hooks/` | Remove scaffold hooks |
| Delete | `scripts/` | Remove scaffold scripts |

---

## Task 1: Scaffold Expo app into existing repo

**Files:**
- Modify: `package.json` (overwritten by scaffold, restored in Task 2)
- Create: all Expo template files

- [ ] **Step 1: Run create-expo-app in the current directory**

From `/Users/pfigiel/repos/centile-grid`, run:

```bash
npx create-expo-app@latest . --template default
```

When prompted about overwriting existing files, confirm yes. This generates the full TypeScript + Expo Router template.

- [ ] **Step 2: Verify scaffold succeeded**

```bash
ls app/
```

Expected output includes: `(tabs)/`, `_layout.tsx`, `+not-found.tsx`

- [ ] **Step 3: Commit scaffold baseline**

```bash
git add -A
git commit -m "chore: scaffold Expo TypeScript app"
```

---

## Task 2: Restore backlog tooling to package.json

**Files:**
- Modify: `package.json`

The scaffold overwrote `package.json`, removing the `backlog` script and `backlog.md` dependency. Restore them.

- [ ] **Step 1: Add backlog script and dependency back to package.json**

Open `package.json` and merge in these two fields alongside the existing Expo entries:

In `"scripts"`:
```json
"backlog": "npm exec backlog browser"
```

In `"dependencies"`:
```json
"backlog.md": "1.44.0"
```

- [ ] **Step 2: Install to restore node_modules**

```bash
npm install
```

Expected: `backlog.md` appears in `node_modules/`, no errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: restore backlog tooling after Expo scaffold"
```

---

## Task 3: Add npm run scripts for iOS, Android, and dev server

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add run scripts to package.json**

In `package.json`, ensure the `"scripts"` section contains:

```json
"scripts": {
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "backlog": "npm exec backlog browser"
}
```

(The Expo scaffold may already include `start`, `android`, `ios` — verify and adjust if the names differ.)

- [ ] **Step 2: Verify scripts resolve**

```bash
npm run --list
```

Expected: `start`, `android`, `ios`, and `backlog` all appear.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add npm scripts for iOS, Android, and dev server"
```

---

## Task 4: Strip boilerplate and create minimal home screen

**Files:**
- Delete: `app/(tabs)/`, `app/+not-found.tsx`, `components/`, `constants/`, `hooks/`, `scripts/`
- Modify: `app/_layout.tsx`
- Create/replace: `app/index.tsx`

- [ ] **Step 1: Delete boilerplate directories and files**

```bash
rm -rf app/\(tabs\) app/+not-found.tsx components constants hooks scripts
```

- [ ] **Step 2: Replace app/_layout.tsx with minimal root layout**

```tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

- [ ] **Step 3: Create app/index.tsx with Hello world screen**

```tsx
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>Hello world</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: replace boilerplate with minimal Hello world home screen"
```

---

## Task 5: Configure Prettier

**Files:**
- Create: `.prettierrc`

The Expo scaffold includes ESLint (`eslint-config-expo`) — no ESLint setup needed. Add Prettier.

- [ ] **Step 1: Install prettier**

```bash
npm install --save-dev prettier
```

- [ ] **Step 2: Create .prettierrc**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

- [ ] **Step 3: Verify prettier runs without errors**

```bash
npx prettier --check "app/**/*.tsx"
```

Expected: either "All matched files use Prettier code style!" or a list of files to format. If files need formatting:

```bash
npx prettier --write "app/**/*.tsx"
```

- [ ] **Step 4: Commit**

```bash
git add .prettierrc package.json package-lock.json app/
git commit -m "chore: add Prettier config"
```

---

## Task 6: Add README.md

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create README.md with the following content**

Heading: `# centile-grid`
Subheading: `Child growth chart app for pediatricians and parents.`

Section `## Prerequisites`:
- Node.js LTS (nodejs.org)
- iOS: macOS with Xcode and iOS Simulator configured
- Android: Android Studio with an Android Virtual Device (AVD) configured

Section `## Installation` with code block: `npm install`

Section `## Running the app` with a table:

| Command | Platform |
|---|---|
| `npm start` | Opens Metro bundler — scan QR code with Expo Go on a physical device |
| `npm run ios` | Opens on iOS Simulator |
| `npm run android` | Opens on Android emulator |

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with prerequisites and run instructions"
```

---

## Task 7: Verify the app runs on iOS and Android

This task has no code changes — it is a manual verification gate.

- [ ] **Step 1: Start Metro bundler**

```bash
npm start
```

Expected: Metro bundler starts, QR code displayed, no TypeScript or module errors in the terminal.

- [ ] **Step 2: Run on iOS Simulator**

Press `i` in the Metro terminal (or run `npm run ios` in a new terminal).

Expected: iOS Simulator opens, app launches, "Hello world" text is centered on screen. No red error screen.

- [ ] **Step 3: Run on Android emulator**

Press `a` in the Metro terminal (or run `npm run android` in a new terminal). Ensure an AVD is running in Android Studio first.

Expected: Android emulator shows the app with "Hello world" text centered. No red error screen.

- [ ] **Step 4: Final commit (if any last-minute fixes were made)**

If no fixes were needed, no commit required. If any issues were fixed during verification, commit those fixes before marking this task complete.
