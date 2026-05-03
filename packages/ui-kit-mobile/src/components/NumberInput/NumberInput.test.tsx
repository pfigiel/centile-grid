import { fireEvent, render } from '@testing-library/react-native';
import { ComponentProps } from 'react';
import { PaperProvider } from 'react-native-paper';
import { NumberInput } from './NumberInput';

describe('NumberInput', () => {
  const renderComponent = (props: ComponentProps<typeof NumberInput> = {}) =>
    render(
      <PaperProvider>
        <NumberInput {...props} />
      </PaperProvider>,
    );

  it('should render label when label prop provided', () => {
    const { getAllByText } = renderComponent({ label: 'Weight' });
    expect(getAllByText('Weight')).not.toHaveLength(0);
  });

  it('should call onChangeValue with parsed number when text changes', () => {
    const onChangeValue = jest.fn();
    const { getByDisplayValue } = renderComponent({ value: 0, onChangeValue });
    fireEvent.changeText(getByDisplayValue('0'), '72');
    expect(onChangeValue).toHaveBeenCalledWith(72);
  });

  it('should call onChangeValue with undefined when text is cleared', () => {
    const onChangeValue = jest.fn();
    const { getByDisplayValue } = renderComponent({ value: 72, onChangeValue });
    fireEvent.changeText(getByDisplayValue('72'), '');
    expect(onChangeValue).toHaveBeenCalledWith(undefined);
  });

  it('should not strip trailing decimal point when user is typing', () => {
    const onChangeValue = jest.fn();
    const { getByDisplayValue } = renderComponent({ value: 72, onChangeValue });
    fireEvent.changeText(getByDisplayValue('72'), '72.');
    expect(getByDisplayValue('72.')).toBeTruthy();
    expect(onChangeValue).toHaveBeenCalledWith(72);
  });

  it('should update displayed value when value prop changes programmatically', () => {
    const { getByDisplayValue, rerender } = renderComponent({ value: 72 });
    rerender(
      <PaperProvider>
        <NumberInput value={80} />
      </PaperProvider>,
    );
    expect(getByDisplayValue('80')).toBeTruthy();
  });
});
