import { fireEvent, render } from '@testing-library/react-native';
import React, { ReactElement } from 'react';
import { PaperProvider } from 'react-native-paper';
import { Button } from './Button';

const renderWithProvider = (ui: ReactElement) => render(<PaperProvider>{ui}</PaperProvider>);

describe('Button', () => {
  it('renders children', () => {
    const { getByText } = renderWithProvider(<Button>Label</Button>);
    expect(getByText('Label')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithProvider(<Button onPress={onPress}>Press me</Button>);
    fireEvent.press(getByText('Press me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
