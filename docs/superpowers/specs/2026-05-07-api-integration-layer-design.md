# API Integration Layer Design

**Date:** 2026-05-07
**Task:** TASK-12 — Set up API integration layer

## Overview

Two parallel changes: (1) a new `packages/contract` package exposing shared DTO types consumed by both apps, and (2) a typed API integration layer in `apps/mobile` built with TanStack Query.

## packages/contract

A types-only package (`@centile-grid/contract`) containing the shared API contract between the backend and mobile. No runtime code — compiles to `.d.ts` only.

**Exported types:**

- `GenderDto = 'male' | 'female'`
- `GrowthParameterDto = 'height' | 'weight'`
- `ChartDataPointDto` — response shape for `GET /chart/:gender/:parameter`: `{ age, c3, c10, c25, c50, c75, c90, c97 }`

Both `apps/backend` and `apps/mobile` add `@centile-grid/contract` as a dependency. The backend's existing local types (`Gender`, `GrowthParameter`, `ChartDataPoint`) are replaced with the DTO equivalents. The mobile form's `PatientInfo.gender` is refactored from `'MALE' | 'FEMALE'` to `GenderDto`.

## Mobile API integration layer

### Directory structure

```
apps/mobile/api/
├── endpoints/
│   └── getChartData/
│       ├── getChartData.ts      # fetch logic
│       └── index.ts             # barrel re-export
├── hooks/
│   └── queries/
│       └── useGetChartDataQuery/
│           ├── useGetChartDataQuery.ts
│           └── index.ts         # barrel re-export
└── index.ts                     # exports { api } object
```

### Endpoint

`getChartData(gender: GenderDto, parameter: GrowthParameterDto): Promise<ChartDataPointDto[]>`

Calls `${EXPO_PUBLIC_API_BASE_URL}/chart/${gender}/${parameter}`. Throws on non-ok HTTP responses.

### TanStack Query

Install `@tanstack/react-query` in `apps/mobile`. Wrap the app root in `QueryClientProvider` inside `app/_layout.tsx`.

`useGetChartDataQuery(gender: GenderDto, parameter: GrowthParameterDto)` calls `useQuery` with:

- fetcher: `api.chart`
- query key: `['chart', gender, parameter]`

### Public API export

```ts
// apps/mobile/api/index.ts
export const api = { chart: getChartData };
```

## Base URL

Configured via Expo environment variable `EXPO_PUBLIC_API_BASE_URL`.
