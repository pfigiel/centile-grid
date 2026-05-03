import { Button, NumberInput, Select } from '@centile-grid/ui-kit-mobile';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

const parameters = ['AGE', 'HEIGHT', 'WEIGHT'] as const;
type Parameter = (typeof parameters)[number];

type ParameterValues = {
  age?: number; // years
  height?: number; // cm
  weight?: number; // kg
};

type FormValues = ParameterValues & {
  gender?: 'MALE' | 'FEMALE';
  selectedParameters: Parameter[];
};

const parameterToFieldNameMap: Record<Parameter, keyof ParameterValues> = {
  AGE: 'age',
  HEIGHT: 'height',
  WEIGHT: 'weight',
};

const parameterToSelectOptionMap: Record<Parameter, string> = {
  AGE: 'Age',
  HEIGHT: 'Height',
  WEIGHT: 'Weight',
};

const parameterToFieldLabelMap: Record<Parameter, string> = {
  AGE: 'Age [years]',
  HEIGHT: 'Height [cm]',
  WEIGHT: 'Weight [kg]',
};

export const PatientInfoForm = () => {
  const form = useForm<FormValues>({ defaultValues: { selectedParameters: ['AGE'] } });

  const { watch, setValue } = form;

  const selectedParameters: Parameter[] = watch('selectedParameters');
  const availableParameters = parameters.filter((param) => !selectedParameters.includes(param));

  const onSubmit = (values: FormValues) => {
    console.log('VALUES', values);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter patient data</Text>
      <FormProvider {...form}>
        <View>
          <Text style={styles.sectionLabel}>Gender</Text>
          <View style={styles.genderSelector}>
            <Controller<FormValues>
              name="gender"
              render={({ field }) => (
                <>
                  <Button
                    style={styles.genderSelectorButton}
                    variant={field.value === 'MALE' ? 'primary' : 'secondary'}
                    onPress={() => field.onChange('MALE')}
                  >
                    Boy
                  </Button>
                  <Button
                    style={styles.genderSelectorButton}
                    variant={field.value === 'FEMALE' ? 'primary' : 'secondary'}
                    onPress={() => field.onChange('FEMALE')}
                  >
                    Girl
                  </Button>
                </>
              )}
            ></Controller>
          </View>
        </View>
        {selectedParameters.length > 0 && (
          <View>
            <Text style={styles.sectionLabel}>Parameters</Text>
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
              label="Add parameter"
              options={availableParameters}
              onSelect={(value) => field.onChange([...field.value, value])}
              renderValue={(value) => parameterToSelectOptionMap[value]}
            />
          )}
        />
        <Button onPress={form.handleSubmit(onSubmit)}>Show grids</Button>
      </FormProvider>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
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
});
