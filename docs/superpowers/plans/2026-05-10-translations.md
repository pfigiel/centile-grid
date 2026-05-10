# Translations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up i18next in `apps/mobile` so all hardcoded UI strings are centralized in an English locale file, with runtime language switching supported for the future.

**Architecture:** i18next initialized synchronously via a side-effect import in `_layout.tsx`. TypeScript module augmentation on `CustomTypeOptions` makes `t()` key-safe from the `en.ts` source of truth. Tests use a `TestTranslationsProvider` wrapping `I18nextProvider`, composed with other providers via `combineProviders`.

**Tech Stack:** i18next, react-i18next, pnpm (monorepo)

---

## File Map

| Action | Path                                                         | Responsibility                                  |
| ------ | ------------------------------------------------------------ | ----------------------------------------------- |
| Create | `apps/mobile/i18n/locales/en.ts`                             | All English strings, nested by screen/component |
| Create | `apps/mobile/i18n/index.ts`                                  | i18next init + TypeScript module augmentation   |
| Create | `apps/mobile/test/providers/TestTranslationsProvider.tsx`    | Wraps children with `I18nextProvider` for tests |
| Create | `apps/mobile/test/providers/combineProviders.tsx`            | Composes N providers into one wrapper component |
| Modify | `apps/mobile/app/_layout.tsx`                                | Add `import '@/i18n'` side-effect               |
| Modify | `apps/mobile/components/PatientInfoForm/PatientInfoForm.tsx` | Replace hardcoded strings with `t()`            |
| Modify | `apps/mobile/app/results/index.tsx`                          | Replace hardcoded strings with `t()`            |
| Modify | `apps/mobile/app/index.test.tsx`                             | Add `TestTranslationsProvider` wrapper          |

---

## Task 1: Install dependencies

**Files:**

- Modify: `apps/mobile/package.json`

- [ ] **Step 1: Install i18next and react-i18next**

```bash
pnpm --filter @centile-grid/mobile add i18next react-i18next
```

Expected: packages added, `apps/mobile/package.json` updated with both deps.

---

## Task 2: Create English locale file

**Files:**

- Create: `apps/mobile/i18n/locales/en.ts`

- [ ] **Step 1: Create the locale file**

```ts
// apps/mobile/i18n/locales/en.ts
export default {
  patientInfoForm: {
    title: 'Enter patient data',
    gender: 'Gender',
    boy: 'Boy',
    girl: 'Girl',
    parameters: 'Parameters',
    addParameter: 'Add parameter',
    showGrids: 'Show grids',
    ageOption: 'Age',
    heightOption: 'Height',
    weightOption: 'Weight',
    ageLabel: 'Age [years]',
    heightLabel: 'Height [cm]',
    weightLabel: 'Weight [kg]',
  },
  results: {
    back: 'Back',
    xLabel: 'Age (years)',
    heightYLabel: 'Height (cm)',
    weightYLabel: 'Weight (kg)',
  },
}
```

---

## Task 3: Create i18n init module

**Files:**

- Create: `apps/mobile/i18n/index.ts`

- [ ] **Step 1: Create the init module**

```ts
// apps/mobile/i18n/index.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en'

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources: { en: { translation: en } },
})

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: typeof en }
  }
}

export default i18n
```

Note: `interface` is required here (not `type`) — TypeScript module augmentation only works via declaration merging.

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/i18n/ apps/mobile/package.json pnpm-lock.yaml
git commit -m "feat: add i18next setup with english locale"
```

---

## Task 4: Create TestTranslationsProvider

**Files:**

- Create: `apps/mobile/test/providers/TestTranslationsProvider.tsx`

- [ ] **Step 1: Create the provider**

```tsx
// apps/mobile/test/providers/TestTranslationsProvider.tsx
import '@/i18n'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n'
import { ReactNode } from 'react'

type Props = { children: ReactNode }

export const TestTranslationsProvider = ({ children }: Props) => (
  <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
)
```

---

## Task 5: Create combineProviders utility

**Files:**

- Create: `apps/mobile/test/providers/combineProviders.tsx`

- [ ] **Step 1: Create the utility**

```tsx
// apps/mobile/test/providers/combineProviders.tsx
import { ComponentType, ReactNode } from 'react'

type Provider = ComponentType<{ children: ReactNode }>

export const combineProviders =
  (...providers: Provider[]) =>
  ({ children }: { children: ReactNode }) =>
    providers.reduceRight<ReactNode>((acc, P) => <P>{acc}</P>, children)
```

Usage: `wrapper: combineProviders(TestTranslationsProvider, TestQueryClientProvider)` — first argument is outermost provider.

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/test/providers/TestTranslationsProvider.tsx apps/mobile/test/providers/combineProviders.tsx
git commit -m "feat: add TestTranslationsProvider and combineProviders test utilities"
```

---

## Task 6: Bootstrap i18n in app layout

**Files:**

