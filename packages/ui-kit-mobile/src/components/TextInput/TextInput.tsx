import { StyleProp, StyleSheet, TextStyle } from 'react-native'
import { TextInput as RNPTextInput } from 'react-native-paper'

type Props = {
  style?: StyleProp<TextStyle>
  label?: string
  value?: string
  onChangeText?: (text: string) => void
  keyboardType?: 'default' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad'
}

export const TextInput = ({ style = {}, label, value, onChangeText, keyboardType }: Props) => (
  <RNPTextInput
    style={[styles.root, style]}
    label={label}
    value={value}
    onChangeText={onChangeText}
    keyboardType={keyboardType}
    underlineStyle={{ height: 0 }}
  />
)

const styles = StyleSheet.create({
  root: {
    borderRadius: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
})
