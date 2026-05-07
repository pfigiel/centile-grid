# API Integration Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a shared `packages/contract` package with DTO types, wire it into the backend, and build a typed TanStack Query API integration layer in `apps/mobile`.

**Architecture:** A types-only `@centile-grid/contract` package defines the shared API contract (GenderDto, GrowthParameterDto, ChartDataPointDto); both apps import from it. The mobile API layer consists of a fetch-based endpoint function and a TanStack Query hook, organized under `apps/mobile/api/`.

**Tech Stack:** TypeScript (types-only package), TanStack Query (`@tanstack/react-query`), native `fetch`, pnpm workspaces, Expo environment variables.

---

## File Map

**Create:**

- `packages/contract/package.json`
- `packages/contract/tsconfig.json`
- `packages/contract/src/index.ts`
- `apps/mobile/api/endpoints/getChartData/getChartData.ts`
- `apps/mobile/api/endpoints/getChartData/getChartData.test.ts`
- `apps/mobile/api/endpoints/getChartData/index.ts`
- `apps/mobile/api/hooks/queries/useGetChartDataQuery/useGetChartDataQuery.ts`
- `apps/mobile/api/hooks/queries/useGetChartDataQuery/useGetChartDataQuery.test.ts`
- `apps/mobile/api/hooks/queries/useGetChartDataQuery/index.ts`
- `apps/mobile/api/index.ts`

**Modify:**

- `apps/backend/package.json` — add `@centile-grid/contract`
- `apps/backend/src/chart/types.ts` — delete (types move to contract)
- `apps/backend/src/chart/chart.repository.ts` — replace local types with DTO imports
- `apps/backend/src/chart/chart.controller.ts` — update imports
- `apps/backend/src/chart/chart.service.ts` — update imports
- `apps/mobile/package.json` — add `@centile-grid/contract`, `@tanstack/react-query`
- `apps/mobile/tsconfig.json` — add path alias for `@centile-grid/contract`
- `apps/mobile/app/_layout.tsx` — wrap with `QueryClientProvider`
- `apps/mobile/types/index.ts` — change `PatientInfo.gender` to `GenderDto`

---

### Task 1: Create `packages/contract` package

**Files:**

- Create: `packages/contract/package.json`
- Create: `packages/contract/tsconfig.json`
- Create: `packages/contract/src/index.ts`

- [ ] **Step 1: Create `packages/contract/package.json`**

```json
{
  "name": "@centile-grid/contract",
  "version": "0.1.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "catalog:"
  }
}
```

- [ ] **Step 2: Create `packages/contract/tsconfig.json`**

```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true
  },
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 3: Create `packages/contract/src/index.ts`**

```typescript
export type GenderDto = 'male' | 'female';

export type GrowthParameterDto = 'height' | 'weight';

export type ChartDataPointDto = {
  age: number;
  c3: number;
  c10: number;
  c25: number;
  c50: number;
  c75: number;
  c90: number;
  c97: number;
};
```

- [ ] **Step 4: Install workspace dependencies**

Run from repo root:

```bash
pnpm install
```

- [ ] **Step 5: Typecheck the contract package**

```bash
cd packages/contract && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add packages/contract
git commit -m "feat: add @centile-grid/contract package with shared DTO types"
```

---

### Task 2: Wire `@centile-grid/contract` into backend

**Files:**

- Modify: `apps/backend/package.json`
- Delete: `apps/backend/src/chart/types.ts`
- Modify: `apps/backend/src/chart/chart.repository.ts`
- Modify: `apps/backend/src/chart/chart.controller.ts`
- Modify: `apps/backend/src/chart/chart.service.ts`

- [ ] **Step 1: Add contract dependency to `apps/backend/package.json`**

In the `"dependencies"` block, add:

```json
"@centile-grid/contract": "workspace:*"
```

- [ ] **Step 2: Run pnpm install**

```bash
pnpm install
```

- [ ] **Step 3: Delete `apps/backend/src/chart/types.ts`**

```bash
rm apps/backend/src/chart/types.ts
```

- [ ] **Step 4: Update `apps/backend/src/chart/chart.repository.ts`**

Replace the full file content with:

```typescript
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ChartDataPointDto, GenderDto, GrowthParameterDto } from '@centile-grid/contract';

