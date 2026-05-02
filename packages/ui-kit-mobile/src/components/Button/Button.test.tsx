import { fireEvent, render } from '@testing-library/react-native';
import React, { ReactElement } from 'react';
import { PaperProvider } from 'react-native-paper';
import { Button } from './Button';

describe('Button', () => {
  const renderComponent = (ui: ReactElement) => render(<PaperProvider>{ui}</PaperProvider>);

  it('renders children', () => {
    const { getByText } = renderComponent(<Button>Label</Button>);
    expect(getByText('Label')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = renderComponent(<Button onPress={onPress}>Press me</Button>);
    fireEvent.press(getByText('Press me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it.todo('should test variant prop');
});
