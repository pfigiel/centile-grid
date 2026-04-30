import React from 'react';
import { Button as RNPButton } from 'react-native-paper';

type Props = {
  children: React.ReactNode;
};

const Button = ({ children }: Props) => <RNPButton>{children}</RNPButton>;

export { Button };
export type { Props as ButtonProps };
