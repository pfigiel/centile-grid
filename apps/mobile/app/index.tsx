import { PatientInfoForm } from '@/components/PatientInfoForm';
import { PatientInfo } from '@/types';
import { LineChart } from '@centile-grid/ui-kit-mobile';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

const HomeScreen = () => {
  const [patientInfo, setPatientInfo] = useState<PatientInfo>();

  return (
    <View style={styles.container}>
      <PatientInfoForm onSubmit={setPatientInfo} />
      {patientInfo && (
        <LineChart
          lineSeries={[
            {
              data: [
                {
                  x: 1,
                  y: 70,
                },
                {
                  x: 2,
                  y: 80,
                },
              ],
            },
          ]}
          xLabel="Age"
          yLabel="Height"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
});

export default HomeScreen;
