# NestJS Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `apps/backend` — a NestJS TypeScript app with a healthcheck endpoint, local HTTP server, and AWS Lambda handler.

**Architecture:** Standard NestJS app with `AppModule` importing `HealthModule`. Two entrypoints: `main.ts` bootstraps a local Express server; `lambda.ts` wraps the same app with `@codegenie/serverless-express` and caches the instance across warm Lambda invocations.

**Tech Stack:** NestJS v11, TypeScript (strict), `@codegenie/serverless-express`, ts-jest, typescript-eslint (flat config)

---

## File Map

| File                                                | Action | Purpose                                    |
| --------------------------------------------------- | ------ | ------------------------------------------ |
| `apps/backend/package.json`                         | Create | Dependencies and scripts                   |
| `apps/backend/tsconfig.json`                        | Create | Type-checking config (includes decorators) |
| `apps/backend/tsconfig.build.json`                  | Create | Compile config (excludes spec files)       |
| `apps/backend/jest.config.mjs`                      | Create | Jest via ts-jest, node environment         |
| `apps/backend/eslint.config.mjs`                    | Create | Flat ESLint config with typescript-eslint  |
| `apps/backend/main.ts`                              | Create | Local HTTP server entrypoint               |
| `apps/backend/lambda.ts`                            | Create | Lambda handler entrypoint                  |
| `apps/backend/src/app.module.ts`                    | Create | Root NestJS module                         |
| `apps/backend/src/health/health.module.ts`          | Create | Health feature module                      |
| `apps/backend/src/health/health.controller.ts`      | Create | GET /health endpoint                       |
| `apps/backend/src/health/health.controller.spec.ts` | Create | Unit test for HealthController             |
| `.lintstagedrc.json`                                | Modify | Add backend path entry                     |

---

## Task 1: Scaffold package.json and install dependencies

**Files:**

- Create: `apps/backend/package.json`

- [ ] **Step 1: Create `apps/backend/package.json`**

```json
{
  "name": "@centile-grid/backend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "start": "node dist/main.js",
    "start:dev": "ts-node main.ts",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "jest --passWithNoTests",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@codegenie/serverless-express": "^4.0.4",
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.0"
  },
  "devDependencies": {
    "@nestjs/testing": "^11.0.0",
    "@types/aws-lambda": "^8.10.0",
    "@types/jest": "catalog:test",
    "@types/node": "^22.0.0",
    "eslint": "catalog:lint",
    "eslint-config-prettier": "catalog:lint",
    "jest": "catalog:test",
    "ts-jest": "^29.2.0",
    "ts-node": "^10.9.2",
    "typescript": "catalog:",
    "typescript-eslint": "^8.0.0"
  }
}
```

- [ ] **Step 2: Install dependencies from the monorepo root**

```bash
pnpm install
```

Expected: lockfile updated, `apps/backend/node_modules` populated.

- [ ] **Step 3: Commit**

```bash
git add apps/backend/package.json pnpm-lock.yaml
git commit -m "chore(backend): scaffold package.json"
```

---

## Task 2: Configure TypeScript

**Files:**

- Create: `apps/backend/tsconfig.json`
- Create: `apps/backend/tsconfig.build.json`

- [ ] **Step 1: Create `apps/backend/tsconfig.json`**

```json
{
  "compilerOptions": {
    "module": "CommonJS",
    "target": "ES2020",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "outDir": "dist",
    "noEmit": true
  },
  "include": ["src/**/*.ts", "main.ts", "lambda.ts"]
}
```

- [ ] **Step 2: Create `apps/backend/tsconfig.build.json`**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false
  },
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/backend/tsconfig.json apps/backend/tsconfig.build.json
git commit -m "chore(backend): add TypeScript config"
```

---

## Task 3: Configure Jest

**Files:**

- Create: `apps/backend/jest.config.mjs`

- [ ] **Step 1: Create `apps/backend/jest.config.mjs`**

```js
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
};
```

- [ ] **Step 2: Commit**

```bash
git add apps/backend/jest.config.mjs
git commit -m "chore(backend): add Jest config"
```

---

## Task 4: Configure ESLint and lint-staged

**Files:**

- Create: `apps/backend/eslint.config.mjs`
- Modify: `.lintstagedrc.json`

- [ ] **Step 1: Create `apps/backend/eslint.config.mjs`**

```js
import prettierConfig from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(...tseslint.configs.recommended, prettierConfig, {
  ignores: ['dist/*'],
});
```

- [ ] **Step 2: Update `.lintstagedrc.json`**

Add an entry for backend TypeScript files. The final file should be:

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
  "apps/backend/**/*.ts": [
    "eslint --config apps/backend/eslint.config.mjs --fix",
    "prettier --write"
  ],
  "**/*.{json,md}": ["prettier --write"],
  "**/*.{ts,tsx}": ["bash -c 'pnpm typecheck'"]
}
```

