import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, shadows } from '../theme/tokens';

interface BalanceCardProps {
  balance: number;
  period?: string;
  balanceLabel?: string;
  netCashflow?: number;
  accountCount?: number;
  onPeriodPress?: () => void;
  onManageAccounts?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  period = 'Bulan',
  balanceLabel = 'Total Saldo',
  netCashflow,
  accountCount = 1,
  onPeriodPress,
  onManageAccounts,
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <View style={[styles.card, shadows.card]}>
      {/* Decorative subtle circles in background */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />

      {/* Card Header */}
      <View style={styles.headerRow}>
        <Text style={styles.balanceLabel} numberOfLines={1} ellipsizeMode="tail">
          {balanceLabel}
        </Text>
        <TouchableOpacity
          style={styles.periodChip}
          onPress={onPeriodPress}
          activeOpacity={0.8}
        >
          <Text style={styles.periodText} numberOfLines={1} ellipsizeMode="tail">
            {period}
          </Text>
          <Ionicons name="chevron-down" size={13} color={colors.textMain} />
        </TouchableOpacity>
      </View>

      {/* Main Balance Display */}
      <View style={styles.amountContainer}>
        <Text style={styles.balanceAmount} numberOfLines={1} adjustsFontSizeToFit>
          {formatCurrency(balance)}
        </Text>
        {netCashflow !== undefined && (
          <View style={styles.cashflowRow}>
            <View
              style={[
                styles.cashflowPill,
                {
                  backgroundColor:
                    netCashflow >= 0
                      ? 'rgba(46, 196, 182, 0.25)'
                      : 'rgba(232, 77, 96, 0.25)',
                },
              ]}
            >
              <Ionicons
                name={netCashflow >= 0 ? 'arrow-up-circle' : 'arrow-down-circle'}
                size={13}
                color={netCashflow >= 0 ? '#0D7A6F' : '#B81D30'}
              />
              <Text
                style={[
                  styles.cashflowText,
                  { color: netCashflow >= 0 ? '#0D7A6F' : '#B81D30' },
                ]}
              >
                Arus Kas: {netCashflow >= 0 ? '+' : ''}
                {formatCurrency(netCashflow)}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Card Footer: Account Management Action (Clean, No Account Number / Expire Date) */}
      <TouchableOpacity
        style={styles.manageFooter}
        onPress={onManageAccounts}
        activeOpacity={0.85}
      >
        <View style={styles.footerLeft}>
          <View style={styles.walletIconCircle}>
            <Ionicons name="wallet-outline" size={14} color={colors.textMain} />
          </View>
          <Text style={styles.footerText}>
            {accountCount} Dompet / Akun • Sesuaikan
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textMain} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primaryYellow,
    borderRadius: 26,
    padding: 22,
    marginHorizontal: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  decorCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMain,
    opacity: 0.9,
    flexShrink: 1,
  },
  periodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    gap: 4,
    maxWidth: '52%',
    flexShrink: 0,
  },
  periodText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMain,
    flexShrink: 1,
  },
  amountContainer: {
    marginBottom: 16,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textMain,
    letterSpacing: -0.5,
  },
  cashflowRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  cashflowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
  },
  cashflowText: {
    fontSize: 12,
    fontWeight: '700',
  },
  manageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: radii.pill,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMain,
  },
});
