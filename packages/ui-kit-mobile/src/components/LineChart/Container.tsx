import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type ContainerStyles = {
  container?: StyleProp<ViewStyle>;
  innerContainer?: StyleProp<ViewStyle>;
};

type Props = {
  children: ReactNode;
  styles?: ContainerStyles;
};

export const Container = ({ children, styles: customStyles }: Props) => (
  <View style={[customStyles?.container]}>
    <View style={[styles.innerContainer, customStyles?.innerContainer]}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  innerContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: 'rgb(242, 242, 242)',
    padding: 12,
    minHeight: 300,
  },
});
