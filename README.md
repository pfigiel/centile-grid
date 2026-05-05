# Centile Grid

Child growth chart application for pediatricians and parents. Built on TS/React/Node stack.

## Packages

| Path                                                         | Description                           |
| ------------------------------------------------------------ | ------------------------------------- |
| [`apps/backend`](apps/backend/README.md)                     | NestJS REST API (Lambda + HTTP)       |
| [`apps/mobile`](apps/mobile/README.md)                       | Expo React Native app                 |
| [`packages/ui-kit-mobile`](packages/ui-kit-mobile/README.md) | Shared React Native component library |

## Prerequisites

- [Node.js](https://nodejs.org/) LTS
- [pnpm](https://pnpm.io/) (version specified in `package.json#packageManager`)

## Installation

```bash
pnpm install
```

## Scripts

| Command          | Description                    |
| ---------------- | ------------------------------ |
| `pnpm build`     | Build all packages             |
| `pnpm lint`      | Lint all packages              |
| `pnpm typecheck` | Type-check all packages        |
| `pnpm format`    | Format all files with Prettier |

## Tooling

- **Build system:** [Turborepo](https://turbo.build/)
- **Package manager:** [pnpm](https://pnpm.io/) workspaces
- **Framework:** [Expo](https://expo.dev/) (React Native)
