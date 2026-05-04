# Chart Library & LineChart Component — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Victory Native XL to `ui-kit-mobile`, build a `LineChart` component that renders centile reference lines with optional patient scatter points, and set up EAS Build so the app runs as a development build (required by the native Skia module).

**Architecture:** `LineChart` lives in `packages/ui-kit-mobile` alongside existing components. It merges heterogeneous `lineSeries` and `scatterSeries` data into the flat array shape `CartesianChart` requires, renders centile curves via `Line` and patient measurements via `Scatter`, and wraps the chart in plain React Native `View`/`Text` nodes for axis labels. EAS Build configuration lives in `apps/mobile`.

**Tech Stack:** victory-native 41.x, @shopify/react-native-skia 2.x, expo-dev-client, eas-cli

---

## File Map

| File                                                                 | Action | Purpose                                          |
| -------------------------------------------------------------------- | ------ | ------------------------------------------------ |
| `packages/ui-kit-mobile/package.json`                                | Modify | Add victory-native, @shopify/react-native-skia   |
| `packages/ui-kit-mobile/jest.config.mjs`                             | Modify | Add Skia moduleNameMapper for Jest               |
| `packages/ui-kit-mobile/src/components/LineChart/LineChart.tsx`      | Create | LineChart component implementation               |
| `packages/ui-kit-mobile/src/components/LineChart/LineChart.test.tsx` | Create | Component tests                                  |
| `packages/ui-kit-mobile/src/components/LineChart/index.ts`           | Create | Re-export                                        |
| `packages/ui-kit-mobile/src/index.ts`                                | Modify | Export LineChart                                 |
| `package.json` (root)                                                | Modify | Add eas-cli devDependency                        |
| `apps/mobile/package.json`                                           | Modify | Add expo-dev-client + build scripts              |
| `apps/mobile/eas.json`                                               | Create | EAS build profiles                               |
| `apps/mobile/README.md`                                              | Modify | Replace Expo Go instructions with EAS build docs |

---

### Task 1: Install chart library dependencies

**Files:**

- Modify: `packages/ui-kit-mobile/package.json`

- [ ] **Step 1: Add packages**

Run from the repo root:

```bash
pnpm --filter @centile-grid/ui-kit-mobile add victory-native@41.20.2 "@shopify/react-native-skia@2.6.2"
```

Expected: `packages/ui-kit-mobile/package.json` gains two entries in `dependencies`.

- [ ] **Step 2: Verify typecheck**

```bash
pnpm --filter @centile-grid/ui-kit-mobile run typecheck
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add packages/ui-kit-mobile/package.json pnpm-lock.yaml
git commit -m "chore(ui-kit-mobile): add victory-native and react-native-skia"
```

---

### Task 2: Configure Skia Jest mock

`@shopify/react-native-skia` uses native bindings that aren't available in Node. Jest must be told to load its mock module instead.

**Files:**

- Modify: `packages/ui-kit-mobile/jest.config.mjs`

- [ ] **Step 1: Add moduleNameMapper**

Replace the full contents of `packages/ui-kit-mobile/jest.config.mjs`:

```js
export default {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
  moduleNameMapper: {
    '^@shopify/react-native-skia$': '@shopify/react-native-skia/src/mock',
  },
};
```

- [ ] **Step 2: Verify existing tests still pass**

```bash
pnpm --filter @centile-grid/ui-kit-mobile run test
```

Expected: all pre-existing tests pass.

- [ ] **Step 3: Commit**

```bash
git add packages/ui-kit-mobile/jest.config.mjs
git commit -m "test(ui-kit-mobile): add Skia Jest mock"
```

---

### Task 3: Build LineChart component (TDD)

**Files:**

- Create: `packages/ui-kit-mobile/src/components/LineChart/LineChart.test.tsx`
- Create: `packages/ui-kit-mobile/src/components/LineChart/LineChart.tsx`

- [ ] **Step 1: Write the failing tests**

