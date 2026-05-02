import { ReactNode } from 'react';
import { Button as RNPButton } from 'react-native-paper';

type Props = {
  children: ReactNode;
  onPress?: () => void;
};

export const Button = ({ children, onPress }: Props) => (
  <RNPButton onPress={onPress}>{children}</RNPButton>
);
