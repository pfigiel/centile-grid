import { PatientInfoForm } from '@/components/PatientInfoForm';
import { StyleSheet, View } from 'react-native';

const HomeScreen = () => (
  <View style={styles.container}>
    <PatientInfoForm />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
});

export default HomeScreen;
