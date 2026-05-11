# Centile Display on Results Page

**Date:** 2026-05-11
**Task:** TASK-16

## Summary

Add a centile label section to the results page, rendered above the charts. For each selected parameter, display the centile band the measured value falls into.

## Architecture

Three independent layers with no coupling between them.

### 1. `getCentileLabel` utility

**Location:** `apps/mobile/utils/getCentileLabel/getCentileLabel.ts`

Pure function:

```ts
getCentileLabel(lineSeries: LineSeries[], age: number, value: number): string
```

`lineSeries` is the array already present in `ChartData`. It contains 7 series in fixed order matching `CENTILE_KEYS` (c3 → c97), each with `data: DataPoint[]` where `x = age, y = centile value`.

**Algorithm:**

- For each series, find the data point at the given age or interpolate linearly between the two nearest points
- If age is outside the range of data points in any series: return `'-'`
- Compare value against resolved centile thresholds:
  - `value < c3` → `'< c3'`
  - `value > c97` → `'> c97'`
  - `value === centile[key]` → e.g. `'c50'` (exact match)
  - `value` between two centiles → e.g. `'c50 - c75'` (range)

Note: age-out-of-range should never occur in practice — it will be prevented by form-level validation in the future. The `'-'` fallback is a safety net only.

### 2. `useChartsData` hook

No changes.

### 3. Results screen

Calls `getCentileLabel(chartData[i].lineSeries, age, value)` for each metric. Renders the centile section above the charts.

## UI

Flex column container. Each metric is a flex row with two columns: parameter name (left) and centile label (right).

```
┌──────────┬──────────┐
│ Weight   │ c50 - c75│
│ Height   │ c75      │
└──────────┴──────────┘
```

## Translations

New keys added under `results` in both `en.ts` and `pl.ts`:

```ts
results: {
  heightLabel: 'Height',   // pl: 'Wysokość'
  weightLabel: 'Weight',   // pl: 'Waga'
}
```

Centile strings (`c50`, `c50 - c75`, `< c3`, `> c97`) are technical notation — not localized.

## Testing

### `getCentileLabel` unit tests (`utils/getCentileLabel/getCentileLabel.test.ts`)

- Returns exact centile when value matches threshold
- Returns `c3` when value equals c3 threshold
- Returns `c97` when value equals c97 threshold
- Returns range when value falls between two thresholds
- Returns `< c3` when value is below c3
- Returns `> c97` when value is above c97
- Interpolates thresholds when age falls between data points
- Returns range based on interpolated thresholds at fractional age
- Returns `'-'` when age exceeds maximum data point age
- Returns `'-'` when age is below minimum data point age

### Results screen tests (`app/results/index.test.tsx`)

- Renders centile label above charts for height param
- Renders centile label above charts for weight param
- Renders centile labels for both params when both present
