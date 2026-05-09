import { PatientInfoForm } from '@/components/PatientInfoForm'
import { PatientInfo } from '@/types'
import { router } from 'expo-router'
import { StyleSheet, View } from 'react-native'

const handleSubmit = (info: PatientInfo) => {
  const params = new URLSearchParams()
  if (info.gender) params.set('gender', info.gender)
  if (info.age !== undefined) params.set('age', String(info.age))
  if (info.height !== undefined) params.set('height', String(info.height))
  if (info.weight !== undefined) params.set('weight', String(info.weight))
  router.push(`/results?${params.toString()}`)
}

const HomeScreen = () => (
  <View style={styles.container}>
    <PatientInfoForm onSubmit={handleSubmit} />
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
})

export default HomeScreen
