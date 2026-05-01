import { ReactNode, useEffect, useRef } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export const BottomSheet = ({ isOpen, onClose, children }: Props) => {
  const ref = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (isOpen) {
      ref.current?.present();
    } else {
      ref.current?.dismiss();
    }
  }, [isOpen]);

  return (
    <BottomSheetModal ref={ref} snapPoints={['50%']} onDismiss={onClose}>
      {children}
    </BottomSheetModal>
  );
};
