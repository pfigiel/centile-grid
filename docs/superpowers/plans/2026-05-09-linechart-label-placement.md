# LineChart Label Placement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move X/Y axis labels inside the Skia canvas as corner overlays, and add a `LineChart.Container` shadow-card component.

**Architecture:** Labels are rendered as Skia `Text` primitives using `chartBounds` from the `CartesianChart` render prop. A new `Container` component wraps the chart with a platform-aware drop shadow. `LineChart.Container` is attached as a static member.

**Tech Stack:** React Native, `@shopify/react-native-skia` (`Text`, `matchFont`), `victory-native` (`CartesianChart`, `ChartBounds`), `StyleSheet`.

---

### Task 1: Update mocks — add Skia `Text` and `chartBounds` to `CartesianChart`

Tests query labels via `screen.findByText`. After moving labels into the Skia canvas, `SkiaText` must render something queryable, and `CartesianChart` mock must supply `chartBounds`.

**Files:**

- Modify: `packages/ui-kit-mobile/src/mocks/skia.ts`
- Modify: `packages/ui-kit-mobile/src/mocks/victoryNative.ts`

- [ ] **Step 1: Update skia mock to render `Text` as a testable RN `<Text>`**

Replace the contents of `packages/ui-kit-mobile/src/mocks/skia.ts`:

```ts
import React from 'react';
import { Text } from 'react-native';

export const skiaMock = {
  matchFont: () => null,
  Skia: {},
  Text: ({ text }: { text: string }) => React.createElement(Text, null, text),
};
```

- [ ] **Step 2: Update victoryNative mock to pass `chartBounds` to children**

Replace the contents of `packages/ui-kit-mobile/src/mocks/victoryNative.ts`:

```ts
export const victoryNativeMock = {
  CartesianChart: ({
    children,
  }: {
    children: (args: {
      points: Record<string, unknown[]>;
      chartBounds: { left: number; right: number; top: number; bottom: number };
    }) => unknown;
  }) => {
    const points = new Proxy({} as Record<string, unknown[]>, { get: () => [] });
    const chartBounds = { left: 0, right: 100, top: 0, bottom: 100 };
    return children({ points, chartBounds });
  },
  Line: () => null,
  Scatter: () => null,
};
```

- [ ] **Step 3: Run existing LineChart tests to confirm they still pass**

```bash
cd packages/ui-kit-mobile && npx jest LineChart --no-coverage
```

