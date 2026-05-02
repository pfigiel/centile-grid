import { Text, View, Image, ScrollView } from 'react-native';

const Animated = { Text, View, Image, ScrollView };

export const useSharedValue = <T>(initial: T): { value: T } => ({ value: initial });

export const useAnimatedStyle = (fn: () => object) => fn();

export const withTiming = <T>(value: T): T => value;

export const interpolate = (
  value: number,
  inputRange: [number, number],
  outputRange: [number, number],
): number => {
  const ratio = (value - inputRange[0]) / (inputRange[1] - inputRange[0]);
  return outputRange[0] + ratio * (outputRange[1] - outputRange[0]);
};

export default Animated;
