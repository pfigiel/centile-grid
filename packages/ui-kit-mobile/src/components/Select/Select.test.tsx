import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { render, screen, userEvent } from '@testing-library/react-native';
import React, { ComponentProps } from 'react';
import { Text } from 'react-native';
import { Select } from './Select';

describe('Select', () => {
  const defaultOptions = ['Male', 'Female', 'Other'];

  const renderComponent = (props: Partial<ComponentProps<typeof Select>> = {}) =>
    render(<Select options={defaultOptions} {...props} />, { wrapper: BottomSheetModalProvider });

  it('should render label', async () => {
    renderComponent({ label: 'Gender' });

    expect(await screen.findByText('Gender')).toBeOnTheScreen();
  });

  it('should render selected value in toggle', async () => {
    renderComponent({ value: 'Male' });

    expect((await screen.findAllByText('Male')).length).toBeGreaterThan(0);
  });

  it('should render raw string value when renderValue is not provided', async () => {
    renderComponent({ value: 'Female' });

    expect(await screen.findByText('Female')).toBeOnTheScreen();
  });

  it('should use renderValue to render toggle value when provided', async () => {
    renderComponent({
      value: 'Male',
      renderValue: (v) => <Text>{`(${v})`}</Text>,
    });

    expect(await screen.findByText('(Male)')).toBeOnTheScreen();
  });

  it('should open bottom sheet when toggle is pressed', async () => {
    renderComponent({
      label: 'Gender',
    });

    await userEvent.press(await screen.findByRole('combobox'));

    expect(await screen.findByText('Female')).toBeOnTheScreen();
  });

  it('should render all options in the list', async () => {
    renderComponent({ options: defaultOptions });

    await userEvent.press(await screen.findByRole('combobox'));

    expect(await screen.findAllByRole('option')).toHaveLength(3);
    expect(await screen.findByText(defaultOptions[0])).toBeOnTheScreen();
    expect(await screen.findByText(defaultOptions[1])).toBeOnTheScreen();
    expect(await screen.findByText(defaultOptions[2])).toBeOnTheScreen();
  });

  it('should use renderValue to render options when provided', async () => {
    renderComponent({
      renderValue: (v) => <Text>{`[${v}]`}</Text>,
    });

    await userEvent.press(await screen.findByRole('combobox'));

    expect(await screen.findByText('[Male]')).toBeOnTheScreen();
    expect(await screen.findByText('[Female]')).toBeOnTheScreen();
    expect(await screen.findByText('[Other]')).toBeOnTheScreen();
  });

  it('should call onSelect when item is pressed', async () => {
    const onSelect = jest.fn();
    renderComponent({
      onSelect,
    });

    await userEvent.press(await screen.findByRole('combobox'));
    await userEvent.press(await screen.findByText('Female'));

    expect(onSelect).toHaveBeenCalledWith('Female');
  });

  it('should close bottom sheet when item is selected', async () => {
    renderComponent();
    await userEvent.press(await screen.findByRole('combobox'));
    expect(await screen.findByText('Other')).toBeOnTheScreen();

    await userEvent.press(await screen.findByText('Female'));

    expect(screen.queryByText('Other')).not.toBeOnTheScreen();
  });

  it('should mark currently selected item with checkmark', async () => {
    renderComponent({
      value: 'Male',
    });

    await userEvent.press(await screen.findByRole('combobox'));

    expect(await screen.findByText('✓')).toBeOnTheScreen();
  });
});
