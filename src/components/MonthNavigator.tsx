import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, shadows } from '../theme/tokens';
import { triggerHaptic } from '../utils/haptics';

export type FilterMode = 'Day' | 'Week' | 'Month' | 'Year';

interface MonthNavigatorProps {
  filterMode: FilterMode;
  onFilterModeChange: (mode: FilterMode) => void;
  periodLabel: string;
  isCurrentPeriod: boolean;
  onPrev: () => void;
  onNext: () => void;
  onResetToCurrent: () => void;
  selectedMonth?: number;
  selectedYear?: number;
  onMonthChange?: (month: number) => void;
}

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({
  filterMode,
  onFilterModeChange,
  periodLabel,
  isCurrentPeriod,
  onPrev,
  onNext,
  onResetToCurrent,
  selectedMonth = 0,
  selectedYear = 2026,
  onMonthChange,
}) => {
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const getResetText = () => {
    switch (filterMode) {
      case 'Day':
        return 'Kembali ke Hari Ini';
      case 'Week':
        return 'Kembali ke Minggu Ini';
      case 'Month':
        return 'Kembali ke Bulan Ini';
      case 'Year':
        return 'Kembali ke Tahun Ini';
    }
  };

  return (
    <View style={styles.container}>
      {/* 4 Tabs Filter: Hari | Minggu | Bulan | Tahun */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, filterMode === 'Day' && styles.activeTabBtn]}
          onPress={() => {
            triggerHaptic('light');
            setShowMonthPicker(false);
            onFilterModeChange('Day');
          }}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              filterMode === 'Day' ? styles.activeTabText : styles.inactiveTabText,
            ]}
          >
            Hari
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, filterMode === 'Week' && styles.activeTabBtn]}
          onPress={() => {
            triggerHaptic('light');
            setShowMonthPicker(false);
            onFilterModeChange('Week');
          }}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              filterMode === 'Week' ? styles.activeTabText : styles.inactiveTabText,
            ]}
          >
            Minggu
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, filterMode === 'Month' && styles.activeTabBtn]}
          onPress={() => {
            triggerHaptic('light');
            setShowMonthPicker(false);
            onFilterModeChange('Month');
          }}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              filterMode === 'Month' ? styles.activeTabText : styles.inactiveTabText,
            ]}
          >
            Bulan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, filterMode === 'Year' && styles.activeTabBtn]}
          onPress={() => {
            triggerHaptic('light');
            setShowMonthPicker(false);
            onFilterModeChange('Year');
          }}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              filterMode === 'Year' ? styles.activeTabText : styles.inactiveTabText,
            ]}
          >
            Tahun
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stepper Bar */}
      <View style={styles.stepperContainer}>
        <TouchableOpacity
          style={styles.arrowButton}
          onPress={onPrev}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={18} color={colors.textMain} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.labelButton}
          onPress={() => {
            if (filterMode === 'Month') {
              setShowMonthPicker(!showMonthPicker);
            }
          }}
          activeOpacity={filterMode === 'Month' ? 0.8 : 1}
        >
          <Ionicons
            name="calendar-outline"
            size={15}
            color={colors.textMain}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.labelText}>{periodLabel}</Text>
          {filterMode === 'Month' && (
            <Ionicons
              name={showMonthPicker ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={colors.textMain}
              style={{ marginLeft: 4 }}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.arrowButton}
          onPress={onNext}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-forward" size={18} color={colors.textMain} />
        </TouchableOpacity>
      </View>

      {/* Quick Reset Pill if viewing a past/future period */}
      {!isCurrentPeriod && (
        <TouchableOpacity
          style={styles.resetPill}
          onPress={onResetToCurrent}
          activeOpacity={0.8}
        >
          <Ionicons name="today-outline" size={13} color={colors.textMain} />
          <Text style={styles.resetPillText}>{getResetText()}</Text>
        </TouchableOpacity>
      )}

      {/* Month Picker dropdown when in Month mode */}
      {showMonthPicker && filterMode === 'Month' && onMonthChange && (
        <View style={styles.monthChipsCard}>
          <Text style={styles.pickerTitle}>Pilih Bulan ({selectedYear}):</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.monthChipsScroll}
          >
            {SHORT_MONTHS.map((mName, idx) => {
              const isSelected = selectedMonth === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.monthChip,
                    isSelected && styles.monthChipSelected,
                  ]}
                  onPress={() => {
                    onMonthChange(idx);
                    setShowMonthPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.monthChipText,
                      isSelected && styles.monthChipTextSelected,
                    ]}
                  >
                    {mName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#EFEFE8',
    borderRadius: radii.pill,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabBtn: {
    backgroundColor: colors.surfaceCard,
    ...shadows.soft,
  },
  tabText: {
    fontSize: 12,
  },
  activeTabText: {
    fontWeight: '700',
    color: colors.textMain,
  },
  inactiveTabText: {
    fontWeight: '500',
    color: colors.textMuted,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceCard,
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    flex: 1,
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMain,
    textAlign: 'center',
  },
  resetPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryYellowLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    marginTop: 6,
  },
  resetPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMain,
  },
  monthChipsCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radii.cardSm,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
  },
  monthChipsScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  monthChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceSubtle,
  },
  monthChipSelected: {
    backgroundColor: colors.primaryYellow,
  },
  monthChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textBody,
  },
  monthChipTextSelected: {
    color: colors.textMain,
    fontWeight: '700',
  },
});
