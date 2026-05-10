import '@/i18n'
import { BottomSheetModalProvider } from '@centile-grid/ui-kit-mobile'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

const queryClient = new QueryClient()

const RootLayout = () => (
  <GestureHandlerRootView>
    <QueryClientProvider client={queryClient}>
      <BottomSheetModalProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: styles.content }} />
      </BottomSheetModalProvider>
    </QueryClientProvider>
  </GestureHandlerRootView>
)

const styles = {
  content: {
    paddingBlock: 32,
    paddingInline: 16,
  },
}

export default RootLayout
