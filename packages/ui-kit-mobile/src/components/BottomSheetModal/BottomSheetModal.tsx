import { BottomSheetView, BottomSheetModal as GBottomSheetModal } from '@gorhom/bottom-sheet';
import { ReactNode, useEffect, useRef } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export const BottomSheetModal = ({ isOpen, onClose, children }: Props) => {
  const ref = useRef<GBottomSheetModal>(null);

  useEffect(() => {
    if (isOpen) {
      ref.current?.present();
    } else {
      ref.current?.close();
    }
  }, [isOpen]);

  return (
    <GBottomSheetModal
      ref={ref}
      snapPoints={['50%']}
      enableDynamicSizing={false}
      onDismiss={onClose}
    >
      <BottomSheetView>{children}</BottomSheetView>
    </GBottomSheetModal>
  );
};
