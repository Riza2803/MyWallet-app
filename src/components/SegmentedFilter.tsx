import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radii, shadows } from '../theme/tokens';

interface SegmentedFilterProps {
  selected: 'Month' | 'Year';
  onSelect: (option: 'Month' | 'Year') => void;
}

export const SegmentedFilter: React.FC<SegmentedFilterProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.pillButton,
          selected === 'Month' && [styles.activePill, shadows.activePill],
        ]}
        onPress={() => onSelect('Month')}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.pillText,
            selected === 'Month' ? styles.activeText : styles.inactiveText,
          ]}
        >
          Bulan Ini
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.pillButton,
          selected === 'Year' && [styles.activePill, shadows.activePill],
        ]}
        onPress={() => onSelect('Year')}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.pillText,
            selected === 'Year' ? styles.activeText : styles.inactiveText,
          ]}
        >
          Tahun Ini
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F1F1EB',
    borderRadius: radii.pill,
    padding: 4,
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 8,
  },
  pillButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    backgroundColor: colors.primaryYellow,
  },
  pillText: {
    fontSize: 13,
  },
  activeText: {
    fontWeight: '700',
    color: colors.textMain,
  },
  inactiveText: {
    fontWeight: '500',
    color: '#7A7A77',
  },
});
