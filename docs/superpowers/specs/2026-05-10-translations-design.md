# Translations Setup Design

**Date:** 2026-05-10  
**Task:** TASK-14  
**Status:** Approved

## Overview

Set up i18n in `apps/mobile` using i18next + react-i18next. All hardcoded UI strings move to a centralized English locale file. Architecture supports runtime language switching for future use.

## File Structure

```
apps/mobile/
  i18n/
    index.ts          # i18next init + TypeScript module augmentation
    locales/
      en.ts           # English strings, nested by component/screen
  test/
    providers/
      TestTranslationsProvider.tsx   # I18nextProvider wrapper for tests
      combineProviders.tsx           # Utility to compose multiple test providers
```

## Dependencies

- `i18next` — core library
- `react-i18next` — React bindings (`useTranslation`, `I18nextProvider`)

## i18next Initialization

`i18n/index.ts` initializes synchronously (local resources, no async needed):

```ts
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

Imported as a side-effect in `app/_layout.tsx`:

```ts
import '@/i18n'
```

## TypeScript Key Safety

Module augmentation on `CustomTypeOptions` ties the type system to the `en.ts` object shape. `t('nonExistentKey')` is a compile error. Adding a new language requires no type changes — only `en.ts` is the source of truth for key types.

Note: `interface` is required here (not `type`) — TypeScript module augmentation only works via declaration merging, which requires `interface`.

## Locale File Structure

Keys nested by component/screen:

```ts
// i18n/locales/en.ts
export default {
  patientInfoForm: {
    title: 'Enter patient data',
    gender: 'Gender',
    boy: 'Boy',
    girl: 'Girl',
    parameters: 'Parameters',
    addParameter: 'Add parameter',
    showGrids: 'Show grids',
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

## Usage in Components

```ts
import { useTranslation } from 'react-i18next'

const { t } = useTranslation()
// <Text>{t('patientInfoForm.title')}</Text>
```

All hardcoded strings in `PatientInfoForm.tsx` and `results/index.tsx` replaced with `t()` calls.

## Testing

### TestTranslationsProvider

Wraps children with `I18nextProvider` using the initialized i18n instance. Uses real English translations — no mocks, so tests assert on actual strings and key typos surface at test time.

```tsx
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n'

export const TestTranslationsProvider = ({ children }: { children: ReactNode }) => (
  <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
)
```

### combineProviders

Composes multiple provider components into a single wrapper. Providers are nested right-to-left (first argument is outermost).

```ts
type Provider = ComponentType<{ children: ReactNode }>

export const combineProviders =
  (...providers: Provider[]) =>
  ({ children }: { children: ReactNode }) =>
    providers.reduceRight<ReactNode>((acc, P) => <P>{acc}</P>, children)
```

Usage:

```ts
wrapper: combineProviders(TestTranslationsProvider, TestQueryClientProvider)
```

## Out of Scope

- Language toggle UI
- Device locale detection
- Pluralization / interpolation (not needed yet, supported by i18next when required)
- Namespace splitting (single `translation` namespace sufficient for current scale)
