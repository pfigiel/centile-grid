import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { BottomSheet } from './BottomSheet';

jest.mock('@gorhom/bottom-sheet', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const MockReact = require('react') as typeof import('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Pressable } = require('react-native') as typeof import('react-native');

  type MockProps = { children: import('react').ReactNode; onDismiss?: () => void };

  const BottomSheetModal = MockReact.forwardRef(
    ({ children, onDismiss }: MockProps, ref: import('react').Ref<unknown>) => {
      const [visible, setVisible] = MockReact.useState(false);
      MockReact.useImperativeHandle(ref, () => ({
        present: () => setVisible(true),
        dismiss: () => setVisible(false),
      }));
      if (!visible) return null;
      return (
        <>
          {children}
          <Pressable testID="dismiss-trigger" onPress={onDismiss} />
        </>
      );
    },
  );
  BottomSheetModal.displayName = 'MockBottomSheetModal';

  return { BottomSheetModal };
});

describe('BottomSheet', () => {
  it('should render children when isOpen is true', () => {
    const { getByText } = render(
      <BottomSheet isOpen={true} onClose={jest.fn()}>
        <Text>Content</Text>
      </BottomSheet>,
    );
    expect(getByText('Content')).toBeTruthy();
  });

  it('should not render children when isOpen is false', () => {
    const { queryByText } = render(
      <BottomSheet isOpen={false} onClose={jest.fn()}>
        <Text>Content</Text>
      </BottomSheet>,
    );
    expect(queryByText('Content')).toBeNull();
  });

  it('should call onClose when dismissed', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <BottomSheet isOpen={true} onClose={onClose}>
        <Text>Content</Text>
      </BottomSheet>,
    );
    fireEvent.press(getByTestId('dismiss-trigger'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
