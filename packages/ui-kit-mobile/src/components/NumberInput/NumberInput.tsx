import { useEffect, useState } from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { TextInput } from '../TextInput';

type Props = {
  style?: StyleProp<TextStyle>;
  label?: string;
  value?: string | string[] | number;
  onChangeValue?: (value: number | undefined) => void;
};

export const NumberInput = ({ style, label, value, onChangeValue }: Props) => {
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
      style={style}
      label={label}
      value={stringValue}
      onChangeText={handleChangeText}
      keyboardType="decimal-pad"
    />
  );
};