- Modify: `apps/mobile/app/_layout.tsx`

- [ ] **Step 1: Add i18n side-effect import**

In `apps/mobile/app/_layout.tsx`, add the import at the top (after existing imports):

```ts
import '@/i18n'
```

Full updated import block:

```ts
import '@/i18n'
import { BottomSheetModalProvider } from '@centile-grid/ui-kit-mobile'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/app/_layout.tsx
git commit -m "feat: bootstrap i18n in root layout"
```

---

## Task 7: Migrate PatientInfoForm to translations

**Files:**

- Modify: `apps/mobile/components/PatientInfoForm/PatientInfoForm.tsx`
- Modify: `apps/mobile/app/index.test.tsx`

- [ ] **Step 1: Update PatientInfoForm to use translations**

Replace the entire file content of `apps/mobile/components/PatientInfoForm/PatientInfoForm.tsx`:

```tsx
import { PatientInfo } from '@/types'
import { Button, NumberInput, Select } from '@centile-grid/ui-kit-mobile'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

const parameters = ['AGE', 'HEIGHT', 'WEIGHT'] as const
type Parameter = (typeof parameters)[number]

type ParameterValues = Exclude<PatientInfo, 'gender'>

type FormValues = PatientInfo & {
  selectedParameters: Parameter[]
}

type Props = {
  onSubmit: (values: PatientInfo) => void
}

const parameterToFieldNameMap: Record<Parameter, keyof ParameterValues> = {
  AGE: 'age',
  HEIGHT: 'height',
  WEIGHT: 'weight',
}

export const PatientInfoForm = ({ onSubmit }: Props) => {
  const { t } = useTranslation()
  const form = useForm<FormValues>({ defaultValues: { selectedParameters: ['AGE'] } })

  const { watch, setValue } = form

  const selectedParameters: Parameter[] = watch('selectedParameters')
  const availableParameters = parameters.filter((param) => !selectedParameters.includes(param))

  const parameterToSelectOptionMap: Record<Parameter, string> = {
    AGE: t('patientInfoForm.ageOption'),
    HEIGHT: t('patientInfoForm.heightOption'),
    WEIGHT: t('patientInfoForm.weightOption'),
  }

  const parameterToFieldLabelMap: Record<Parameter, string> = {
    AGE: t('patientInfoForm.ageLabel'),
    HEIGHT: t('patientInfoForm.heightLabel'),
    WEIGHT: t('patientInfoForm.weightLabel'),
  }

  return (
    <View style={styles.container}>
      <FormProvider {...form}>
        <View style={styles.inputsContainer}>
          <Text style={styles.title}>{t('patientInfoForm.title')}</Text>
          <View>
            <Text style={styles.sectionLabel}>{t('patientInfoForm.gender')}</Text>
            <View style={styles.genderSelector}>
              <Controller<FormValues>
                name="gender"
                render={({ field }) => (
                  <>
                    <Button
                      style={styles.genderSelectorButton}
                      variant={field.value === 'male' ? 'primary' : 'secondary'}
                      onPress={() => field.onChange('male')}
                    >
                      {t('patientInfoForm.boy')}
                    </Button>
                    <Button
                      style={styles.genderSelectorButton}
                      variant={field.value === 'female' ? 'primary' : 'secondary'}
                      onPress={() => field.onChange('female')}
                    >
                      {t('patientInfoForm.girl')}
                    </Button>
                  </>
                )}
              />
            </View>
          </View>
          {selectedParameters.length > 0 && (
            <View>
              <Text style={styles.sectionLabel}>{t('patientInfoForm.parameters')}</Text>
              <View style={styles.paramRows}>
                {selectedParameters.map((param) => (
                  <View style={styles.paramRow} key={param}>
                    <Controller<FormValues>
                      name={parameterToFieldNameMap[param]}
                      render={({ field }) => (
                        <NumberInput
                          style={styles.paramInput}
                          label={parameterToFieldLabelMap[param]}
                          value={field.value}
                          onChangeValue={field.onChange}
                        />
                      )}
                    />
                    {param !== 'AGE' && (
                      <Button
                        style={styles.deleteParamButton}
                        styles={{
                          content: styles.deleteParamButtonContent,
                          label: styles.deleteParamButtonLabel,
                        }}
                        onPress={() =>
                          setValue(
                            'selectedParameters',
                            selectedParameters.filter((selectedParam) => selectedParam !== param),
                          )
                        }
                      >
                        X
                      </Button>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}
          <Controller<FormValues, 'selectedParameters'>
            name="selectedParameters"
            render={({ field }) => (
              <Select
                disabled={availableParameters.length === 0}
                label={t('patientInfoForm.addParameter')}
                options={availableParameters}
                onSelect={(value) => field.onChange([...field.value, value])}
                renderValue={(value) => parameterToSelectOptionMap[value]}
              />
            )}
          />
        </View>
        <Button onPress={form.handleSubmit(onSubmit)}>{t('patientInfoForm.showGrids')}</Button>
      </FormProvider>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
  },
  inputsContainer: {
    gap: 32,
  },
  title: {
    fontSize: 24,
  },
  sectionLabel: {
    marginBottom: 8,
  },
  genderSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  genderSelectorButton: {
    flex: 1,
  },
  paramRows: {
    flexDirection: 'column',
    gap: 16,
  },
  paramRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  paramInput: {
    flex: 1,
  },
  deleteParamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    minWidth: 0,
    height: 56,
  },
  deleteParamButtonContent: {
    minWidth: 0,
    paddingHorizontal: 0,
  },
  deleteParamButtonLabel: {
    marginHorizontal: 0,
    marginVertical: 0,
  },
})
```