export const GENDERS = ['male', 'female'] satisfies GenderDto[];
export const PARAMETERS = ['height', 'weight'] satisfies GrowthParameterDto[];

export interface IChartRepository {
  findAll(gender: GenderDto, parameter: GrowthParameterDto): ChartDataPointDto[];
}

export const CHART_REPOSITORY = 'CHART_REPOSITORY';

@Injectable()
export class CsvChartRepository implements IChartRepository {
  private readonly cache = new Map<string, ChartDataPointDto[]>();

  constructor() {
    for (const gender of GENDERS) {
      for (const parameter of PARAMETERS) {
        const key = `${gender}_${parameter}`;
        const filePath = path.join(__dirname, '..', 'data', `${key}.csv`);
        const content = fs.readFileSync(filePath, 'utf-8');
        this.cache.set(key, this.parseRows(content));
      }
    }
  }

  findAll(gender: GenderDto, parameter: GrowthParameterDto): ChartDataPointDto[] {
    return this.cache.get(`${gender}_${parameter}`) ?? [];
  }

  private parseRows(csvContent: string): ChartDataPointDto[] {
    const [headerLine, ...dataLines] = csvContent
      .trim()
      .split('\n')
      .filter((l) => l.trim().length > 0);
    const headers = headerLine.split(',').map((h) =>
      h
        .trim()
        .replace(/^age_years$/, 'age')
        .replace(/_(?:cm|kg)$/, ''),
    );

    return dataLines.map((line) => {
      const values = line.split(',').map((v) => parseFloat(v.trim()));
      const get = (name: string) => values[headers.indexOf(name)];
      return {
        age: get('age'),
        c3: get('c3'),
        c10: get('c10'),
        c25: get('c25'),
        c50: get('c50'),
        c75: get('c75'),
        c90: get('c90'),
        c97: get('c97'),
      };
    });
  }
}
```

- [ ] **Step 5: Update `apps/backend/src/chart/chart.controller.ts`**

Replace the full file content with:

```typescript
import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ChartDataPointDto, GenderDto, GrowthParameterDto } from '@centile-grid/contract';
import { GENDERS, PARAMETERS } from './chart.repository';
import { ChartService } from './chart.service';

@Controller('chart')
export class ChartController {
  constructor(private readonly chartService: ChartService) {}

  @Get(':gender/:parameter')
  getChartData(
    @Param('gender') gender: GenderDto,
    @Param('parameter') parameter: GrowthParameterDto,
  ): { data: ChartDataPointDto[] } {
    if (!GENDERS.includes(gender)) {
      throw new NotFoundException();
    }
    if (!PARAMETERS.includes(parameter)) {
      throw new NotFoundException();
    }
    return { data: this.chartService.getChartData(gender, parameter) };
  }
}
```

- [ ] **Step 6: Update `apps/backend/src/chart/chart.service.ts`**

Replace the full file content with:

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { ChartDataPointDto, GenderDto, GrowthParameterDto } from '@centile-grid/contract';
import { CHART_REPOSITORY, IChartRepository } from './chart.repository';

@Injectable()
export class ChartService {
  constructor(@Inject(CHART_REPOSITORY) private readonly repo: IChartRepository) {}

  getChartData(gender: GenderDto, parameter: GrowthParameterDto): ChartDataPointDto[] {
    return this.repo.findAll(gender, parameter);
  }
}
```

- [ ] **Step 7: Run backend tests**

```bash
cd apps/backend && pnpm test
```

Expected: all tests pass.

- [ ] **Step 8: Run backend typecheck**

```bash
cd apps/backend && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add apps/backend
git commit -m "refactor(backend): replace local types with @centile-grid/contract DTOs"
```

---

### Task 3: Add dependencies to mobile and configure path alias

**Files:**

- Modify: `apps/mobile/package.json`
- Modify: `apps/mobile/tsconfig.json`

- [ ] **Step 1: Add dependencies to `apps/mobile/package.json`**

In `"dependencies"`, add:

