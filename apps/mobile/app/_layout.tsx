import { BottomSheetModalProvider } from '@centile-grid/ui-kit-mobile';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const RootLayout = () => (
  <GestureHandlerRootView>
    <BottomSheetModalProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </BottomSheetModalProvider>
  </GestureHandlerRootView>
);

export default RootLayout;
