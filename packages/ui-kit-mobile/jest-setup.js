const { setUpTests } = require('react-native-reanimated');

jest.mock('@shopify/react-native-skia', () => ({
  matchFont: () => null,
}));

jest.mock('@gorhom/bottom-sheet', () => {
  const { forwardRef, useImperativeHandle, useState } = require('react');
  const { View, ScrollView } = require('react-native');

  // eslint-disable-next-line react/prop-types
  const BottomSheetModal = forwardRef(({ children, onDismiss }, ref) => {
    const [isPresented, setIsPresented] = useState(false);

    useImperativeHandle(
      ref,
      () => ({
        present: () => setIsPresented(true),
        close: () => {
          setIsPresented(false);
          onDismiss?.();
        },
      }),
      [onDismiss],
    );

    if (!isPresented) {
      return null;
    }

    return <View>{children}</View>;
  });

  BottomSheetModal.displayName = 'BottomSheetModal';

  return {
    BottomSheetModal,
    BottomSheetView: View,
    BottomSheetScrollView: ScrollView,
    // eslint-disable-next-line react/prop-types
    BottomSheetModalProvider: ({ children }) => <>{children}</>,
  };
});

jest.mock('victory-native', () => {
  const { View } = require('react-native');
  return {
    // eslint-disable-next-line react/prop-types
    CartesianChart: ({ children }) => {
      const points = new Proxy({}, { get: () => [] });
      return <View>{children({ points })}</View>;
    },
    Line: () => null,
    Scatter: () => null,
  };
});

setUpTests();
