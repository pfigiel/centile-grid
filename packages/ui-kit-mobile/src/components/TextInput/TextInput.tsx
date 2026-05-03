import { TextInput as RNPTextInput } from 'react-native-paper';

type Props = {
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  keyboardType?: 'default' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
};

export const TextInput = ({ label, value, onChangeText, keyboardType }: Props) => (
  <RNPTextInput
    label={label}
    value={value}
    onChangeText={onChangeText}
    keyboardType={keyboardType}
  />
);
