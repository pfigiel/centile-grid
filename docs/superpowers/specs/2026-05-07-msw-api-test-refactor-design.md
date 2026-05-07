# MSW API Test Refactor — Design Spec

**Date:** 2026-05-07  
**Scope:** `apps/mobile/api/`

## Problem

Current tests in `apps/mobile/api/` mock `fetch` directly via `jest.spyOn` and mock the entire `api` module. This means tests do not exercise the real `getChartData → fetch` call chain. Additionally, `EXPO_PUBLIC_API_BASE_URL` is set and torn down in each test file individually.

## Goal

- Replace all `jest.spyOn(global, 'fetch')` and `jest.mock('../../../index')` with MSW network interception.
- Move `EXPO_PUBLIC_API_BASE_URL` into a global jest setup file.
- Provide typed, reusable handler creators organized by API shape.

---

## 1. Package Setup

Add `msw` to the `test` catalog in `pnpm-workspace.yaml`:

```yaml
catalogs:
  test:
    msw: 2.x
```

Add `msw` to `apps/mobile` devDependencies referencing the catalog entry.

Use `msw/node` (`setupServer`) — React Native Jest tests run in Node, not a browser.

---

## 2. Global Jest Setup

**New file:** `apps/mobile/jest.setup.ts`

```ts
process.env.EXPO_PUBLIC_API_BASE_URL = 'http://localhost:3000';
```

**Update** `apps/mobile/jest.config.mjs`:

```js
export default {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['./jest.setup.ts'],
};
```

No MSW server is initialized here. Each test file owns its own isolated server instance.

---

## 3. Handler Creators

**Location:** `apps/mobile/api/tests/handlers/`

### `chart.ts`

Exports handler creator functions for the `chart` endpoint group:

```ts
import { http, HttpResponse } from 'msw';
import { ChartDataPointDto } from '@centile-grid/contract';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const getChartData = {
  success: (overrides?: { data?: ChartDataPointDto[] }) =>
    http.get(`${BASE_URL}/chart/:gender/:parameter`, () =>
      HttpResponse.json({ data: overrides?.data ?? [] }),
    ),

  error: (overrides?: { status?: number }) =>
    http.get(
      `${BASE_URL}/chart/:gender/:parameter`,
      () => new HttpResponse(null, { status: overrides?.status ?? 500 }),
    ),
};
```

### `index.ts`

Assembles all handler groups into a single typed object mirroring the API shape:

```ts
import * as chart from './chart';

export const handlers = { chart };
```

Usage in tests:

```ts
handlers.chart.getChartData.success({ data: [mockDataPoint] });
handlers.chart.getChartData.error({ status: 404 });
```

---

## 4. Refactored Tests

### `getChartData.test.ts`

- Remove `jest.spyOn(global, 'fetch')` and `process.env` mutation.
- Create a local `server` with `setupServer(handlers.chart.getChartData.success())`.
- `beforeAll(() => server.listen())`, `afterAll(() => server.close())`.
- For the error case, call `server.use(handlers.chart.getChartData.error())` within the test.

### `useGetChartDataQuery.test.tsx`

- Remove `jest.mock('../../../index')`.
- Create a local `server` the same way.
- The real `api → getChartData → fetch` chain runs end-to-end, with MSW intercepting the network call.
- QueryClient setup and Wrapper remain unchanged.

---

## File Changeset

| Action | Path                                                                               |
| ------ | ---------------------------------------------------------------------------------- |
| Edit   | `pnpm-workspace.yaml` — add `msw` to test catalog                                  |
| Edit   | `apps/mobile/package.json` — add `msw` to devDependencies                          |
| Create | `apps/mobile/jest.setup.ts`                                                        |
| Edit   | `apps/mobile/jest.config.mjs`                                                      |
| Create | `apps/mobile/api/tests/handlers/chart.ts`                                          |
| Create | `apps/mobile/api/tests/handlers/index.ts`                                          |
| Edit   | `apps/mobile/api/endpoints/getChartData/getChartData.test.ts`                      |
| Edit   | `apps/mobile/api/hooks/queries/useGetChartDataQuery/useGetChartDataQuery.test.tsx` |