Expected: all 6 tests pass (labels still render via RN `Text` in production code at this point — this step just validates mocks don't break existing tests).

- [ ] **Step 4: Commit**

```bash
git add packages/ui-kit-mobile/src/mocks/skia.ts packages/ui-kit-mobile/src/mocks/victoryNative.ts
git commit -m "test: update skia and victory-native mocks for canvas label testing"
```

---

### Task 2: Create `Container` component (TDD)

**Files:**

- Create: `packages/ui-kit-mobile/src/components/LineChart/Container.tsx`
- Modify: `packages/ui-kit-mobile/src/components/LineChart/LineChart.test.tsx`

- [ ] **Step 1: Write failing tests for `Container`**

Add to `packages/ui-kit-mobile/src/components/LineChart/LineChart.test.tsx` after the existing `describe('LineChart', ...)` block:

```tsx
import { Container } from './Container';

describe('Container', () => {
  it('should render children', async () => {
    render(
      <Container>
        <Text>content</Text>
      </Container>,
    );

    expect(await screen.findByText('content')).toBeOnTheScreen();
  });

  it('should apply additional style when style prop is provided', async () => {
    render(
      <Container style={{ backgroundColor: 'red' }}>
        <Text>content</Text>
      </Container>,
    );

    expect(await screen.findByText('content')).toBeOnTheScreen();
  });
});
```

Also add `Text` to the imports at the top of the test file:

```tsx
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ComponentProps } from 'react';
import { LineChart } from './LineChart';
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd packages/ui-kit-mobile && npx jest LineChart --no-coverage
```

Expected: FAIL — `Cannot find module './Container'`

- [ ] **Step 3: Implement `Container`**

Create `packages/ui-kit-mobile/src/components/LineChart/Container.tsx`:

```tsx
import { ReactNode } from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const Container = ({ children, style }: Props) => (
  <View style={[styles.container, style]}>{children}</View>
);

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd packages/ui-kit-mobile && npx jest LineChart --no-coverage
```

Expected: all Container tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/ui-kit-mobile/src/components/LineChart/Container.tsx packages/ui-kit-mobile/src/components/LineChart/LineChart.test.tsx
git commit -m "feat: add LineChart.Container shadow card component"
```

---

### Task 3: Move labels inside Skia canvas and attach `LineChart.Container`

**Files:**

- Modify: `packages/ui-kit-mobile/src/components/LineChart/LineChart.tsx`
- Modify: `packages/ui-kit-mobile/src/components/LineChart/LineChart.test.tsx`

- [ ] **Step 1: Update existing label tests**

The existing label tests use `screen.findByText` — they will keep working because the Skia `Text` mock now renders a RN `<Text>`. No test changes are needed for the label assertions themselves.

However, the two "should render without error" tests currently check for `xLabel` visibility as a side assertion. Verify they still pass after the implementation step (Step 3) before committing.

- [ ] **Step 2: Write failing test for `LineChart.Container` being accessible**

Add to the `describe('LineChart', ...)` block in `LineChart.test.tsx`:

```tsx
it('should expose Container as a static member', () => {
  expect(LineChart.Container).toBeDefined();
});
```

Run:

```bash
cd packages/ui-kit-mobile && npx jest LineChart --no-coverage
```

Expected: FAIL — `LineChart.Container` is undefined.

- [ ] **Step 3: Rewrite `LineChart.tsx`**

Replace `packages/ui-kit-mobile/src/components/LineChart/LineChart.tsx` with:

```tsx
import { Text as SkiaText, matchFont } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { CartesianChart, Line, Scatter, type ChartBounds, type PointsArray } from 'victory-native';
import { Container } from './Container';

const FONT_FAMILY = Platform.OS === 'ios' ? 'Helvetica' : 'sans-serif';
const LABEL_PADDING = 6;

export type DataPoint = { x: number; y: number };

export type LineSeries = {
  data: DataPoint[];
  color?: string;
  label?: string;
};

export type ScatterSeries = {
  data: DataPoint[];
  color?: string;
};

export type Props = {
  lineSeries: LineSeries[];
  scatterSeries?: ScatterSeries;
  xLabel?: string;
  yLabel?: string;
  style?: StyleProp<ViewStyle>;
};

const DEFAULT_LINE_COLORS = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'];
const DEFAULT_SCATTER_COLOR = '#e53935';
const SCATTER_Y_KEY = 'scatter';

const buildChartData = (lineSeriesInput: LineSeries[], scatterSeries?: ScatterSeries) => {
  const lineYKeys = lineSeriesInput.map((_, i) => `line_${i}`);
  const yKeys: string[] = [...lineYKeys];

  const xValues = new Set<number>();
  lineSeriesInput.forEach((s) => s.data.forEach((p) => xValues.add(p.x)));
  if (scatterSeries) {
    scatterSeries.data.forEach((p) => xValues.add(p.x));
    yKeys.push(SCATTER_Y_KEY);
  }

  const lineLookups = lineSeriesInput.map((s) => new Map(s.data.map((p) => [p.x, p.y])));
  const scatterLookup = scatterSeries
    ? new Map(scatterSeries.data.map((p) => [p.x, p.y]))
    : new Map<number, number>();

  const data = Array.from(xValues)
    .sort((a, b) => a - b)
    .map((x) => {
      const row: Record<string, number | null> = { x };
      lineYKeys.forEach((key, i) => {
        row[key] = lineLookups[i].get(x) ?? null;
      });
      if (scatterSeries) {
        row[SCATTER_Y_KEY] = scatterLookup.get(x) ?? null;
      }
      return row;
    });

  return { data, lineYKeys, yKeys };
};

export const LineChart = ({ lineSeries, scatterSeries, xLabel, yLabel, style }: Props) => {
  const { data, lineYKeys, yKeys } = buildChartData(lineSeries, scatterSeries);
  const axisFont = useMemo(() => matchFont({ fontFamily: FONT_FAMILY, fontSize: 11 }), []);

  return (
    <View style={[styles.container, style]}>
      <CartesianChart
        data={data}
        xKey={'x' as never}
        yKeys={yKeys}
        xAxis={{ font: axisFont }}
        yAxis={[{ font: axisFont }]}
        frame={{}}
      >
        {({
          points,
          chartBounds,
        }: {
          points: Record<string, PointsArray>;
          chartBounds: ChartBounds;
        }) => (
          <>
            {lineYKeys.map((key, i) => (
              <Line
                key={key}
                points={points[key]}
                color={lineSeries[i].color ?? DEFAULT_LINE_COLORS[i % DEFAULT_LINE_COLORS.length]}
                strokeWidth={1.5}
              />
            ))}
            {scatterSeries !== undefined && (
              <Scatter
                points={points[SCATTER_Y_KEY]}
                color={scatterSeries.color ?? DEFAULT_SCATTER_COLOR}
                radius={4}
              />
            )}
            {yLabel !== undefined && (
              <SkiaText
                x={chartBounds.left + LABEL_PADDING}
                y={chartBounds.top + 11 + LABEL_PADDING}
                text={yLabel}
                font={axisFont}
              />
            )}
            {xLabel !== undefined && (
              <SkiaText
                x={
                  chartBounds.right -
                  (axisFont != null ? axisFont.measureText(xLabel).width : 0) -
                  LABEL_PADDING
                }
                y={chartBounds.bottom - LABEL_PADDING}
                text={xLabel}
                font={axisFont}
              />
            )}
          </>
        )}
      </CartesianChart>
    </View>
  );
};

LineChart.Container = Container;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
  },
});
```

- [ ] **Step 4: Run all LineChart tests**

```bash
cd packages/ui-kit-mobile && npx jest LineChart --no-coverage
```

Expected: all tests pass, including:

- `should display xLabel when xLabel prop is provided`
- `should display yLabel when yLabel prop is provided`
- `should not display xLabel when xLabel prop is not provided`
- `should not display yLabel when yLabel prop is not provided`
- `should expose Container as a static member`

- [ ] **Step 5: Commit**

```bash
git add packages/ui-kit-mobile/src/components/LineChart/LineChart.tsx packages/ui-kit-mobile/src/components/LineChart/LineChart.test.tsx
git commit -m "feat: render axis labels inside Skia canvas and attach LineChart.Container"
```
