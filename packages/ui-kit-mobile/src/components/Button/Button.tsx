import { ReactNode } from 'react';
import { Button as RNPButton } from 'react-native-paper';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
};

const modeByVariant = {
  primary: 'contained',
  secondary: 'contained-tonal',
} as const;

export const Button = ({ children, onPress, variant = 'primary' }: Props) => (
  <RNPButton mode={modeByVariant[variant]} onPress={onPress}>
    {children}
  </RNPButton>
);
