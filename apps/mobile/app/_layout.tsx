import { BottomSheetModalProvider } from '@centile-grid/ui-kit-mobile';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const RootLayout = () => (
  <GestureHandlerRootView>
    <BottomSheetModalProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: styles.content }} />
    </BottomSheetModalProvider>
  </GestureHandlerRootView>
);

const styles = {
  content: {
    paddingBlock: 32,
    paddingInline: 16,
  },
};

export default RootLayout;
