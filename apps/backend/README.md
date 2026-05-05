# Backend

NestJS REST API for Centile Grid. Runs as a standalone HTTP server locally and deploys as an AWS Lambda function.

## Scripts

| Command          | Description                        |
| ---------------- | ---------------------------------- |
| `pnpm start:dev` | Start dev server with ts-node      |
| `pnpm build`     | Compile TypeScript to `dist/`      |
| `pnpm start`     | Start compiled server from `dist/` |
| `pnpm test`      | Run unit tests                     |
| `pnpm lint`      | Lint source files                  |
| `pnpm typecheck` | Type-check without emitting        |
| `pnpm clean`     | Remove `dist/`                     |

## Environment Variables

| Variable | Default | Description      |
| -------- | ------- | ---------------- |
| `PORT`   | `3000`  | HTTP listen port |

## API

| Method | Path      | Description                                 |
| ------ | --------- | ------------------------------------------- |
| GET    | `/health` | Health check — returns `{ "status": "ok" }` |

## Deployment

The `lambda.ts` entrypoint wraps the NestJS app with [`@codegenie/serverless-express`](https://github.com/CodeGenieApp/serverless-express) for AWS Lambda. Build the project and point your Lambda handler at `dist/lambda.handler`.
