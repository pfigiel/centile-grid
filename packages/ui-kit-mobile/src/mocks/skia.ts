import React from 'react';
import { Text } from 'react-native';

export const skiaMock = {
  matchFont: () => null,
  Skia: {},
  Text: ({ text }: { text: string }) => React.createElement(Text, null, text),
};
