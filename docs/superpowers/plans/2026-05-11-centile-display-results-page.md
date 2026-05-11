# Centile Display on Results Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a centile label section above the charts on the results screen, showing which centile band each measured value falls into.

**Architecture:** A pure `getCentileLabel` utility accepts a `DataPoint[][]` (7 series in c3→c97 order) plus age and value, returns a label string. The results screen reads `chartData[i].lineSeries.map(ls => ls.data)` from the existing `useChartsData` hook and passes it to the utility. `useChartsData` is not modified.

**Tech Stack:** React Native, TypeScript, react-i18next, Jest, `@centile-grid/ui-kit-mobile` (for `LineSeries` type context only — `DataPoint` is defined locally in the utility)

---

## File Map

| File                                                        | Action | Purpose                                          |
| ----------------------------------------------------------- | ------ | ------------------------------------------------ |
| `apps/mobile/utils/getCentileLabel/getCentileLabel.ts`      | Create | Pure centile label utility                       |
| `apps/mobile/utils/getCentileLabel/getCentileLabel.test.ts` | Create | Unit tests for utility                           |
| `apps/mobile/i18n/locales/en.ts`                            | Modify | Add `results.heightLabel`, `results.weightLabel` |
| `apps/mobile/i18n/locales/pl.ts`                            | Modify | Same keys in Polish                              |
| `apps/mobile/app/results/index.tsx`                         | Modify | Add centile section above charts                 |
| `apps/mobile/app/results/index.test.tsx`                    | Modify | Tests for centile label display                  |

---

## Task 1: `getCentileLabel` utility

**Files:**

- Create: `apps/mobile/utils/getCentileLabel/getCentileLabel.test.ts`
- Create: `apps/mobile/utils/getCentileLabel/getCentileLabel.ts`

- [ ] **Step 1: Write the failing tests**

Create `apps/mobile/utils/getCentileLabel/getCentileLabel.test.ts`:

```ts
import { getCentileLabel } from './getCentileLabel'

type DataPoint = { x: number; y: number }

const makeSeries = (
  age: number,
  centiles: [number, number, number, number, number, number, number],
): DataPoint[][] => centiles.map((y) => [{ x: age, y }])

describe('getCentileLabel', () => {
  const baseSeries = makeSeries(5, [10, 12, 14, 16, 18, 20, 22])

  it('should return exact centile label when value equals centile threshold', () => {
    expect(getCentileLabel(baseSeries, 5, 16)).toBe('c50')
  })

  it('should return c3 when value equals c3 threshold', () => {
    expect(getCentileLabel(baseSeries, 5, 10)).toBe('c3')
  })

  it('should return c97 when value equals c97 threshold', () => {
    expect(getCentileLabel(baseSeries, 5, 22)).toBe('c97')
  })

  it('should return centile range when value falls between two thresholds', () => {
    expect(getCentileLabel(baseSeries, 5, 17)).toBe('c50 - c75')
  })

  it('should return < c3 when value is below c3 threshold', () => {
    expect(getCentileLabel(baseSeries, 5, 9)).toBe('< c3')
  })

  it('should return > c97 when value is above c97 threshold', () => {
    expect(getCentileLabel(baseSeries, 5, 23)).toBe('> c97')
  })

  it('should interpolate centile thresholds when age falls between data points', () => {
    const series: DataPoint[][] = [
      [
        { x: 10, y: 10 },
        { x: 11, y: 10 },
      ], // c3
      [
        { x: 10, y: 12 },
        { x: 11, y: 12 },
      ], // c10
      [
        { x: 10, y: 14 },
        { x: 11, y: 14 },
      ], // c25
      [
        { x: 10, y: 16 },
        { x: 11, y: 18 },
      ], // c50: 17 at age 10.5
      [
        { x: 10, y: 18 },
        { x: 11, y: 20 },
      ], // c75: 19 at age 10.5
      [
        { x: 10, y: 20 },
        { x: 11, y: 20 },
      ], // c90
      [
        { x: 10, y: 22 },
        { x: 11, y: 22 },
      ], // c97
    ]
    expect(getCentileLabel(series, 10.5, 17)).toBe('c50')
  })

  it('should return range based on interpolated thresholds at fractional age', () => {
    const series: DataPoint[][] = [
      [
        { x: 10, y: 10 },
        { x: 11, y: 10 },
      ],
      [
        { x: 10, y: 12 },
        { x: 11, y: 12 },
      ],
      [
        { x: 10, y: 14 },
        { x: 11, y: 14 },
      ],
      [
        { x: 10, y: 16 },
        { x: 11, y: 18 },
      ], // c50: 17 at age 10.5
      [
        { x: 10, y: 18 },
        { x: 11, y: 20 },
      ], // c75: 19 at age 10.5
      [
        { x: 10, y: 20 },
        { x: 11, y: 20 },
      ],
      [
        { x: 10, y: 22 },
        { x: 11, y: 22 },
      ],
    ]
    // value 18 is between interpolated c50=17 and c75=19
    expect(getCentileLabel(series, 10.5, 18)).toBe('c50 - c75')
  })

  it('should return - when age exceeds maximum data point age', () => {
    expect(getCentileLabel(baseSeries, 6, 16)).toBe('-')
  })

  it('should return - when age is below minimum data point age', () => {
    expect(getCentileLabel(baseSeries, 4, 16)).toBe('-')
  })
})
```