- [ ] **Step 3: Verify lint runs without errors**

```bash
cd apps/backend && pnpm lint
```

Expected: no errors (no source files yet, so eslint exits cleanly).

- [ ] **Step 4: Commit**

```bash
git add apps/backend/eslint.config.mjs .lintstagedrc.json
git commit -m "chore(backend): add ESLint config and lint-staged entry"
```

---

## Task 5: Create AppModule

**Files:**

- Create: `apps/backend/src/app.module.ts`

- [ ] **Step 1: Create `apps/backend/src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';

@Module({
  imports: [],
})
export class AppModule {}
```

(HealthModule will be imported in Task 6 after it exists.)

- [ ] **Step 2: Commit**

```bash
git add apps/backend/src/app.module.ts
git commit -m "feat(backend): add AppModule"
```

---

## Task 6: Implement HealthController (TDD)

**Files:**

- Create: `apps/backend/src/health/health.controller.spec.ts`
- Create: `apps/backend/src/health/health.controller.ts`
- Create: `apps/backend/src/health/health.module.ts`
- Modify: `apps/backend/src/app.module.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/backend/src/health/health.controller.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should return ok status when getHealth is called', () => {
    expect(controller.getHealth()).toEqual({ status: 'ok' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/backend && pnpm test
```

Expected: FAIL — `Cannot find module './health.controller'`

- [ ] **Step 3: Implement HealthController**

Create `apps/backend/src/health/health.controller.ts`:

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd apps/backend && pnpm test
```

Expected: PASS — 1 test suite, 1 test

- [ ] **Step 5: Create HealthModule**

Create `apps/backend/src/health/health.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
```

- [ ] **Step 6: Wire HealthModule into AppModule**

Update `apps/backend/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';

@Module({
  imports: [HealthModule],
})
export class AppModule {}
```

- [ ] **Step 7: Run tests again to confirm nothing broke**

```bash
cd apps/backend && pnpm test
```

Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add apps/backend/src/
git commit -m "feat(backend): add HealthController with GET /health endpoint"
```

---

## Task 7: Create local server entrypoint

**Files:**

- Create: `apps/backend/main.ts`

- [ ] **Step 1: Create `apps/backend/main.ts`**

```typescript
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
};

bootstrap();
```

- [ ] **Step 2: Start the local server and verify the healthcheck**

```bash
cd apps/backend && pnpm start:dev
```

In a separate terminal:

```bash
curl http://localhost:3000/health
```

Expected response: `{"status":"ok"}`

Stop the server with `Ctrl+C`.

- [ ] **Step 3: Commit**

```bash
git add apps/backend/main.ts
git commit -m "feat(backend): add local HTTP server entrypoint"
```

---

## Task 8: Create Lambda handler entrypoint

**Files:**

- Create: `apps/backend/lambda.ts`

- [ ] **Step 1: Create `apps/backend/lambda.ts`**

```typescript
import 'reflect-metadata';
import serverlessExpress from '@codegenie/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

let server: Handler;

const bootstrap = async (): Promise<Handler> => {
  const app = await NestFactory.create(AppModule);
  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
};

export const handler: Handler = async (event: unknown, context: Context, callback: Callback) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```bash
cd apps/backend && pnpm typecheck
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add apps/backend/lambda.ts
git commit -m "feat(backend): add Lambda handler entrypoint"
```

---

## Task 9: Final verification

- [ ] **Step 1: Run full turbo test from monorepo root**

```bash
pnpm test
```

Expected: all test suites pass including `@centile-grid/backend`

- [ ] **Step 2: Run full turbo typecheck**

```bash
pnpm typecheck
```

Expected: no TypeScript errors across the monorepo

- [ ] **Step 3: Run full turbo lint**

```bash
pnpm lint
```

Expected: no lint errors

- [ ] **Step 4: Update task status in backlog**

Update `.backlog/tasks/task-10 - Set-up-NestJS-backend.md`: change `status` from `In Progress` to `Done`.

- [ ] **Step 5: Final commit**

```bash
git add ".backlog/tasks/task-10 - Set-up-NestJS-backend.md"
git commit -m "chore: mark task-10 as done"
```
