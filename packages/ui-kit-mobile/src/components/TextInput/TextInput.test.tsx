import { fireEvent, render } from '@testing-library/react-native';
import { ComponentProps } from 'react';
import { PaperProvider } from 'react-native-paper';
import { TextInput } from './TextInput';

describe('TextInput', () => {
  const renderComponent = (props: ComponentProps<typeof TextInput> = {}) =>
    render(
      <PaperProvider>
        <TextInput {...props} />
      </PaperProvider>,
    );

  it('should render label when label prop provided', () => {
    const { getAllByText } = renderComponent({ label: 'Name' });
    expect(getAllByText('Name')).not.toHaveLength(0);
  });

  it('should render value when value prop provided', () => {
    const { getByDisplayValue } = renderComponent({ value: 'John' });
    expect(getByDisplayValue('John')).toBeTruthy();
  });

  it('should call onChangeText when text changes', () => {
    const onChangeText = jest.fn();
    const { getByDisplayValue } = renderComponent({ value: 'initial', onChangeText });
    fireEvent.changeText(getByDisplayValue('initial'), 'updated');
    expect(onChangeText).toHaveBeenCalledWith('updated');
  });
});
