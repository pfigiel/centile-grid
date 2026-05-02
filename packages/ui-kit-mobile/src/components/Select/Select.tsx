import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { ReactNode, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { BottomSheetModal } from '../BottomSheetModal';

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
  }, [progress, value]);

  const animatedLabelStyle = useAnimatedStyle(() => ({
    top: interpolate(progress.value, [0, 1], [LABEL_TOP_EMPTY, LABEL_TOP_FILLED]),
    fontSize: interpolate(progress.value, [0, 1], [LABEL_SIZE_EMPTY, LABEL_SIZE_FILLED]),
  }));

  const handleTogglePress = () => setIsOpen(true);

  const handleSelect = (item: T) => {
    onSelect?.(item);
    setIsOpen(false);
  };

  const handleClose = () => setIsOpen(false);

  return (
    <View style={styles.container}>
      <Pressable role="combobox" style={styles.toggle} onPress={handleTogglePress}>
        {label && <Animated.Text style={[styles.label, animatedLabelStyle]}>{label}</Animated.Text>}
        {value !== undefined && (
          <View style={styles.value}>
            {renderValue ? renderValue(value) : <Text>{value}</Text>}
          </View>
        )}
        <Text style={styles.chevron}>▼</Text>
      </Pressable>
      <BottomSheetModal isOpen={isOpen} onClose={handleClose}>
        <BottomSheetScrollView>
          {label && <Text style={styles.sheetHeader}>{label}</Text>}
          {options.map((option) => (
            <Pressable
              key={option}
              role="option"
              style={styles.item}
              onPress={() => handleSelect(option)}
            >
              <View style={styles.optionContent}>
                {renderValue?.(option) ?? <Text>{option}</Text>}
              </View>
              {value === option && <Text style={styles.checkmark}>✓</Text>}
            </Pressable>
          ))}
        </BottomSheetScrollView>
      </BottomSheetModal>
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
    justifyContent: 'center',
  },
  optionContent: {
    flex: 1,
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
