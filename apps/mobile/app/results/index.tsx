import { useChartsData } from '@/hooks/useChartsData';
import { GrowthParameter } from '@/types';
import { LineChart } from '@centile-grid/ui-kit-mobile';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Params = {
  gender: string;
  age: string;
  height?: string;
  weight?: string;
};

const ResultsScreen = () => {
  const { gender, age, height, weight } = useLocalSearchParams<Params>();

  const metrics: { parameter: GrowthParameter; value: number }[] = [];

  if (height !== undefined) {
    metrics.push({ parameter: 'height', value: Number(height) });
  }
  if (weight !== undefined) {
    metrics.push({ parameter: 'weight', value: Number(weight) });
  }

  const { chartData, isLoading, isError } = useChartsData({
    gender: gender as 'male' | 'female',
    age: Number(age),
    metrics,
  });

  useEffect(() => {
    if (isError) {
      router.replace('/');
    }
  }, [isError]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text>Back</Text>
      </TouchableOpacity>
      {chartData?.map((data, index) => (
        <View key={index} style={styles.chart}>
          <LineChart
            lineSeries={data.lineSeries}
            scatterSeries={data.scatterSeries}
            xLabel="Age (years)"
            yLabel={data.parameter === 'height' ? 'Height (cm)' : 'Weight (kg)'}
          />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexGrow: 1,
    gap: 16,
  },
  backButton: {
    paddingVertical: 8,
  },
  chart: {
    height: 300,
  },
});

export default ResultsScreen;
