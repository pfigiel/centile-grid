import { useEffect, useState } from 'react';
import { TextInput } from '../TextInput';

type Props = {
  label?: string;
  value?: number;
  onChangeValue?: (value: number | undefined) => void;
};

export const NumberInput = ({ label, value, onChangeValue }: Props) => {
  const [stringValue, setStringValue] = useState(String(value ?? ''));

  useEffect(() => {
    setStringValue((prev) => {
      if (value === undefined) return prev === '' ? prev : '';
      const parsed = parseFloat(prev);
      if (!Number.isNaN(parsed) && parsed === value) return prev;
      return String(value);
    });
  }, [value]);

  const handleChangeText = (text: string) => {
    setStringValue(text);
    if (text === '') {
      onChangeValue?.(undefined);
    } else {
      const parsed = parseFloat(text);
      if (!Number.isNaN(parsed)) {
        onChangeValue?.(parsed);
      }
    }
  };

  return (
    <TextInput
      label={label}
      value={stringValue}
      onChangeText={handleChangeText}
      keyboardType="decimal-pad"
    />
  );
};
