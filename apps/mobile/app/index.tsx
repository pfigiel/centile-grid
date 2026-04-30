import { Button } from '@centile-grid/ui-kit-mobile';
import { StyleSheet, View } from 'react-native';

const HomeScreen = () => (
  <View style={styles.container}>
    <Button>Hello world</Button>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomeScreen;
