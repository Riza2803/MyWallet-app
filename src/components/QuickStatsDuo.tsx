import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, shadows } from '../theme/tokens';

interface QuickStatsDuoProps {
  expenses: number;
  income: number;
  onExpensesPress?: () => void;
  onIncomePress?: () => void;
}

export const QuickStatsDuo: React.FC<QuickStatsDuoProps> = ({
  expenses,
  income,
  onExpensesPress,
  onIncomePress,
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <View style={styles.container}>
      {/* Expenses Card */}
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.expenseCoralBg }, shadows.soft]}
        onPress={onExpensesPress}
        activeOpacity={0.8}
      >
        <View style={[styles.iconCircle, { backgroundColor: '#FFFFFF' }]}>
          <Ionicons name="receipt-outline" size={18} color={colors.expenseCoral} />
        </View>
        <Text style={styles.statLabel}>Expenses</Text>
        <Text style={[styles.statValue, { color: colors.expenseCoral }]} numberOfLines={1}>
          -{formatCurrency(expenses)}
        </Text>
      </TouchableOpacity>

      {/* Income Card */}
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.incomeLavenderBg }, shadows.soft]}
        onPress={onIncomePress}
        activeOpacity={0.8}
      >
        <View style={[styles.iconCircle, { backgroundColor: '#FFFFFF' }]}>
          <Ionicons name="arrow-up-outline" size={18} color={colors.incomeLavender} />
        </View>
        <Text style={styles.statLabel}>Income</Text>
        <Text style={[styles.statValue, { color: colors.incomeLavender }]} numberOfLines={1}>
          +{formatCurrency(income)}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 14,
  },
  card: {
    flex: 1,
    borderRadius: radii.card,
    padding: 16,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: radii.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textBody,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: -0.2,
  },
});
