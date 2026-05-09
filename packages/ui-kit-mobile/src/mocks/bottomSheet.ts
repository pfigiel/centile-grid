import {
  forwardRef,
  useState,
  useImperativeHandle,
  createElement,
  type Ref,
  type ReactNode,
} from 'react';
import { View, ScrollView } from 'react-native';

const BottomSheetModal = forwardRef(
  (
    { children, onDismiss }: { children: ReactNode; onDismiss?: () => void },
    ref: Ref<{ present: () => void; close: () => void }>,
  ) => {
    const [isPresented, setIsPresented] = useState(false);
    useImperativeHandle(ref, () => ({
      present: () => setIsPresented(true),
      close: () => {
        setIsPresented(false);
        onDismiss?.();
      },
    }));
    if (!isPresented) return null;
    return createElement(View, null, children);
  },
);

BottomSheetModal.displayName = 'BottomSheetModal';

export const bottomSheetMock = {
  BottomSheetModal,
  BottomSheetView: View,
  BottomSheetScrollView: ScrollView,
  BottomSheetModalProvider: ({ children }: { children: ReactNode }) => children,
};
