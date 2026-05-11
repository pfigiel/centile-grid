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
getCentileLabel(points: ChartDataPointDto[], age: number, value: number): string
```

**Algorithm:**

- Sort points by age
- If age matches a data point exactly: use that point's centile values directly
- If age falls between two points: linear interpolation
- If age is outside the data range: linear extrapolation using the two nearest points
- Compare value against resolved centile thresholds:
  - `value < c3` → `'< c3'`
  - `value > c97` → `'> c97'`
  - `value === centile[key]` → `'c50'` (exact match)
  - `value` between two centiles → `'c50 - c75'` (range)

### 2. `useChartsData` hook

**Change:** Add `points: ChartDataPointDto[]` field to the `ChartData` type and populate it from the raw query result. No other changes.

### 3. Results screen

Reads `chartData[i].points` and calls `getCentileLabel(points, age, value)` for each metric. Renders a centile section above the charts.

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
- Extrapolates when age exceeds maximum data point age
- Extrapolates when age is below minimum data point age

### Results screen tests (`app/results/index.test.tsx`)

- Renders centile label above charts for height param
- Renders centile label above charts for weight param
- Renders centile labels for both params when both present
