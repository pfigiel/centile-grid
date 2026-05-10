import { PatientInfo } from '@/types'
import { Button, NumberInput, Select } from '@centile-grid/ui-kit-mobile'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

const parameters = ['AGE', 'HEIGHT', 'WEIGHT'] as const
type Parameter = (typeof parameters)[number]

type ParameterValues = Exclude<PatientInfo, 'gender'>

type FormValues = PatientInfo & {
  selectedParameters: Parameter[]
}

type Props = {
  onSubmit: (values: PatientInfo) => void
}

const parameterToFieldNameMap: Record<Parameter, keyof ParameterValues> = {
  AGE: 'age',
  HEIGHT: 'height',
  WEIGHT: 'weight',
}

export const PatientInfoForm = ({ onSubmit }: Props) => {
  const { t } = useTranslation()
  const form = useForm<FormValues>({ defaultValues: { selectedParameters: ['AGE'] } })

  const { watch, setValue } = form

  const selectedParameters: Parameter[] = watch('selectedParameters')
  const availableParameters = parameters.filter((param) => !selectedParameters.includes(param))

  const parameterToSelectOptionMap: Record<Parameter, string> = {
    AGE: t('patientInfoForm.ageOption'),
    HEIGHT: t('patientInfoForm.heightOption'),
    WEIGHT: t('patientInfoForm.weightOption'),
  }

  const parameterToFieldLabelMap: Record<Parameter, string> = {
    AGE: t('patientInfoForm.ageLabel'),
    HEIGHT: t('patientInfoForm.heightLabel'),
    WEIGHT: t('patientInfoForm.weightLabel'),
  }

  return (
    <View style={styles.container}>
      <FormProvider {...form}>
        <View style={styles.inputsContainer}>
          <Text style={styles.title}>{t('patientInfoForm.title')}</Text>
          <View>
            <Text style={styles.sectionLabel}>{t('patientInfoForm.gender')}</Text>
            <View style={styles.genderSelector}>
              <Controller<FormValues>
                name="gender"
                render={({ field }) => (
                  <>
                    <Button
                      style={styles.genderSelectorButton}
                      variant={field.value === 'male' ? 'primary' : 'secondary'}
                      onPress={() => field.onChange('male')}
                    >
                      {t('patientInfoForm.boy')}
                    </Button>
                    <Button
                      style={styles.genderSelectorButton}
                      variant={field.value === 'female' ? 'primary' : 'secondary'}
                      onPress={() => field.onChange('female')}
                    >
                      {t('patientInfoForm.girl')}
                    </Button>
                  </>
                )}
              />
            </View>
          </View>
          {selectedParameters.length > 0 && (
            <View>
              <Text style={styles.sectionLabel}>{t('patientInfoForm.parameters')}</Text>
              <View style={styles.paramRows}>
                {selectedParameters.map((param) => (
                  <View style={styles.paramRow} key={param}>
                    <Controller<FormValues>
                      name={parameterToFieldNameMap[param]}
                      render={({ field }) => (
                        <NumberInput
                          style={styles.paramInput}
                          label={parameterToFieldLabelMap[param]}
                          value={field.value}
                          onChangeValue={field.onChange}
                        />
                      )}
                    />
                    {param !== 'AGE' && (
                      <Button
                        style={styles.deleteParamButton}
                        styles={{
                          content: styles.deleteParamButtonContent,
                          label: styles.deleteParamButtonLabel,
                        }}
                        onPress={() =>
                          setValue(
                            'selectedParameters',
                            selectedParameters.filter((selectedParam) => selectedParam !== param),
                          )
                        }
                      >
                        X
                      </Button>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}
          <Controller<FormValues, 'selectedParameters'>
            name="selectedParameters"
            render={({ field }) => (
              <Select
                disabled={availableParameters.length === 0}
                label={t('patientInfoForm.addParameter')}
                options={availableParameters}
                onSelect={(value) => field.onChange([...field.value, value])}
                renderValue={(value) => parameterToSelectOptionMap[value]}
              />
            )}
          />
        </View>
        <Button onPress={form.handleSubmit(onSubmit)}>{t('patientInfoForm.showGrids')}</Button>
      </FormProvider>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
  },
  inputsContainer: {
    gap: 32,
  },
  title: {
    fontSize: 24,
  },
  sectionLabel: {
    marginBottom: 8,
  },
  genderSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  genderSelectorButton: {
    flex: 1,
  },
  paramRows: {
    flexDirection: 'column',
    gap: 16,
  },
  paramRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  paramInput: {
    flex: 1,
  },
  deleteParamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    minWidth: 0,
    height: 56,
  },
  deleteParamButtonContent: {
    minWidth: 0,
    paddingHorizontal: 0,
  },
  deleteParamButtonLabel: {
    marginHorizontal: 0,
    marginVertical: 0,
  },
})
