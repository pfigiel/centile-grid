import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    const { getByText } = render(<Button>Label</Button>);
    expect(getByText('Label')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button onPress={onPress}>Press me</Button>);
    fireEvent.press(getByText('Press me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
