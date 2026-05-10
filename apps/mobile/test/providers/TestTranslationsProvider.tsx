// apps/mobile/test/providers/TestTranslationsProvider.tsx
import '@/i18n'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n'
import { ReactNode } from 'react'

type Props = { children: ReactNode }

export const TestTranslationsProvider = ({ children }: Props) => (
  <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
)
