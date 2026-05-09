import { setUpTests } from 'react-native-reanimated';

// require must be used due to jest.mock hoisting
/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock('@shopify/react-native-skia', () => require('./src/mocks/skia').skiaMock);
jest.mock('victory-native', () => require('./src/mocks/victoryNative').victoryNativeMock);
jest.mock('@gorhom/bottom-sheet', () => require('./src/mocks/bottomSheet').bottomSheetMock);
/* eslint-enable @typescript-eslint/no-require-imports */

setUpTests();
