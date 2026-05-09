# @centile-grid/mobile

Expo React Native app for tracking child growth against OLAF+OLA centile charts. Targets pediatricians and parents.

## Prerequisites

- [Node.js](https://nodejs.org/) LTS
- An [Expo account](https://expo.dev/signup) with access to the `centile-grid` project
- `eas-cli` is available as a workspace devDependency after `pnpm install`
- **iOS:** macOS with Xcode and iOS Simulator configured
- **Android:** Android Studio with an Android Virtual Device (AVD) configured

## Installation

Run from the **monorepo root**:

```bash
pnpm install
```

## Development builds

The app uses native modules (`@shopify/react-native-skia`) that are not supported in Expo Go. You must build and install a **development build** before running the app.

### First-time setup

Log in to your Expo account:

```bash
pnpm eas login
```

### Build

| Command                  | Description                              |
| ------------------------ | ---------------------------------------- |
| `pnpm build:dev:ios`     | Build iOS development client via EAS     |
| `pnpm build:dev:android` | Build Android development client via EAS |

After the build completes, install the resulting `.ipa` / `.apk` on your device or simulator via the link EAS provides.

## Running the app

Before running, install Skia binaries:

```bash
npx install-skia
```

Once the development build is installed:

| Command        | Platform                                               |
| -------------- | ------------------------------------------------------ |
| `pnpm start`   | Opens Metro — connect via the installed dev client app |
| `pnpm ios`     | Opens on iOS Simulator                                 |
| `pnpm android` | Opens on Android emulator                              |
