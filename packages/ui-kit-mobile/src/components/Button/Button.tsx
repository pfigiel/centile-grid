import { ReactNode } from 'react';
import { Button as RNPButton } from 'react-native-paper';

type ButtonProps = {
  children: ReactNode;
  onPress?: () => void;
};

export const Button = ({ children, onPress }: ButtonProps) => (
  <RNPButton onPress={onPress}>{children}</RNPButton>
);
