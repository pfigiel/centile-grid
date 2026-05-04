# Chart Library & Component — Design Spec

**Date:** 2026-05-04  
**Task:** TASK-9

---

## Overview

Add a chart library to `ui-kit-mobile` and build a `LineChart` component on top of it. The component renders a 2D line chart with X/Y axes, multiple data series (centile reference lines), and an optional scatter layer for patient-specific measurement points.

---

## Architecture & Setup

### EAS Build (apps/mobile)

Migrating from Expo Go to development builds to support native dependencies.

- Add `expo-dev-client` to `apps/mobile` dependencies
- Add `eas.json` with three profiles: `development`, `preview`, `production`
- Add `eas-cli` as a devDependency in root `package.json`
- Add scripts to `apps/mobile/package.json`:
  - `build:dev:ios` → `eas build --profile development --platform ios`
  - `build:dev:android` → `eas build --profile development --platform android`
- Update `apps/mobile/README.md` to document how to build and run the app using EAS dev builds (replacing the current Expo Go instructions)

### Chart Library (ui-kit-mobile)

Add to `packages/ui-kit-mobile/package.json` dependencies:

- `victory-native` — chart library
- `@shopify/react-native-skia` — Skia renderer required by Victory Native XL

`react-native-reanimated` is already present and requires no changes.

### Component Location

```
packages/ui-kit-mobile/src/components/
└── LineChart/
    ├── LineChart.tsx
    ├── LineChart.test.tsx
    └── index.ts
```

Exported from `packages/ui-kit-mobile/src/index.ts`.

---

## Component API

### Types

```typescript
type DataPoint = {
  x: number; // e.g. age in months — unit is the caller's concern
  y: number; // e.g. height in cm
};

type LineSeries = {
  data: DataPoint[];
  color?: string; // defaults to a built-in palette entry
  label?: string; // e.g. "P50"
};

type ScatterSeries = {
  data: DataPoint[];
  color?: string; // defaults to a built-in highlight color
};

type Props = {
  lineSeries: LineSeries[];
  scatterSeries?: ScatterSeries;
  xLabel?: string;
  yLabel?: string;
  style?: StyleProp<ViewStyle>;
};
```

### Behaviour

- `lineSeries` is required; `scatterSeries` is optional — the chart renders correctly with lines alone.
- When `color` is omitted on a `LineSeries`, the component assigns colors from a predefined palette cycling by index.
- When `color` is omitted on `ScatterSeries`, a single default highlight color is used.
- Internally, the component merges `lineSeries` data into the flat array format required by Victory Native XL's `CartesianChart` (one row per x-value, one y-key per series). This assumes centile reference lines share a common x-range, which is the standard case.
- Patient scatter points are passed to a separate `<Scatter>` layer — no merging with line data.

### Example

```tsx
<LineChart
  lineSeries={[
    { data: p3Data, color: '#aaa', label: 'P3' },
    { data: p15Data, color: '#888', label: 'P15' },
    { data: p50Data, color: '#333', label: 'P50' },
    { data: p85Data, color: '#888', label: 'P85' },
    { data: p97Data, color: '#aaa', label: 'P97' },
  ]}
  scatterSeries={{
    data: patientMeasurements,
    color: '#E53935',
  }}
  xLabel="Age (months)"
  yLabel="Height (cm)"
/>
```

---

## Testing

Victory Native XL renders via Skia — React Native Testing Library cannot inspect canvas paths. Tests focus on observable behaviour.

**Test cases:**

- Renders without error given valid props
- Renders with only `lineSeries` (no `scatterSeries`)
- Renders with both `lineSeries` and `scatterSeries`
- Renders axis labels when `xLabel` / `yLabel` are provided
- Renders correctly when `xLabel` / `yLabel` are omitted

**Mocking:**  
`@shopify/react-native-skia` requires a Jest mock (native bindings unavailable in Node). The mock is added to the Jest config in `packages/ui-kit-mobile`. Tests assert on `View`/`Text` nodes that the component renders, not on chart internals.
