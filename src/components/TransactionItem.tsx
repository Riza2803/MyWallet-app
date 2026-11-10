import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppIcon } from './AppIcon';
import { Transaction } from '../types';
import { colors, radii } from '../theme/tokens';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
  onLongPress?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
  onLongPress,
}) => {
  const isExpense = transaction.type === 'EXPENSE';
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const iconName = (transaction.categoryIcon || 'pricetag-outline') as any;
  const iconColor = transaction.categoryColor || (isExpense ? colors.expenseCoral : colors.incomeLavender);
  const bgColor = transaction.categoryBgColor || (isExpense ? colors.expenseCoralBg : colors.incomeLavenderBg);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
        <AppIcon name={iconName} size={22} color={iconColor} />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {transaction.note || transaction.categoryName || 'Transaksi'}
        </Text>
        <Text style={styles.subtitle}>
          {transaction.categoryName ? `${transaction.categoryName} • ` : ''}
          {transaction.date}
        </Text>
      </View>

      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.amount,
            { color: isExpense ? colors.expenseCoral : colors.textMain },
          ]}
          numberOfLines={1}
        >
          {isExpense ? '-' : '+'}
          {formatCurrency(transaction.amount)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radii.cardSm,
    backgroundColor: colors.surfaceCard,
    marginBottom: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: radii.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textMuted,
  },
  amountContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