- [ ] **Step 2: Run existing tests — expect failure**

```bash
cd apps/mobile && pnpm test app/index.test.tsx
```

Expected: tests fail because `useTranslation` has no i18n context.

- [ ] **Step 3: Update index.test.tsx to use TestTranslationsProvider**

Replace the entire file content of `apps/mobile/app/index.test.tsx`:

```tsx
import { TestTranslationsProvider } from '@/test/providers/TestTranslationsProvider'
import { userEvent } from '@testing-library/react-native'
import { renderRouter, screen, waitFor } from 'expo-router/testing-library'

const renderScreen = () =>
  renderRouter(
    { index: require('./index').default, results: () => null },
    { initialUrl: '/', wrapper: TestTranslationsProvider },
  )

describe('home screen', () => {
  it('should navigate to results with multiple params when form submitted with multiple parameters', async () => {
    const result = renderScreen()

    await userEvent.press(await screen.findByText('Boy'))
    const [ageInput] = await screen.findAllByTestId('text-input-flat')
    await userEvent.type(ageInput, '5')
    await userEvent.press(await screen.findByText('Add parameter'))
    await userEvent.press(await screen.findByText('Height'))
    const [, heightInput] = await screen.findAllByTestId('text-input-flat')
    await userEvent.type(heightInput, '112')
    await userEvent.press(await screen.findByText('Add parameter'))
    await userEvent.press(await screen.findByText('Weight'))
    const [, , weightInput] = await screen.findAllByTestId('text-input-flat')
    await userEvent.type(weightInput, '14')
    await userEvent.press(await screen.findByText('Show grids'))

    await waitFor(() => expect(result.getPathname()).toBe('/results'))
    const params = result.getSearchParams()
    expect(params.gender).toBe('male')
    expect(params.age).toBe('5')
    expect(params.height).toBe('112')
    expect(params.weight).toBe('14')
  })

  it('should navigate to results with single param when form submitted with one parameter', async () => {
    const result = renderScreen()

    await userEvent.press(await screen.findByText('Girl'))
    const [ageInput] = await screen.findAllByTestId('text-input-flat')
    await userEvent.type(ageInput, '3')
    await userEvent.press(await screen.findByText('Add parameter'))
    await userEvent.press(await screen.findByText('Weight'))
    const [, weightInput] = await screen.findAllByTestId('text-input-flat')
    await userEvent.type(weightInput, '14')
    await userEvent.press(await screen.findByText('Show grids'))

    await waitFor(() => expect(result.getPathname()).toBe('/results'))
    const params = result.getSearchParams()
    expect(params.gender).toBe('female')
    expect(params.age).toBe('3')
    expect(params.weight).toBe('14')
    expect(params.height).toBeUndefined()
  })
})
```

- [ ] **Step 4: Run tests — expect pass**

```bash
cd apps/mobile && pnpm test app/index.test.tsx
```

Expected: both tests PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/components/PatientInfoForm/PatientInfoForm.tsx apps/mobile/app/index.test.tsx
git commit -m "feat: migrate PatientInfoForm to translations"
```

---

## Task 8: Migrate results screen to translations

**Files:**

- Modify: `apps/mobile/app/results/index.tsx`

- [ ] **Step 1: Update results screen to use translations**

Replace the entire file content of `apps/mobile/app/results/index.tsx`:

```tsx
import { useChartsData } from '@/hooks/useChartsData'
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

  if (height !== undefined) {
    metrics.push({ parameter: 'height', value: Number(height) })
  }
  if (weight !== undefined) {
    metrics.push({ parameter: 'weight', value: Number(weight) })
  }

  const { chartData, isLoading, isError } = useChartsData({
    gender: gender as 'male' | 'female',
    age: Number(age),
    metrics,
  })

  useEffect(() => {
    if (isError) {
      router.replace('/')
    }
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
  chart: {
    height: 300,
  },
})

export default ResultsScreen
```

- [ ] **Step 2: Run all tests**

```bash
cd apps/mobile && pnpm test
```

Expected: all tests PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/app/results/index.tsx
git commit -m "feat: migrate results screen to translations"
```
