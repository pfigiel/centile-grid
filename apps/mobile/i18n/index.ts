import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en'
import pl from './locales/pl'

i18n.use(initReactI18next).init({
  lng: 'pl',
  fallbackLng: 'en',
  resources: { en: { translation: en }, pl: { translation: pl } },
  returnNull: false,
})

declare module 'i18next' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface CustomTypeOptions {
    resources: { translation: typeof en }
  }
}

export default i18n