- [ ] **Step 2: Run to confirm tests fail**

```bash
pnpm --filter @centile-grid/mobile test -- utils/getCentileLabel/getCentileLabel.test.ts --no-coverage
```

Expected: `Cannot find module './getCentileLabel'`

- [ ] **Step 3: Implement the utility**

Create `apps/mobile/utils/getCentileLabel/getCentileLabel.ts`:

```ts
type DataPoint = { x: number; y: number }

const CENTILE_KEYS = ['c3', 'c10', 'c25', 'c50', 'c75', 'c90', 'c97'] as const

const lerp = (y0: number, y1: number, x0: number, x1: number, x: number): number =>
  y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)

const getValueAtAge = (points: DataPoint[], age: number): number | undefined => {
  const sorted = [...points].sort((a, b) => a.x - b.x)
  if (age < sorted[0].x || age > sorted[sorted.length - 1].x) return undefined

  const ceilIdx = sorted.findIndex((p) => p.x >= age)
  if (sorted[ceilIdx].x === age) return sorted[ceilIdx].y

  const lower = sorted[ceilIdx - 1]
  const upper = sorted[ceilIdx]
  return lerp(lower.y, upper.y, lower.x, upper.x, age)
}

export const getCentileLabel = (series: DataPoint[][], age: number, value: number): string => {
  const values = series.map((s) => getValueAtAge(s, age))
  if (values.some((v) => v === undefined)) return '-'

  const centiles = values as number[]

  if (value < centiles[0]) return '< c3'
  if (value > centiles[6]) return '> c97'

  for (let i = 0; i < CENTILE_KEYS.length; i++) {
    if (value === centiles[i]) return CENTILE_KEYS[i]
    if (i < CENTILE_KEYS.length - 1 && value < centiles[i + 1]) {
      return `${CENTILE_KEYS[i]} - ${CENTILE_KEYS[i + 1]}`
    }
  }

  return 'c97'
}
```

- [ ] **Step 4: Run to confirm all tests pass**

```bash
pnpm --filter @centile-grid/mobile test -- utils/getCentileLabel/getCentileLabel.test.ts --no-coverage
```

Expected: `Tests: 10 passed, 10 total`

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/utils/getCentileLabel/getCentileLabel.ts apps/mobile/utils/getCentileLabel/getCentileLabel.test.ts
git commit -m "feat: add getCentileLabel utility"
```

---

## Task 2: Translations

**Files:**

- Modify: `apps/mobile/i18n/locales/en.ts`
- Modify: `apps/mobile/i18n/locales/pl.ts`

- [ ] **Step 1: Add keys to English translations**

In `apps/mobile/i18n/locales/en.ts`, add to the `results` object:

```ts
results: {
  back: 'Back',
  xLabel: 'Age (years)',
  heightYLabel: 'Height (cm)',
  weightYLabel: 'Weight (kg)',
  heightLabel: 'Height',
  weightLabel: 'Weight',
},
```

- [ ] **Step 2: Add keys to Polish translations**

In `apps/mobile/i18n/locales/pl.ts`, add to the `results` object:

```ts
results: {
  back: 'Wróć',
  xLabel: 'Wiek (lata)',
  heightYLabel: 'Wzrost (cm)',
  weightYLabel: 'Waga (kg)',
  heightLabel: 'Wzrost',
  weightLabel: 'Waga',
},
```

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/i18n/locales/en.ts apps/mobile/i18n/locales/pl.ts
git commit -m "feat: add centile section translation keys"
```

---

## Task 3: Results screen centile section

**Files:**

