# Display Centile Grid — Design Spec

**Date:** 2026-05-07
**Task:** TASK-13

## Overview

Integrate the mobile app with the backend to display centile charts. After the user submits the patient info form, they are navigated to a results screen showing one chart per selected metric (height and/or weight). Each chart plots the centile reference lines and marks the user's entered measurement as a scatter point.

## Navigation Flow

The app currently has one route: `app/index.tsx`. A second route `app/results.tsx` is added.

1. User fills in the patient info form and submits.
2. `app/index.tsx` calls `router.push('/results?gender=<g>&age=<a>[&height=<h>][&weight=<w>]')` with the submitted values as URL string params.
3. The results screen reads params via `useLocalSearchParams`, parses them, and fetches chart data.
4. A back button at the top of the results screen navigates back to the form.

`app/index.tsx` removes its current `patientInfo` state and hardcoded `LineChart`. The `PatientInfoForm` component itself requires no changes.

## Hook Architecture

Two hooks form a clean two-layer stack.

### `useGetChartsDataQuery` (API layer)

**Location:** `apps/mobile/api/hooks/queries/useGetChartsDataQuery/useGetChartsDataQuery.ts`

Refactored and renamed from `useGetChartDataQuery`. Uses `useQueries` internally to fan out a dynamic array of queries. Knows nothing about the app's chart format — returns raw `ChartDataPointDto[]` results.

```ts
type Query = {
  gender: Gender;
  parameter: GrowthParameter;
};

useGetChartsDataQuery(queries: Query[])
```

Rename the existing test file and `index.ts` export accordingly.

### `useChartsData` (mapping layer)

**Location:** `apps/mobile/hooks/useChartsData/useChartsData.ts`

Thin abstraction over `useGetChartsDataQuery`. Owns all DTO→chart format mapping. The results screen calls this and passes results directly to `LineChart`.

```ts
type Metric = {
  parameter: GrowthParameter;
  value: number;
};

type Props = {
  gender: Gender;
  age: number;
  metrics: Metric[];
};

useChartsData({ gender, age, metrics }: Props)
```

**Returns:** `ChartResult[]` aligned 1:1 with the input `metrics` array, where:

```ts
type ChartResult = {
  chartData: { lineSeries: LineSeries[]; scatterSeries: ScatterSeries } | undefined;
  isLoading: boolean;
  isError: boolean;
};
```

**Mapping logic:**

- Passes `metrics.map(({ parameter }) => ({ gender, parameter }))` to `useGetChartsDataQuery`.
- For each result, transforms `ChartDataPointDto[]` into 7 `LineSeries`, one per centile key (`c3`, `c10`, `c25`, `c50`, `c75`, `c90`, `c97`), where each data point is `{ x: age, y: centileValue }`.
- Builds `ScatterSeries` from the `age` and per-metric `value`: `{ data: [{ x: age, y: value }] }`.
- Returns `chartData: undefined` while loading or on error.

`LineSeries` and `ScatterSeries` must be exported from `packages/ui-kit-mobile`.

## Results Screen (`app/results.tsx`)

**Layout:** back button at the top, charts stacked vertically in a `ScrollView`.

**Behaviour:**

- Determines which metrics to show based on which params are present (`height` param present → show height chart, `weight` param present → show weight chart).
- Calls `useChartsData` once with a `metrics` array built from the present params.
- While any result has `isLoading: true`: shows a loading indicator.
- If any result has `isError: true`: a `useEffect` calls `router.replace('/')` to navigate back to the form. No error UI is shown in this version; error messaging is deferred to a future task.
- Once all results have `chartData` defined: renders a `ScrollView` with one labelled `LineChart` per metric.

**Chart labels:**

- Height: `xLabel="Age (years)"`, `yLabel="Height (cm)"`
- Weight: `xLabel="Age (years)"`, `yLabel="Weight (kg)"`

No separate `ChartSection` component; the screen is kept flat.

## Changes to `app/index.tsx`

- Remove `useState<PatientInfo>`.
- Remove the hardcoded `LineChart` rendered after form submission.
- On form submit, call `router.push` with the patient info values serialised as URL params.

## Testing

- **`useGetChartsDataQuery`:** unit-tested with `renderHook` + `TestQueryClientProvider`. Verifies queries are issued and raw DTO data is returned.
- **`useChartsData`:** unit-tested with `renderHook` + `TestQueryClientProvider`. Verifies DTO→`lineSeries` mapping (correct number of series, correct x/y values) and scatter point construction.
- **Results screen:** integration-tested with MSW handlers. Success path verifies charts render; error path verifies `router.replace('/')` is called.
- **`app/index.tsx`:** tests that submitting the form calls `router.push` with the correct URL params.
