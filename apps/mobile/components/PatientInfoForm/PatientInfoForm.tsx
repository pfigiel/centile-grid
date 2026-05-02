import { Button, Select } from '@centile-grid/ui-kit-mobile';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

const metrics = ['HEIGHT', 'WEIGHT'];
type Metric = (typeof metrics)[number];

type FormValues = {
  gender?: 'MALE' | 'FEMALE';
  selectedMetrics: Metric[];
  height?: number; // cm
  weight?: number; // kg
};

export const PatientInfoForm = () => {
  const form = useForm<FormValues>({ defaultValues: { selectedMetrics: [] } });

  const { watch } = form;

  const selectedMetrics = watch('selectedMetrics');

  return (
    <FormProvider {...form}>
      <View style={styles.genderSelector}>
        <Controller<FormValues>
          name="gender"
          render={({ field }) => (
            <>
              <Button
                variant={field.value === 'MALE' ? 'primary' : 'secondary'}
                onPress={() => field.onChange('MALE')}
              >
                Boy
              </Button>
              <Button
                variant={field.value === 'FEMALE' ? 'primary' : 'secondary'}
                onPress={() => field.onChange('FEMALE')}
              >
                Girl
              </Button>
            </>
          )}
        ></Controller>
      </View>
      <Controller<FormValues, 'selectedMetrics'>
        name="selectedMetrics"
        render={({ field }) => (
          <Select
            label="Metric"
            options={metrics}
            onSelect={(value) => field.onChange([...field.value, value])}
          />
        )}
      />
      {selectedMetrics.map((metric) => (
        <Text key={metric}>{metric}</Text>
      ))}
    </FormProvider>
  );
};

const styles = StyleSheet.create({
  genderSelector: {
    flexDirection: 'row',
  },
});
