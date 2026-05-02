import { ReactNode, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { BottomSheet } from '../BottomSheet';

type Props<T extends string> = {
  value?: T;
  options: T[];
  label?: string;
  renderValue?: (value: T) => ReactNode;
  onSelect?: (value: T) => void;
};

const LABEL_TOP_EMPTY = 16;
const LABEL_TOP_FILLED = -10;
const LABEL_SIZE_EMPTY = 16;
const LABEL_SIZE_FILLED = 12;

export const Select = <T extends string>({
  value,
  options,
  label,
  renderValue,
  onSelect,
}: Props<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const progress = useSharedValue(value !== undefined ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value !== undefined ? 1 : 0, { duration: 150 });
  }, [value, progress]);

  const animatedLabelStyle = useAnimatedStyle(() => ({
    top: interpolate(progress.value, [0, 1], [LABEL_TOP_EMPTY, LABEL_TOP_FILLED]),
    fontSize: interpolate(progress.value, [0, 1], [LABEL_SIZE_EMPTY, LABEL_SIZE_FILLED]),
  }));

  const handleSelect = (item: T) => {
    onSelect?.(item);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <Pressable role="combobox" style={styles.toggle} onPress={() => setIsOpen(true)}>
        {label && <Animated.Text style={[styles.label, animatedLabelStyle]}>{label}</Animated.Text>}
        {value !== undefined && (
          <Text style={styles.value}>{renderValue ? renderValue(value) : value}</Text>
        )}
        <Text style={styles.chevron}>▼</Text>
      </Pressable>

      <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <BottomSheetScrollView>
          {label && <Text style={styles.sheetHeader}>{label}</Text>}
          {options.map((option) => (
            <Pressable
              key={option}
              role="option"
              style={styles.item}
              onPress={() => handleSelect(option)}
            >
              <Text>{renderValue ? renderValue(option) : option}</Text>
              {value === option && <Text style={styles.checkmark}>✓</Text>}
            </Pressable>
          ))}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  toggle: {
    borderWidth: 2,
    borderColor: '#86868b',
    borderRadius: 6,
    minHeight: 52,
    paddingVertical: 14,
    paddingHorizontal: 14,
    paddingRight: 44,
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    left: 10,
    backgroundColor: 'white',
    paddingHorizontal: 4,
    color: '#86868b',
  },
  value: {
    fontSize: 16,
    color: '#000',
  },
  chevron: {
    position: 'absolute',
    right: 12,
    top: 16,
    color: '#86868b',
    fontSize: 12,
  },
  sheetHeader: {
    fontSize: 12,
    textTransform: 'uppercase',
    color: '#86868b',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  checkmark: {
    color: '#0a84ff',
    fontSize: 14,
  },
});
