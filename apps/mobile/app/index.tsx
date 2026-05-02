import { Button, Select } from '@centile-grid/ui-kit-mobile';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

const HomeScreen = () => {
  const [value, setValue] = useState<string>();

  return (
    <View style={styles.container}>
      <Button>Hello world</Button>
      <Select
        value={value}
        label="Test select"
        options={['Option 1', 'Option 2', 'Option 3']}
        onSelect={setValue}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomeScreen;
