import React from 'react';
import { Button as RNPButton } from 'react-native-paper';

type ButtonProps = {
  children: React.ReactNode;
};

const Button = ({ children }: ButtonProps) => <RNPButton>{children}</RNPButton>;

export { Button };
export type { ButtonProps };