- Modify: `apps/mobile/app/results/index.test.tsx`
- Modify: `apps/mobile/app/results/index.tsx`

The existing mock in `index.test.tsx` returns one data point:

```ts
const mockDataPoint = {
  age: 5,
  c3: 100,
  c10: 105,
  c25: 110,
  c50: 115,
  c75: 120,
  c90: 125,
  c97: 130,
}
```

At `age=5`, `height=112`: 112 is between c25=110 and c50=115 → label `'c25 - c50'`
At `age=5`, `weight=20`: 20 < c3=100 → label `'< c3'`

- [ ] **Step 1: Write the failing tests**

Add to the `describe('results screen')` block in `apps/mobile/app/results/index.test.tsx`:

```ts
it('should render centile label when height param present', async () => {
  renderScreen('/results?gender=male&age=5&height=112')

  expect(await screen.findByText('c25 - c50')).toBeOnTheScreen()
})

it('should render centile label when weight param present', async () => {
  renderScreen('/results?gender=male&age=5&weight=20')

  expect(await screen.findByText('< c3')).toBeOnTheScreen()
})

it('should render centile labels for both params when both present', async () => {
  renderScreen('/results?gender=male&age=5&height=112&weight=20')

  expect(await screen.findByText('c25 - c50')).toBeOnTheScreen()
  expect(await screen.findByText('< c3')).toBeOnTheScreen()
})
```

- [ ] **Step 2: Run to confirm new tests fail**

```bash
pnpm --filter @centile-grid/mobile test -- app/results/index.test.tsx --no-coverage
```

Expected: 3 existing tests pass, 3 new tests fail with `Unable to find an element with the text`.

- [ ] **Step 3: Update the results screen**

Replace the full contents of `apps/mobile/app/results/index.tsx`:

```tsx
import { getCentileLabel } from '@/utils/getCentileLabel/getCentileLabel'
import useChartsData from '@/hooks/useChartsData'
import { GrowthParameter } from '@/types'
import { LineChart } from '@centile-grid/ui-kit-mobile'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

type Params = {
  gender: string
  age: string
  height?: string
  weight?: string
}

const ResultsScreen = () => {
  const { t } = useTranslation()
  const { gender, age, height, weight } = useLocalSearchParams<Params>()

  const metrics: { parameter: GrowthParameter; value: number }[] = []
  if (height !== undefined) metrics.push({ parameter: 'height', value: Number(height) })
  if (weight !== undefined) metrics.push({ parameter: 'weight', value: Number(weight) })

  const { chartData, isLoading, isError } = useChartsData({
    gender: gender as 'male' | 'female',
    age: Number(age),
    metrics,
  })

  useEffect(() => {
    if (isError) router.replace('/')
  }, [isError])

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text>{t('results.back')}</Text>
      </TouchableOpacity>
      <View style={styles.centileSection}>
        {chartData?.map((data, index) => (
          <View key={index} style={styles.centileRow}>
            <Text>
              {data.parameter === 'height' ? t('results.heightLabel') : t('results.weightLabel')}
            </Text>
            <Text>
              {getCentileLabel(
                data.lineSeries.map((ls) => ls.data),
                Number(age),
                metrics[index].value,
              )}
            </Text>
          </View>
        ))}
      </View>
      {chartData?.map((data, index) => (
        <View key={index} style={styles.chart}>
          <LineChart.Container>
            <LineChart
              lineSeries={data.lineSeries}
              scatterSeries={data.scatterSeries}
              xLabel={t('results.xLabel')}
              yLabel={
                data.parameter === 'height' ? t('results.heightYLabel') : t('results.weightYLabel')
              }
            />
          </LineChart.Container>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexGrow: 1,
    gap: 16,
  },
  backButton: {
    paddingVertical: 8,
  },
  centileSection: {
    gap: 4,
  },
  centileRow: {
    flexDirection: 'row',
    gap: 16,
  },
  chart: {
    height: 300,
  },
})

export default ResultsScreen
```

- [ ] **Step 4: Run all results screen tests**

```bash
pnpm --filter @centile-grid/mobile test -- app/results/index.test.tsx --no-coverage
```

Expected: `Tests: 7 passed, 7 total`

- [ ] **Step 5: Run full test suite to check for regressions**

```bash
pnpm --filter @centile-grid/mobile test --no-coverage
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add apps/mobile/app/results/index.tsx apps/mobile/app/results/index.test.tsx
git commit -m "feat: display centile labels on results screen"
```