```json
"@centile-grid/contract": "workspace:*",
"@tanstack/react-query": "5.79.0"
```

- [ ] **Step 2: Run pnpm install**

From repo root:

```bash
pnpm install
```

- [ ] **Step 3: Add path alias in `apps/mobile/tsconfig.json`**

In the `"paths"` object alongside the existing alias, add:

```json
"@centile-grid/contract": ["../../packages/contract/src/index.ts"]
```

The full `paths` object should look like:

```json
"paths": {
  "@/*": ["./*"],
  "@centile-grid/ui-kit-mobile": ["../../packages/ui-kit-mobile/src/index.ts"],
  "@centile-grid/contract": ["../../packages/contract/src/index.ts"]
}
```

- [ ] **Step 4: Typecheck mobile**

```bash
cd apps/mobile && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/package.json apps/mobile/tsconfig.json pnpm-lock.yaml
git commit -m "chore(mobile): add @centile-grid/contract and @tanstack/react-query"
```

---

### Task 4: Wire `QueryClientProvider` in mobile layout

**Files:**

- Modify: `apps/mobile/app/_layout.tsx`

- [ ] **Step 1: Update `apps/mobile/app/_layout.tsx`**

Replace the full file content with:

```typescript
import { BottomSheetModalProvider } from '@centile-grid/ui-kit-mobile';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const queryClient = new QueryClient();

const RootLayout = () => (
  <GestureHandlerRootView>
    <QueryClientProvider client={queryClient}>
      <BottomSheetModalProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: styles.content }} />
      </BottomSheetModalProvider>
    </QueryClientProvider>
  </GestureHandlerRootView>
);

const styles = {
  content: {
    paddingBlock: 32,
    paddingInline: 16,
  },
};

export default RootLayout;
```

- [ ] **Step 2: Typecheck mobile**

```bash
cd apps/mobile && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/app/_layout.tsx
git commit -m "feat(mobile): wire QueryClientProvider in root layout"
```

---

### Task 5: Refactor `PatientInfo.gender` to `GenderDto`

**Files:**

- Modify: `apps/mobile/types/index.ts`

- [ ] **Step 1: Update `apps/mobile/types/index.ts`**

Replace the full file content with:

```typescript
import { GenderDto } from '@centile-grid/contract';

export type PatientInfo = {
  gender?: GenderDto;
  age?: number; // years
  height?: number; // cm
  weight?: number; // kg
};
```

- [ ] **Step 2: Typecheck mobile**

```bash
cd apps/mobile && pnpm typecheck
```

Expected: no errors. If there are errors related to `PatientInfo.gender` usage (e.g., `'MALE'` assigned where `'male'` is expected), find the usages and update them to lowercase values.

- [ ] **Step 3: Run mobile tests**

```bash
cd apps/mobile && pnpm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/types/index.ts
git commit -m "refactor(mobile): use GenderDto for PatientInfo.gender"
```

---

### Task 6: Implement `getChartData` endpoint (TDD)

**Files:**

- Create: `apps/mobile/api/endpoints/getChartData/getChartData.test.ts`
- Create: `apps/mobile/api/endpoints/getChartData/getChartData.ts`
- Create: `apps/mobile/api/endpoints/getChartData/index.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/mobile/api/endpoints/getChartData/getChartData.test.ts`:

```typescript
import { getChartData } from './getChartData';

const mockDataPoint = { age: 1, c3: 70, c10: 72, c25: 74, c50: 76, c75: 78, c90: 80, c97: 82 };

describe('getChartData', () => {
  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockReset();
  });

  it('should return chart data when response is ok', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [mockDataPoint] }),
    } as Response);

    const result = await getChartData('male', 'height');

    expect(fetch).toHaveBeenCalledWith(`${process.env.EXPO_PUBLIC_API_BASE_URL}/chart/male/height`);
    expect(result).toEqual([mockDataPoint]);
  });

  it('should throw when response is not ok', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
    } as Response);

    await expect(getChartData('male', 'height')).rejects.toThrow('Failed to fetch chart data');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/mobile && pnpm test api/endpoints/getChartData/getChartData.test.ts
```

Expected: FAIL — `getChartData` not found.

