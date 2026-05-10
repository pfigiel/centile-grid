import '@/i18n'
import i18n from 'i18next'

process.env.EXPO_PUBLIC_API_BASE_URL = 'http://localhost:3000'

i18n.changeLanguage('en')

jest.mock('@shopify/react-native-skia', () => require('@centile-grid/ui-kit-mobile/mocks').skiaMock)
jest.mock('victory-native', () => require('@centile-grid/ui-kit-mobile/mocks').victoryNativeMock)
jest.mock(
  '@gorhom/bottom-sheet',
  () => require('@centile-grid/ui-kit-mobile/mocks').bottomSheetMock,
)
