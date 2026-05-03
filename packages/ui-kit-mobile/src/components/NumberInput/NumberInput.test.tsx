import { render, screen, userEvent } from '@testing-library/react-native';
import { ComponentProps } from 'react';
import { PaperProvider } from 'react-native-paper';
import { NumberInput } from './NumberInput';

type Props = ComponentProps<typeof NumberInput>;

describe('NumberInput', () => {
  const getComponent = (props: Props) => <NumberInput {...props} />;

  const renderComponent = (props: Props) => render(getComponent(props), { wrapper: PaperProvider });

  it('should render label when label prop provided', async () => {
    renderComponent({ label: 'Weight' });

    expect(await screen.findAllByText('Weight')).toHaveLength(2);
  });

  it('should call onChangeValue with parsed number when text changes', async () => {
    const onChangeValue = jest.fn();
    renderComponent({ value: 0, onChangeValue });

    const input = await screen.findByDisplayValue('0');
    await userEvent.clear(input);
    await userEvent.type(input, '72');

    expect(onChangeValue).toHaveBeenCalledWith(72);
  });

  it('should call onChangeValue with undefined when text is cleared', async () => {
    const onChangeValue = jest.fn();
    renderComponent({ value: 72, onChangeValue });

    await userEvent.clear(await screen.findByDisplayValue('72'));

    expect(onChangeValue).toHaveBeenCalledWith(undefined);
  });

  it('should not strip trailing decimal point when user is typing', async () => {
    const onChangeValue = jest.fn();
    renderComponent({ value: 72, onChangeValue });

    await userEvent.type(await screen.findByDisplayValue('72'), '.');

    expect(await screen.findByDisplayValue('72.')).toBeOnTheScreen();
    expect(onChangeValue).toHaveBeenCalledWith(72);
  });

  it('should update displayed value when value prop changes programmatically', async () => {
    const { rerender } = renderComponent({ value: 72 });

    rerender(getComponent({ value: 80 }));

    expect(await screen.findByDisplayValue('80')).toBeOnTheScreen();
  });

  it('should apply style when style prop provided', async () => {
    renderComponent({ style: { fontSize: 24 } });

    expect(await screen.findByDisplayValue('')).toHaveStyle({ fontSize: 24 });
  });
});
