import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { Select } from './Select';

jest.mock('@gorhom/bottom-sheet', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const MockReact = require('react') as typeof import('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Pressable, ScrollView } = require('react-native') as typeof import('react-native');

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

  const BottomSheetScrollView = ({ children }: { children: import('react').ReactNode }) =>
    MockReact.createElement(ScrollView, null, children);

  return { BottomSheetModal, BottomSheetScrollView };
});

describe('Select', () => {
  const options = ['Male', 'Female', 'Other'] as const;

  it('should render label', () => {
    const { getByText } = render(<Select options={[...options]} label="Sex" />);
    expect(getByText('Sex')).toBeTruthy();
  });

  it('should render selected value in toggle', () => {
    const { getAllByText } = render(<Select options={[...options]} value="Male" />);
    expect(getAllByText('Male').length).toBeGreaterThan(0);
  });

  it('should render raw string value when renderValue is not provided', () => {
    const { getAllByText } = render(<Select options={[...options]} value="Female" />);
    expect(getAllByText('Female').length).toBeGreaterThan(0);
  });

  it('should use renderValue to render toggle value when provided', () => {
    const { getByText } = render(
      <Select options={[...options]} value="Male" renderValue={(v) => <Text>{`(${v})`}</Text>} />,
    );
    expect(getByText('(Male)')).toBeTruthy();
  });

  it('should open bottom sheet when toggle is pressed', () => {
    const { getByRole, getByText } = render(<Select options={[...options]} label="Sex" />);
    fireEvent.press(getByRole('combobox'));
    expect(getByText('Female')).toBeTruthy();
  });

  it('should render all options in the list', () => {
    const { getByRole, getAllByRole } = render(<Select options={[...options]} />);
    fireEvent.press(getByRole('combobox'));
    expect(getAllByRole('option')).toHaveLength(3);
  });

  it('should use renderValue to render options when provided', () => {
    const { getByRole, getByText } = render(
      <Select options={[...options]} renderValue={(v) => <Text>{`[${v}]`}</Text>} />,
    );
    fireEvent.press(getByRole('combobox'));
    expect(getByText('[Male]')).toBeTruthy();
    expect(getByText('[Female]')).toBeTruthy();
    expect(getByText('[Other]')).toBeTruthy();
  });

  it('should call onSelect when item is pressed', () => {
    const onSelect = jest.fn();
    const { getByRole, getByText } = render(<Select options={[...options]} onSelect={onSelect} />);
    fireEvent.press(getByRole('combobox'));
    fireEvent.press(getByText('Female'));
    expect(onSelect).toHaveBeenCalledWith('Female');
  });

  it('should close bottom sheet when item is selected', () => {
    const { getByRole, getByText, queryByText } = render(<Select options={[...options]} />);
    fireEvent.press(getByRole('combobox'));
    expect(getByText('Other')).toBeTruthy();
    fireEvent.press(getByText('Female'));
    expect(queryByText('Other')).toBeNull();
  });

  it('should mark currently selected item with checkmark', () => {
    const { getByRole, getByText } = render(<Select options={[...options]} value="Male" />);
    fireEvent.press(getByRole('combobox'));
    expect(getByText('✓')).toBeTruthy();
  });
});
