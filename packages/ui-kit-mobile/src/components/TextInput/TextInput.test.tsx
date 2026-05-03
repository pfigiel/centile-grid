import { render, screen, userEvent } from '@testing-library/react-native';
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

  it('should render label when label prop provided', async () => {
    renderComponent({ label: 'Name' });

    expect(await screen.findAllByText('Name')).toHaveLength(2);
  });

  it('should render value when value prop provided', async () => {
    renderComponent({ value: 'John' });

    expect(await screen.findByDisplayValue('John')).toBeOnTheScreen();
  });

  it('should call onChangeText when text changes', async () => {
    const onChangeText = jest.fn();
    renderComponent({ onChangeText });

    await userEvent.type(await screen.findByDisplayValue(''), 'updated');

    expect(onChangeText).toHaveBeenLastCalledWith('updated');
  });

  it('should apply style when style prop provided', async () => {
    renderComponent({ style: { fontSize: 24 } });

    expect(await screen.findByDisplayValue('')).toHaveStyle({ fontSize: 24 });
  });
});
