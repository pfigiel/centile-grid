# React Native App Setup — Design Spec

**Date:** 2026-04-30
**Task:** TASK-1 — Set up React Native app

## Overview

Bootstrap the `centile-grid` React Native app (a child growth chart app for pediatricians and parents) using Expo with TypeScript and Expo Router. The initial app consists of a single home screen displaying "Hello world".

## Toolchain

- **Framework:** Expo (managed workflow) via `npx create-expo-app@latest`
- **Language:** TypeScript (default in the Expo template)
- **Routing:** Expo Router (file-based, ships with the default template)
- **Linting:** ESLint with the official Expo ESLint config
- **Formatting:** Prettier

## Project Structure

```
centile-grid/
├── app/
│   ├── _layout.tsx       # Root layout (Expo Router entry point)
│   └── index.tsx         # Home screen — displays "Hello world"
├── assets/               # Icons, splash screen, fonts
├── app.json              # Expo configuration
├── tsconfig.json         # TypeScript configuration
├── .eslintrc.js          # ESLint configuration
├── .prettierrc           # Prettier configuration
├── README.md             # Prerequisites and run instructions
└── package.json
```

Boilerplate screens (tabs, explore screen, demo components) from the default template are removed, leaving only `_layout.tsx` and `index.tsx`.

## Home Screen

`app/index.tsx` renders a single centered "Hello world" text using React Native's built-in `View` and `Text` components and `StyleSheet`.

## Dev Environment

### Prerequisites

- Node.js (LTS)
- **iOS:** Xcode with iOS Simulator configured (macOS only)
- **Android:** Android Studio with an Android Virtual Device (AVD) configured

All other tooling (Expo, Metro, etc.) is included in the project's `package.json` — no global installs required.

### Run Commands

Exposed as `package.json` scripts:

| Script | Command | Purpose |
|---|---|---|
| `npm start` | `expo start` | Start Metro bundler (scan QR for Expo Go on device) |
| `npm run ios` | `expo start --ios` | Open on iOS Simulator |
| `npm run android` | `expo start --android` | Open on Android emulator |

No native build step required — Expo managed workflow handles native compilation.

## README

A `README.md` at the repo root will document:
- Project description
- Prerequisites (Node.js, Xcode, Android Studio)
- Installation steps (`npm install`)
- Run commands for iOS and Android
