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

## `useChartData` Hook

**Location:** `apps/mobile/hooks/useChartData/useChartData.ts`

A thin abstraction over `useGetChartDataQuery` that owns all type mapping and data shaping. The results screen calls it and passes the result directly to `LineChart`.

**Signature:**

```ts
type Props = {
  gender: Gender,
  parameter: GrowthParameter,
  age: number,
  value: number,
}

useChartData({ gender, parameter, age, value }: Props)
```

**Returns:**

```ts
{
  chartData: { lineSeries: LineSeries[], scatterSeries: ScatterSeries } | undefined,
  isLoading: boolean,
  isError: boolean,
}
```

**Mapping logic:**

- Maps `Gender` → `GenderDto` and `GrowthParameter` → `GrowthParameterDto` for the API call (identical values today; abstraction exists for future divergence).
- Transforms `ChartDataPointDto[]` into 7 `LineSeries`, one per centile key (`c3`, `c10`, `c25`, `c50`, `c75`, `c90`, `c97`), where each data point is `{ x: age, y: centileValue }`.
- Builds `ScatterSeries` from the `age` and `value` inputs: `{ data: [{ x: age, y: value }] }`.
- Returns `chartData: undefined` while loading or on error.

## Results Screen (`app/results.tsx`)

**Layout:** back button at the top, charts stacked vertically in a `ScrollView`.

**Behaviour:**

- Determines which metrics to show based on which params are present (`height` param present → show height chart, `weight` param present → show weight chart).
- Calls `useChartData` once per selected metric at the top of the component.
- While any query is loading: shows a loading indicator.
- If any query has `isError: true`: a `useEffect` calls `router.replace('/')` to navigate back to the form. No error UI is shown in this version; error messaging is deferred to a future task.
- Once all queries succeed: renders a `ScrollView` with one labelled `LineChart` per metric.

**Chart labels:**

- Height: `xLabel="Age (years)"`, `yLabel="Height (cm)"`
- Weight: `xLabel="Age (years)"`, `yLabel="Weight (kg)"`

No separate `ChartSection` component; the screen is kept flat.

## Changes to `app/index.tsx`

- Remove `useState<PatientInfo>`.
- Remove the hardcoded `LineChart` rendered after form submission.
- On form submit, call `router.push` with the patient info values serialised as URL params.

## Testing

- **`useChartData`:** unit-tested with `renderHook` + `TestQueryClientProvider`. Verifies DTO→`lineSeries` mapping (correct number of series, correct x/y values) and scatter point construction.
- **Results screen:** integration-tested with MSW handlers. Success path verifies charts render; error path verifies `router.replace('/')` is called.
- **`app/index.tsx`:** tests that submitting the form calls `router.push` with the correct URL params.