Create `packages/ui-kit-mobile/src/components/LineChart/LineChart.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react-native';
import { LineChart } from './LineChart';

const lineSeries = [
  {
    data: [
      { x: 0, y: 49 },
      { x: 12, y: 75 },
    ],
    color: '#aaa',
    label: 'P3',
  },
  {
    data: [
      { x: 0, y: 50 },
      { x: 12, y: 77 },
    ],
    color: '#333',
    label: 'P50',
  },
];

const scatterSeries = {
  data: [{ x: 6, y: 65 }],
  color: '#e53935',
};

describe('LineChart', () => {
  it('should render without error when given only lineSeries', () => {
    render(<LineChart lineSeries={lineSeries} />);
  });

  it('should render without error when given lineSeries and scatterSeries', () => {
    render(<LineChart lineSeries={lineSeries} scatterSeries={scatterSeries} />);
  });

  it('should display xLabel when xLabel prop is provided', async () => {
    render(<LineChart lineSeries={lineSeries} xLabel="Age (months)" />);

    expect(await screen.findByText('Age (months)')).toBeOnTheScreen();
  });

  it('should not display xLabel when xLabel prop is not provided', () => {
    render(<LineChart lineSeries={lineSeries} />);

    expect(screen.queryByText('Age (months)')).toBeNull();
  });

  it('should display yLabel when yLabel prop is provided', async () => {
    render(<LineChart lineSeries={lineSeries} yLabel="Height (cm)" />);

    expect(await screen.findByText('Height (cm)')).toBeOnTheScreen();
  });

  it('should not display yLabel when yLabel prop is not provided', () => {
    render(<LineChart lineSeries={lineSeries} />);

    expect(screen.queryByText('Height (cm)')).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

```bash
pnpm --filter @centile-grid/ui-kit-mobile run test -- --testPathPattern=LineChart
```

Expected: FAIL — "Cannot find module './LineChart'"

- [ ] **Step 3: Implement LineChart**

Create `packages/ui-kit-mobile/src/components/LineChart/LineChart.tsx`:

```tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { CartesianChart, Line, Scatter } from 'victory-native';

type DataPoint = { x: number; y: number };

type LineSeries = {
  data: DataPoint[];
  color?: string;
  label?: string;
};

type ScatterSeries = {
  data: DataPoint[];
  color?: string;
};

type Props = {
  lineSeries: LineSeries[];
  scatterSeries?: ScatterSeries;
  xLabel?: string;
  yLabel?: string;
  style?: StyleProp<ViewStyle>;
};

const DEFAULT_LINE_COLORS = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'];
const DEFAULT_SCATTER_COLOR = '#e53935';
const SCATTER_Y_KEY = 'scatter';

function buildChartData(lineSeriesInput: LineSeries[], scatterSeries?: ScatterSeries) {
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
}

