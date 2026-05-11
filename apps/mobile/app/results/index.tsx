import { useChartsData } from '@/hooks/useChartsData'
import { GrowthParameter } from '@/types'
import { getCentileLabel } from '@/utils/getCentileLabel/getCentileLabel'
import { Button, LineChart } from '@centile-grid/ui-kit-mobile'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'

type Params = {
  gender: string
  age: string
  height?: string
  weight?: string
}

const ResultsScreen = () => {
  const { t } = useTranslation()
  const { gender, age, height, weight } = useLocalSearchParams<Params>()

  const metrics: { parameter: GrowthParameter; value: number }[] = []
  if (height !== undefined) metrics.push({ parameter: 'height', value: Number(height) })
  if (weight !== undefined) metrics.push({ parameter: 'weight', value: Number(weight) })

  const { chartData, isLoading, isError } = useChartsData({
    gender: gender as 'male' | 'female',
    age: Number(age),
    metrics,
  })

  useEffect(() => {
    if (isError) router.replace('/')
  }, [isError])

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button onPress={router.back}>{t('results.back')}</Button>
      <View style={styles.centileSection}>
        {chartData?.map((data, index) => (
          <View key={index} style={styles.centileRow}>
            <Text style={styles.parameterLabel}>
              {data.parameter === 'height' ? t('results.heightLabel') : t('results.weightLabel')}
            </Text>
            <Text style={styles.centileValue}>
              {getCentileLabel(
                data.lineSeries.map((ls) => ls.data),
                Number(age),
                metrics[index].value,
              )}
            </Text>
          </View>
        ))}
      </View>
      {chartData?.map((data, index) => (
        <View key={index} style={styles.chart}>
          <LineChart.Container>
            <LineChart
              lineSeries={data.lineSeries}
              scatterSeries={data.scatterSeries}
              xLabel={t('results.xLabel')}
              yLabel={
                data.parameter === 'height' ? t('results.heightYLabel') : t('results.weightYLabel')
              }
            />
          </LineChart.Container>
        </View>
      ))}
    </ScrollView>
  )
}

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
  centileSection: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    gap: 4,
  },
  parameterLabel: {
    fontWeight: 500,
    minWidth: 50,
  },
  centileValue: {},
  centileRow: {
    flexDirection: 'row',
    gap: 16,
  },
  chart: {
    height: 300,
  },
})

export default ResultsScreen
