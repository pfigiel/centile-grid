# NestJS Backend — Design Spec

**Date:** 2026-05-05
**Status:** Approved

## Overview

Add a new `apps/backend` app to the monorepo: a Node.js backend built with TypeScript and NestJS. Exposes a single healthcheck endpoint. Supports both local HTTP development and AWS Lambda deployment via a cached serverless adapter.

## Project Structure

```
apps/backend/
  src/
    app.module.ts
    health/
      health.controller.ts
      health.controller.spec.ts
      health.module.ts
  main.ts                  # Local HTTP server entrypoint
  lambda.ts                # Lambda handler entrypoint
  tsconfig.json
  tsconfig.build.json
  jest.config.ts
  eslint.config.mjs
  package.json
```

Package name: `@centile-grid/backend`. Picked up automatically by `apps/*` glob in `pnpm-workspace.yaml` and Turborepo.

## Healthcheck Endpoint

`GET /health` → `200 OK` with body `{ "status": "ok" }`. No authentication.

## Dual Entrypoints

**`main.ts`** — local development server:

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

**`lambda.ts`** — AWS Lambda handler using `@codegenie/serverless-express`. The bootstrapped app is cached in the Lambda execution context so warm starts reuse the same instance:

```ts
let server: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule);
  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (event, context, callback) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
```

## Tooling

**TypeScript:** Strict mode. Two configs:

- `tsconfig.json` — type-checking, includes `src/**`
- `tsconfig.build.json` — compilation output, excludes `**/*.spec.ts`

Uses `typescript` from the monorepo catalog.

**ESLint:** Flat config (`eslint.config.mjs`) with `typescript-eslint`, matching existing package patterns.

**Prettier:** Root `.prettierrc` applies — no additional config needed.

**Lint-staged:** Root `.lintstagedrc.json` gets a new entry for `apps/backend/**/*.ts`.

**Jest:** `jest.config.ts` using `ts-jest`. Unit tests only (`*.spec.ts`). Script: `jest --passWithNoTests`. The health controller spec uses `@nestjs/testing`'s `Test.createTestingModule` to instantiate the controller in isolation.

## Testing

Unit test for `HealthController`:

- Instantiate via `Test.createTestingModule`
- Assert `getHealth()` returns `{ status: 'ok' }`

No e2e tests in this iteration.