export const LineChart = ({ lineSeries, scatterSeries, xLabel, yLabel, style }: Props) => {
  const { data, lineYKeys, yKeys } = buildChartData(lineSeries, scatterSeries);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.chartRow}>
        {yLabel !== undefined && <Text style={styles.yLabel}>{yLabel}</Text>}
        <View style={styles.chartArea}>
          <CartesianChart data={data as any} xKey="x" yKeys={yKeys as any}>
            {({ points }: any) => (
              <>
                {lineYKeys.map((key, i) => (
                  <Line
                    key={key}
                    points={points[key]}
                    color={
                      lineSeries[i].color ?? DEFAULT_LINE_COLORS[i % DEFAULT_LINE_COLORS.length]
                    }
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
              </>
            )}
          </CartesianChart>
        </View>
      </View>
      {xLabel !== undefined && <Text style={styles.xLabel}>{xLabel}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chartRow: {
    flex: 1,
    flexDirection: 'row',
  },
  chartArea: {
    flex: 1,
  },
  yLabel: {
    transform: [{ rotate: '-90deg' }],
    alignSelf: 'center',
  },
  xLabel: {
    textAlign: 'center',
    marginTop: 4,
  },
});
```

> Note on null gaps: centile line data and patient scatter data are merged into one flat array. Where a patient measurement's x-value isn't in a centile series, that row has `null` for the centile's y-key. For typical centile data (monthly intervals, 0–17 years ≈ 217 points), patient measurements (5–10 points) create negligible gaps that are visually imperceptible.

- [ ] **Step 4: Run tests — expect pass**

```bash
pnpm --filter @centile-grid/ui-kit-mobile run test -- --testPathPattern=LineChart
```

Expected: 6 tests pass.

- [ ] **Step 5: Run typecheck**

```bash
pnpm --filter @centile-grid/ui-kit-mobile run typecheck
```

Expected: exits 0.

- [ ] **Step 6: Commit**

```bash
git add packages/ui-kit-mobile/src/components/LineChart/
git commit -m "feat(ui-kit-mobile): add LineChart component"
```

---

### Task 4: Export LineChart from ui-kit-mobile

**Files:**

- Create: `packages/ui-kit-mobile/src/components/LineChart/index.ts`
- Modify: `packages/ui-kit-mobile/src/index.ts`

- [ ] **Step 1: Create component barrel**

Create `packages/ui-kit-mobile/src/components/LineChart/index.ts`:

```ts
export { LineChart } from './LineChart';
```

- [ ] **Step 2: Add to package index**

Replace the full contents of `packages/ui-kit-mobile/src/index.ts`:

```ts
export { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
export { BottomSheetModal } from './components/BottomSheetModal';
export { Button } from './components/Button';
export { LineChart } from './components/LineChart';
export { NumberInput } from './components/NumberInput';
export { Select } from './components/Select';
export { TextInput } from './components/TextInput';
```

- [ ] **Step 3: Run full test suite**

```bash
pnpm --filter @centile-grid/ui-kit-mobile run test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add packages/ui-kit-mobile/src/components/LineChart/index.ts \
        packages/ui-kit-mobile/src/index.ts
git commit -m "feat(ui-kit-mobile): export LineChart"
```

---

### Task 5: Set up EAS Build

**Files:**

- Modify: `package.json` (root)
- Modify: `apps/mobile/package.json`
- Create: `apps/mobile/eas.json`

- [ ] **Step 1: Add eas-cli to root devDependencies**

Edit root `package.json` — add `"eas-cli": "18.10.0"` to `devDependencies`:

```json
{
  "devDependencies": {
    "backlog.md": "1.44.0",
    "eas-cli": "18.10.0",
    "husky": "9.1.7",
    "lint-staged": "16.4.0",
    "prettier": "3.8.3",
    "turbo": "2.9.6"
  }
}
```

- [ ] **Step 2: Install expo-dev-client**

```bash
pnpm --filter @centile-grid/mobile add expo-dev-client
```

Expected: `apps/mobile/package.json` gains `expo-dev-client` in `dependencies`.

- [ ] **Step 3: Add build scripts to apps/mobile/package.json**

In `apps/mobile/package.json`, add two scripts alongside the existing ones:

```json
"build:dev:ios": "eas build --profile development --platform ios",
"build:dev:android": "eas build --profile development --platform android"
```

- [ ] **Step 4: Create eas.json**

Create `apps/mobile/eas.json`:

```json
{
  "cli": {
    "version": ">= 18.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

- [ ] **Step 5: Install and verify**

```bash
pnpm install
```

Expected: exits 0, lockfile updated.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml apps/mobile/package.json apps/mobile/eas.json
git commit -m "chore(mobile): set up EAS Build with development profile"
```

---

### Task 6: Update README

**Files:**

- Modify: `apps/mobile/README.md`

- [ ] **Step 1: Replace README**

Replace the full contents of `apps/mobile/README.md`:

````markdown
# @centile-grid/mobile

Expo React Native app for tracking child growth against OLAF+OLA centile charts. Targets pediatricians and parents.

## Prerequisites

- [Node.js](https://nodejs.org/) LTS
- An [Expo account](https://expo.dev/signup) with access to the `centile-grid` project
- `eas-cli` is available as a workspace devDependency after `pnpm install`
- **iOS:** macOS with Xcode and iOS Simulator configured
- **Android:** Android Studio with an Android Virtual Device (AVD) configured

## Installation

Run from the **monorepo root**:

```bash
pnpm install
```

## Development builds

The app uses native modules (`@shopify/react-native-skia`) that are not supported in Expo Go. You must build and install a **development build** before running the app.

### First-time setup

Log in to your Expo account:

```bash
pnpm eas login
```

### Build

| Command                  | Description                              |
| ------------------------ | ---------------------------------------- |
| `pnpm build:dev:ios`     | Build iOS development client via EAS     |
| `pnpm build:dev:android` | Build Android development client via EAS |

After the build completes, install the resulting `.ipa` / `.apk` on your device or simulator via the link EAS provides.

## Running the app

Once the development build is installed:

| Command        | Platform                                               |
| -------------- | ------------------------------------------------------ |
| `pnpm start`   | Opens Metro — connect via the installed dev client app |
| `pnpm ios`     | Opens on iOS Simulator                                 |
| `pnpm android` | Opens on Android emulator                              |
````

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/README.md
git commit -m "docs(mobile): update README for EAS development builds"
```
