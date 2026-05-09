import { ReactNode } from 'react'
import { StyleProp, StyleSheet, TextStyle, ViewStyle } from 'react-native'
import { Button as RNPButton } from 'react-native-paper'

type Props = {
  style?: StyleProp<ViewStyle>
  styles?: {
    content?: StyleProp<ViewStyle>
    label?: StyleProp<TextStyle>
  }
  children: ReactNode
  onPress?: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

const modeByVariant = {
  primary: 'contained',
  secondary: 'contained-tonal',
} as const

export const Button = ({
  style,
  styles: stylesProp,
  children,
  onPress,
  variant = 'primary',
  disabled,
}: Props) => (
  <RNPButton
    style={[styles.root, style]}
    contentStyle={stylesProp?.content}
    labelStyle={stylesProp?.label}
    mode={modeByVariant[variant]}
    onPress={onPress}
    disabled={disabled}
  >
    {children}
  </RNPButton>
)

const styles = StyleSheet.create({
  root: {
    borderRadius: 8,
  },
})
