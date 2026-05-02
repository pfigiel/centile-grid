import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { render, screen } from '@testing-library/react-native';
import React, { ComponentProps } from 'react';
import { Text } from 'react-native';
import { BottomSheetModal } from './BottomSheetModal';

describe('BottomSheetModal', () => {
  const renderComponent = ({
    children,
    ...props
  }: Partial<ComponentProps<typeof BottomSheetModal>> = {}) =>
    render(
      <BottomSheetModal isOpen={true} onClose={jest.fn()} {...props}>
        {children}
      </BottomSheetModal>,
      { wrapper: BottomSheetModalProvider },
    );

  it('should render children when isOpen is true', async () => {
    const children = <Text>children</Text>;

    renderComponent({ children, isOpen: true });

    expect(await screen.findByText('children')).toBeOnTheScreen();
  });

  it('should not render children when isOpen is false', async () => {
    const children = <Text>children</Text>;

    renderComponent({ children, isOpen: false });

    expect(await screen.queryByText('children')).toBeNull();
  });
});
