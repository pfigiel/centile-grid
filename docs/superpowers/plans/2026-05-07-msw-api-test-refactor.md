# MSW API Test Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace direct `fetch` and `api` module mocks in `apps/mobile/api/` tests with MSW network interception, and move `EXPO_PUBLIC_API_BASE_URL` setup to a global jest setup file.

**Architecture:** Each test file creates its own isolated MSW server instance via `setupServer` from `msw/node`. Typed handler creators live in `apps/mobile/api/tests/handlers/` organized to mirror the API shape (`handlers.chart.getChartData.success(...)`). The global `jest.setup.ts` sets `EXPO_PUBLIC_API_BASE_URL` once for all tests.

**Tech Stack:** MSW 2.14.3 (`msw/node`), Jest 29, jest-expo, React Native Testing Library

---

## File Map

| Action | Path                                                                               | Responsibility                                    |
| ------ | ---------------------------------------------------------------------------------- | ------------------------------------------------- |
| Edit   | `pnpm-workspace.yaml`                                                              | Add `msw` to `test` catalog                       |
| Edit   | `apps/mobile/package.json`                                                         | Reference `msw` from catalog in devDependencies   |
| Create | `apps/mobile/jest.setup.ts`                                                        | Set `EXPO_PUBLIC_API_BASE_URL` globally           |
| Edit   | `apps/mobile/jest.config.mjs`                                                      | Register `jest.setup.ts` via `setupFilesAfterEnv` |
| Create | `apps/mobile/api/tests/handlers/chart.ts`                                          | Handler creators for chart endpoints              |
| Create | `apps/mobile/api/tests/handlers/index.ts`                                          | Assembles handlers into API-shaped object         |
| Edit   | `apps/mobile/api/endpoints/getChartData/getChartData.test.ts`                      | Use MSW instead of `jest.spyOn(fetch)`            |
| Edit   | `apps/mobile/api/hooks/queries/useGetChartDataQuery/useGetChartDataQuery.test.tsx` | Drop `jest.mock('../../../index')`, use MSW       |

---

### Task 1: Add MSW to workspace and install

**Files:**

- Modify: `pnpm-workspace.yaml`
- Modify: `apps/mobile/package.json`

- [ ] **Step 1: Add msw to pnpm-workspace.yaml test catalog**

In `pnpm-workspace.yaml`, add `msw` to the `test` catalog block:

```yaml
catalogs:
  test:
    '@testing-library/react-native': 13.3.3
    '@types/jest': 29.5.14
    jest: 29.7.0
    jest-expo: 54.0.17
    msw: 2.14.3
    ts-jest: 29.2.0
```

- [ ] **Step 2: Add msw to apps/mobile devDependencies**

In `apps/mobile/package.json`, add to `devDependencies`:

```json
"msw": "catalog:test"
```

- [ ] **Step 3: Install**

```bash
pnpm install
```

Expected: lock file updated, `msw` appears in `apps/mobile/node_modules/msw/`.

- [ ] **Step 4: Commit**

```bash
git add pnpm-workspace.yaml apps/mobile/package.json pnpm-lock.yaml
git commit -m "chore(mobile): add msw to test dependencies"
```

---

### Task 2: Global jest setup — env var and config

**Files:**

- Create: `apps/mobile/jest.setup.ts`
- Modify: `apps/mobile/jest.config.mjs`

- [ ] **Step 1: Create jest.setup.ts**

Create `apps/mobile/jest.setup.ts`:

```ts
process.env.EXPO_PUBLIC_API_BASE_URL = 'http://localhost:3000';
```

- [ ] **Step 2: Register setup file in jest.config.mjs**

Replace the contents of `apps/mobile/jest.config.mjs`:

```js
export default {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['./jest.setup.ts'],
};
```

- [ ] **Step 3: Run existing tests to verify setup doesn't break anything**

```bash
cd apps/mobile && pnpm test
```

Expected: tests pass (same results as before).

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/jest.setup.ts apps/mobile/jest.config.mjs
git commit -m "chore(mobile): add jest setup file with global env var"
```

---

### Task 3: Create handler creators

**Files:**

- Create: `apps/mobile/api/tests/handlers/chart.ts`
- Create: `apps/mobile/api/tests/handlers/index.ts`

- [ ] **Step 1: Create chart handler creators**

Create `apps/mobile/api/tests/handlers/chart.ts`:

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

- [ ] **Step 2: Create handlers index**

Create `apps/mobile/api/tests/handlers/index.ts`:

```ts
import * as chart from './chart';

export const handlers = { chart };
```

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/api/tests/handlers/
git commit -m "feat(mobile): add MSW handler creators for chart endpoint"
```

---

### Task 4: Refactor getChartData.test.ts

**Files:**

- Modify: `apps/mobile/api/endpoints/getChartData/getChartData.test.ts`

- [ ] **Step 1: Replace test file contents**

Replace the entire contents of `apps/mobile/api/endpoints/getChartData/getChartData.test.ts`:

```ts
import { setupServer } from 'msw/node';
import { handlers } from '../../tests/handlers';
import { getChartData } from './getChartData';

const mockDataPoint = { age: 1, c3: 70, c10: 72, c25: 74, c50: 76, c75: 78, c90: 80, c97: 82 };

const server = setupServer(handlers.chart.getChartData.success({ data: [mockDataPoint] }));

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('getChartData', () => {
  it('should return chart data when response is ok', async () => {
    const result = await getChartData('male', 'height');

    expect(result).toEqual([mockDataPoint]);
  });

  it('should throw when response is not ok', async () => {
    server.use(handlers.chart.getChartData.error());

    await expect(getChartData('male', 'height')).rejects.toThrow('Failed to fetch chart data');
  });
});
```

- [ ] **Step 2: Run the test**

```bash
cd apps/mobile && pnpm test api/endpoints/getChartData/getChartData.test.ts
```

Expected: 2 tests pass.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/api/endpoints/getChartData/getChartData.test.ts
git commit -m "refactor(mobile): use MSW in getChartData tests"
```

---

### Task 5: Refactor useGetChartDataQuery.test.tsx

**Files:**

- Modify: `apps/mobile/api/hooks/queries/useGetChartDataQuery/useGetChartDataQuery.test.tsx`

- [ ] **Step 1: Replace test file contents**

Replace the entire contents of `apps/mobile/api/hooks/queries/useGetChartDataQuery/useGetChartDataQuery.test.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { ReactNode } from 'react';
import { setupServer } from 'msw/node';
import { handlers } from '../../../tests/handlers';
import { useGetChartDataQuery } from './useGetChartDataQuery';

const mockDataPoint = { age: 1, c3: 70, c10: 72, c25: 74, c50: 76, c75: 78, c90: 80, c97: 82 };

const server = setupServer(handlers.chart.getChartData.success({ data: [mockDataPoint] }));

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const Wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useGetChartDataQuery', () => {
  afterEach(() => {
    queryClient.clear();
  });

  it('should return chart data when query succeeds', async () => {
    const result = renderHook(() => useGetChartDataQuery('male', 'height'), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([mockDataPoint]);
  });
});
```

- [ ] **Step 2: Run the test**

```bash
cd apps/mobile && pnpm test api/hooks/queries/useGetChartDataQuery/useGetChartDataQuery.test.tsx
```

Expected: 1 test passes.

- [ ] **Step 3: Run the full test suite**

```bash
cd apps/mobile && pnpm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/api/hooks/queries/useGetChartDataQuery/useGetChartDataQuery.test.tsx
git commit -m "refactor(mobile): use MSW in useGetChartDataQuery tests"
```
