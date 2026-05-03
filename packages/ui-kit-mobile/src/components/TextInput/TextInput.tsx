import { StyleProp, TextStyle } from 'react-native';
import { TextInput as RNPTextInput } from 'react-native-paper';

type Props = {
  style?: StyleProp<TextStyle>;
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  keyboardType?: 'default' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
};

export const TextInput = ({ style = {}, label, value, onChangeText, keyboardType }: Props) => (
  <RNPTextInput
    style={style}
    label={label}
    value={value}
    onChangeText={onChangeText}
    keyboardType={keyboardType}
  />
);