- [ ] **Step 3: Implement `getChartData`**

Create `apps/mobile/api/endpoints/getChartData/getChartData.ts`:

```typescript
import { ChartDataPointDto, GenderDto, GrowthParameterDto } from '@centile-grid/contract';

export const getChartData = async (
  gender: GenderDto,
  parameter: GrowthParameterDto,
): Promise<ChartDataPointDto[]> => {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_BASE_URL}/chart/${gender}/${parameter}`,
  );
  if (!response.ok) {
    throw new Error('Failed to fetch chart data');
  }
  const { data } = await response.json();
  return data;
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd apps/mobile && pnpm test api/endpoints/getChartData/getChartData.test.ts
```

Expected: PASS — 2 tests passing.

- [ ] **Step 5: Create barrel file**

Create `apps/mobile/api/endpoints/getChartData/index.ts`:

```typescript
export { getChartData } from './getChartData';
```

- [ ] **Step 6: Commit**

```bash
git add apps/mobile/api/endpoints
git commit -m "feat(mobile): add getChartData endpoint"
```

---

### Task 7: Create `api/index.ts`

**Files:**

- Create: `apps/mobile/api/index.ts`

- [ ] **Step 1: Create `apps/mobile/api/index.ts`**

```typescript
import { getChartData } from './endpoints/getChartData';

export const api = {
  chart: getChartData,
};
```

- [ ] **Step 2: Typecheck mobile**

```bash
cd apps/mobile && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/api/index.ts
git commit -m "feat(mobile): add api index export"
```

---

### Task 8: Implement `useGetChartDataQuery` hook (TDD)

**Files:**

- Create: `apps/mobile/api/hooks/queries/useGetChartDataQuery/useGetChartDataQuery.test.ts`
- Create: `apps/mobile/api/hooks/queries/useGetChartDataQuery/useGetChartDataQuery.ts`
- Create: `apps/mobile/api/hooks/queries/useGetChartDataQuery/index.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/mobile/api/hooks/queries/useGetChartDataQuery/useGetChartDataQuery.test.ts`:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { api } from '../../../../index';
import { useGetChartDataQuery } from './useGetChartDataQuery';

jest.mock('../../../../index', () => ({
  api: {
    chart: jest.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockDataPoint = { age: 1, c3: 70, c10: 72, c25: 74, c50: 76, c75: 78, c90: 80, c97: 82 };

describe('useGetChartDataQuery', () => {
  it('should return chart data when query succeeds', async () => {
    (api.chart as jest.Mock).mockResolvedValueOnce([mockDataPoint]);

    const { result } = renderHook(
      () => useGetChartDataQuery('male', 'height'),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([mockDataPoint]);
    expect(api.chart).toHaveBeenCalledWith('male', 'height');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/mobile && pnpm test api/hooks/queries/useGetChartDataQuery/useGetChartDataQuery.test.ts
```

Expected: FAIL — `useGetChartDataQuery` not found.

- [ ] **Step 3: Implement the hook**

Create `apps/mobile/api/hooks/queries/useGetChartDataQuery/useGetChartDataQuery.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { GenderDto, GrowthParameterDto } from '@centile-grid/contract';
import { api } from '../../../../index';

export const useGetChartDataQuery = (gender: GenderDto, parameter: GrowthParameterDto) =>
  useQuery({
    queryKey: ['chart', gender, parameter],
    queryFn: () => api.chart(gender, parameter),
  });
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd apps/mobile && pnpm test api/hooks/queries/useGetChartDataQuery/useGetChartDataQuery.test.ts
```

Expected: PASS — 1 test passing.

- [ ] **Step 5: Create barrel file**

Create `apps/mobile/api/hooks/queries/useGetChartDataQuery/index.ts`:

```typescript
export { useGetChartDataQuery } from './useGetChartDataQuery';
```

- [ ] **Step 6: Run all mobile tests**

```bash
cd apps/mobile && pnpm test
```

Expected: all tests pass.

- [ ] **Step 7: Typecheck mobile**

```bash
cd apps/mobile && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add apps/mobile/api/hooks
git commit -m "feat(mobile): add useGetChartDataQuery hook"
```
