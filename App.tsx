import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StatusBar as RNStatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Header } from './src/components/Header';
import { BalanceCard } from './src/components/BalanceCard';
import { QuickStatsDuo } from './src/components/QuickStatsDuo';
import { MonthNavigator, FilterMode } from './src/components/MonthNavigator';
import { TransactionItem } from './src/components/TransactionItem';
import { AddTransactionModal } from './src/components/AddTransactionModal';
import { ManageAccountsModal } from './src/components/ManageAccountsModal';
import { EditProfileModal } from './src/components/EditProfileModal';
import { NotificationModal } from './src/components/NotificationModal';
import { OnboardingModal } from './src/components/OnboardingModal';
import { triggerHaptic } from './src/utils/haptics';
import { colors, radii, shadows } from './src/theme/tokens';
import {
  fetchAccounts,
  fetchCategories,
  fetchTransactions,
  addTransaction,
  deleteTransaction,
  addCategory,
  deleteCategory,
  addAccount,
  updateAccount,
  deleteAccount,
  fetchUserName,
  saveUserName,
  fetchIsOnboarded,
  fetchReminders,
  addReminder,
  toggleReminder,
  deleteReminder,
} from './src/db/database';
import { Account, Category, Transaction, TransactionType, Reminder } from './src/types';

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export default function App() {
  const now = new Date();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [userName, setUserName] = useState('');

  // Period Filtering (Hari | Minggu | Bulan | Tahun)
  const [filterMode, setFilterMode] = useState<FilterMode>('Month');
  const [anchorDate, setAnchorDate] = useState<Date>(new Date());

  // Modals
  const [modalVisible, setModalVisible] = useState(false);
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [onboardingVisible, setOnboardingVisible] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>('EXPENSE');

  const showAlert = (title: string, message?: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message || ''}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const loadData = useCallback(async () => {
    try {
      const [accs, cats, trs, savedName, rems, isOnboarded] = await Promise.all([
        fetchAccounts(),
        fetchCategories(),
        fetchTransactions(),
        fetchUserName(),
        fetchReminders(),
        fetchIsOnboarded(),
      ]);
      setAccounts(accs);
      setCategories(cats);
      setTransactions(trs);
      setReminders(rems);
      if (savedName) {
        setUserName(savedName);
      }
      if (!isOnboarded || !savedName) {
        setOnboardingVisible(true);
      }
    } catch (e) {
      console.error('Error loading data:', e);
      showAlert('Database Error', 'Gagal memuat database.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleSaveOnboarding = async (name: string) => {
    try {
      await saveUserName(name);
      setUserName(name);
      setOnboardingVisible(false);
    } catch (e) {
      console.error('Error saving onboarding name:', e);
      showAlert('Gagal', 'Terjadi kesalahan saat menyimpan nama.');
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Deep Link Handling for Home Screen Widgets (e.g. walletriza://add?type=income)
  useEffect(() => {
    const handleUrl = (url?: string | null) => {
      if (!url) return;
      if (url.includes('income') || url.includes('pemasukan')) {
        setTransactionType('INCOME');
        setModalVisible(true);
      } else if (url.includes('expense') || url.includes('pengeluaran') || url.includes('add')) {
        setTransactionType('EXPENSE');
        setModalVisible(true);
      }
    };

    Linking.getInitialURL().then(handleUrl);
    const sub = Linking.addEventListener('url', (event) => handleUrl(event.url));
    return () => sub.remove();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Filtered transactions & Period Calculations (Hari | Minggu | Bulan | Tahun)
  const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayStr = now.toISOString().split('T')[0];

  let periodLabel = '';
  let isCurrentPeriod = false;
  let cutoffDate = '';
  let filteredTransactions: Transaction[] = [];

  if (filterMode === 'Day') {
    const dayStr = anchorDate.toISOString().split('T')[0];
    isCurrentPeriod = dayStr === todayStr;
    const dayName = DAY_NAMES[anchorDate.getDay()];
    periodLabel = `${dayName}, ${anchorDate.getDate()} ${SHORT_MONTHS[anchorDate.getMonth()]} ${anchorDate.getFullYear()}${isCurrentPeriod ? ' (Hari Ini)' : ''}`;
    filteredTransactions = transactions.filter((t) => t.date === dayStr);
    cutoffDate = dayStr;
  } else if (filterMode === 'Week') {
    const day = anchorDate.getDay();
    const diffToMon = (day === 0 ? -6 : 1) - day;
    const mon = new Date(anchorDate);
    mon.setDate(anchorDate.getDate() + diffToMon);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);

    const startStr = mon.toISOString().split('T')[0];
    const endStr = sun.toISOString().split('T')[0];
    isCurrentPeriod = todayStr >= startStr && todayStr <= endStr;
    periodLabel = `${mon.getDate()} ${SHORT_MONTHS[mon.getMonth()]} - ${sun.getDate()} ${SHORT_MONTHS[sun.getMonth()]} ${sun.getFullYear()}${isCurrentPeriod ? ' (Minggu Ini)' : ''}`;
    filteredTransactions = transactions.filter((t) => t.date >= startStr && t.date <= endStr);
    cutoffDate = endStr;
  } else if (filterMode === 'Month') {
    const m = anchorDate.getMonth();
    const y = anchorDate.getFullYear();
    isCurrentPeriod = m === now.getMonth() && y === now.getFullYear();
    periodLabel = `${MONTH_NAMES[m]} ${y}${isCurrentPeriod ? ' (Bulan Ini)' : ''}`;
    const ym = `${y}-${String(m + 1).padStart(2, '0')}`;
    filteredTransactions = transactions.filter((t) => t.date.startsWith(ym));
    const lastDay = new Date(y, m + 1, 0).getDate();
    cutoffDate = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  } else {
    // Year
    const y = anchorDate.getFullYear();
    isCurrentPeriod = y === now.getFullYear();
    periodLabel = `Tahun ${y}${isCurrentPeriod ? ' (Tahun Ini)' : ''}`;
    filteredTransactions = transactions.filter((t) => t.date.startsWith(String(y)));
    cutoffDate = `${y}-12-31`;
  }

  const liveTotalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const periodIncome = filteredTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const periodExpenses = filteredTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashflow = periodIncome - periodExpenses;

  // Calculate ending balance for the selected period
  const periodBalance = (() => {
    if (isCurrentPeriod || cutoffDate >= todayStr) {
      return liveTotalBalance;
    }

    const futureTransactions = transactions.filter((t) => t.date > cutoffDate);
    const futureIncome = futureTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
    const futureExpenses = futureTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    return liveTotalBalance - futureIncome + futureExpenses;
  })();

  const balanceLabel = isCurrentPeriod ? 'Total Saldo' : 'Saldo Akhir';

  const cardPeriodBadge = (() => {
    if (filterMode === 'Day') {
      return isCurrentPeriod ? 'Hari Ini' : `${anchorDate.getDate()} ${SHORT_MONTHS[anchorDate.getMonth()]}`;
    }
    if (filterMode === 'Week') {
      return isCurrentPeriod ? 'Minggu Ini' : 'Mingguan';
    }
    if (filterMode === 'Month') {
      return isCurrentPeriod ? 'Bulan Ini' : `${SHORT_MONTHS[anchorDate.getMonth()]} ${anchorDate.getFullYear()}`;
    }
    return isCurrentPeriod ? 'Tahun Ini' : `${anchorDate.getFullYear()}`;
  })();

  const handlePrevPeriod = () => {
    triggerHaptic('light');
    setAnchorDate((prev) => {
      const d = new Date(prev);
      if (filterMode === 'Day') d.setDate(d.getDate() - 1);
      else if (filterMode === 'Week') d.setDate(d.getDate() - 7);
      else if (filterMode === 'Month') d.setMonth(d.getMonth() - 1);
      else if (filterMode === 'Year') d.setFullYear(d.getFullYear() - 1);
      return d;
    });
  };

  const handleNextPeriod = () => {
    triggerHaptic('light');
    setAnchorDate((prev) => {
      const d = new Date(prev);
      if (filterMode === 'Day') d.setDate(d.getDate() + 1);
      else if (filterMode === 'Week') d.setDate(d.getDate() + 7);
      else if (filterMode === 'Month') d.setMonth(d.getMonth() + 1);
      else if (filterMode === 'Year') d.setFullYear(d.getFullYear() + 1);
      return d;
    });
  };

  const handleResetToCurrent = () => {
    triggerHaptic('medium');
    setAnchorDate(new Date());
  };

  // Transaction Actions
  const handleSaveTransaction = async (
    type: TransactionType,
    amount: number,
    categoryId: string,
    accountId: string,
    date: string,
    note?: string
  ) => {
    try {
      await addTransaction(type, amount, categoryId, accountId, date, note);
      await loadData();
    } catch (e) {
      console.error('Failed to save transaction:', e);
      showAlert('Gagal', 'Terjadi kesalahan saat menyimpan transaksi.');
    }
  };

  const handleDeleteTransaction = (id: string, note?: string) => {
    const confirmMsg = `Yakin ingin menghapus transaksi "${note || 'ini'}"? Saldo akun akan dikembalikan otomatis.`;
    const performDelete = async () => {
      await deleteTransaction(id);
      await loadData();
    };

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        performDelete();
      }
    } else {
      Alert.alert('Hapus Transaksi', confirmMsg, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: performDelete },
      ]);
    }
  };

  // Category Actions
  const handleAddCategory = async (
    name: string,
    type: TransactionType,
    icon: string,
    color: string,
    bgColor: string
  ) => {
    try {
      await addCategory(name, type, icon, color, bgColor);
      await loadData();
    } catch (e) {
      console.error('Failed to add category:', e);
      showAlert('Gagal', 'Terjadi kesalahan saat menambahkan kategori.');
    }
  };

  const handleDeleteCategory = (id: string, name: string) => {
    const confirmMsg = `Yakin ingin menghapus kategori "${name}"?`;
    const performDelete = async () => {
      try {
        await deleteCategory(id);
        await loadData();
      } catch (e) {
        console.error('Failed to delete category:', e);
        showAlert('Gagal', 'Terjadi kesalahan saat menghapus kategori.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        performDelete();
      }
    } else {
      Alert.alert('Hapus Kategori', confirmMsg, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: performDelete },
      ]);
    }
  };

  // Account Actions
  const handleAddAccount = async (
    name: string,
    balance: number,
    color: string,
    icon: string
  ) => {
    try {
      await addAccount(name, balance, 'IDR', color, icon);
      await loadData();
    } catch (e) {
      console.error('Failed to add account:', e);
      showAlert('Gagal', 'Terjadi kesalahan saat menambahkan akun.');
    }
  };

  const handleUpdateAccount = async (id: string, name: string, balance: number) => {
    try {
      await updateAccount(id, name, balance);
      await loadData();
    } catch (e) {
      console.error('Failed to update account:', e);
      showAlert('Gagal', 'Terjadi kesalahan saat mengubah akun.');
    }
  };

  const handleDeleteAccount = (id: string, name: string) => {
    const confirmMsg = `Yakin ingin menghapus akun "${name}"?`;
    const performDelete = async () => {
      try {
        await deleteAccount(id);
        await loadData();
      } catch (e) {
        console.error('Failed to delete account:', e);
        showAlert('Gagal', 'Terjadi kesalahan saat menghapus akun.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        performDelete();
      }
    } else {
      Alert.alert('Hapus Akun', confirmMsg, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: performDelete },
      ]);
    }
  };

  const handleSaveUserName = async (newName: string) => {
    try {
      await saveUserName(newName);
      setUserName(newName);
    } catch (e) {
      console.error('Failed to save name:', e);
      showAlert('Gagal', 'Terjadi kesalahan saat menyimpan nama profil.');
    }
  };

  const handleAddReminder = async (title: string, dueDate: string, amount?: number) => {
    try {
      await addReminder(title, dueDate, amount);
      await loadData();
    } catch (e) {
      console.error('Failed to add reminder:', e);
      showAlert('Gagal', 'Terjadi kesalahan saat menambahkan pengingat.');
    }
  };

  const handleToggleReminder = async (id: string) => {
    try {
      await toggleReminder(id);
      await loadData();
    } catch (e) {
      console.error('Failed to toggle reminder:', e);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await deleteReminder(id);
      await loadData();
    } catch (e) {
      console.error('Failed to delete reminder:', e);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryYellowDark} />
        <Text style={styles.loadingText}>Memuat MyWallet...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.centerContainer}>
        <View style={styles.mobileWrapper}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primaryYellowDark]}
              />
            }
          >
            {/* Top Header */}
            <Header
              userName={userName}
              onProfilePress={() => setProfileModalVisible(true)}
              onNotificationPress={() => setNotifModalVisible(true)}
              onMenuPress={() => setAccountModalVisible(true)}
            />

            {/* Primary Yellow Balance Card (Reflects Selected Period) */}
            <BalanceCard
              balance={periodBalance}
              period={cardPeriodBadge}
              balanceLabel={balanceLabel}
              netCashflow={netCashflow}
              accountCount={accounts.length}
              onPeriodPress={() => {
                triggerHaptic('light');
                const modes: FilterMode[] = ['Day', 'Week', 'Month', 'Year'];
                const nextIdx = (modes.indexOf(filterMode) + 1) % modes.length;
                setFilterMode(modes[nextIdx]);
              }}
              onManageAccounts={() => {
                triggerHaptic('light');
                setAccountModalVisible(true);
              }}
            />

            {/* Quick Stats Duo for Selected Period */}
            <QuickStatsDuo
              expenses={periodExpenses}
              income={periodIncome}
              onExpensesPress={() =>
                showAlert(
                  'Pengeluaran',
                  `Total pengeluaran (${periodLabel}): Rp ${periodExpenses.toLocaleString(
                    'id-ID'
                  )}`
                )
              }
              onIncomePress={() =>
                showAlert(
                  'Pemasukan',
                  `Total pemasukan (${periodLabel}): Rp ${periodIncome.toLocaleString(
                    'id-ID'
                  )}`
                )
              }
            />

            {/* Interactive Period Navigator (Hari | Minggu | Bulan | Tahun) */}
            <MonthNavigator
              filterMode={filterMode}
              onFilterModeChange={setFilterMode}
              periodLabel={periodLabel}
              isCurrentPeriod={isCurrentPeriod}
              onPrev={handlePrevPeriod}
              onNext={handleNextPeriod}
              onResetToCurrent={handleResetToCurrent}
              selectedMonth={anchorDate.getMonth()}
              selectedYear={anchorDate.getFullYear()}
              onMonthChange={(monthIdx) => {
                const d = new Date(anchorDate);
                d.setMonth(monthIdx);
                setAnchorDate(d);
              }}
            />

            {/* Transactions Section */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Recent transaction</Text>
                <Text style={styles.sectionSubtitle}>{periodLabel}</Text>
              </View>
              <TouchableOpacity
                style={styles.manageAccHeaderBtn}
                onPress={() => setAccountModalVisible(true)}
              >
                <Ionicons name="wallet-outline" size={16} color={colors.textMain} />
                <Text style={styles.manageAccHeaderText}>Kelola Akun</Text>
              </TouchableOpacity>
            </View>

            {/* Transactions List */}
            <View style={styles.transactionsContainer}>
              {filteredTransactions.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="calendar-outline" size={44} color={colors.textMuted} />
                  <Text style={styles.emptyText}>Tidak ada transaksi</Text>
                  <Text style={styles.emptySubtext}>
                    Belum ada catatan pada {periodLabel}. Ketuk "+ Catat" untuk menambahkan transaksi.
                  </Text>
                </View>
              ) : (
                filteredTransactions.map((tr) => (
                  <TransactionItem
                    key={tr.id}
                    transaction={tr}
                    onLongPress={() => handleDeleteTransaction(tr.id, tr.note)}
                    onPress={() => handleDeleteTransaction(tr.id, tr.note)}
                  />
                ))
              )}
            </View>
          </ScrollView>

          {/* Floating Action Button (+ Catat Transaksi) */}
          <TouchableOpacity
            style={[styles.fab, shadows.activePill]}
            onPress={() => {
              setTransactionType('EXPENSE');
              setModalVisible(true);
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={24} color={colors.textMain} />
            <Text style={styles.fabText}>Catat</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal Add Transaction */}
      <AddTransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        accounts={accounts}
        categories={categories}
        initialType={transactionType}
        onSave={handleSaveTransaction}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onOpenManageAccounts={() => {
          setModalVisible(false);
          setAccountModalVisible(true);
        }}
      />

      {/* Modal Manage / Adjust Accounts */}
      <ManageAccountsModal
        visible={accountModalVisible}
        onClose={() => setAccountModalVisible(false)}
        accounts={accounts}
        onAddAccount={handleAddAccount}
        onUpdateAccount={handleUpdateAccount}
        onDeleteAccount={handleDeleteAccount}
      />

      {/* Modal Edit Profile / User Name */}
      <EditProfileModal
        visible={profileModalVisible}
        currentName={userName}
        onClose={() => setProfileModalVisible(false)}
        onSave={handleSaveUserName}
      />

      {/* Modal Notifikasi & Pengingat */}
      <NotificationModal
        visible={notifModalVisible}
        onClose={() => setNotifModalVisible(false)}
        periodLabel={periodLabel}
        reminders={reminders}
        onAddReminder={handleAddReminder}
        onToggleReminder={handleToggleReminder}
        onDeleteReminder={handleDeleteReminder}
      />

      {/* Modal Pop-up Sambutan & Input Nama Pengguna Baru */}
      <OnboardingModal
        visible={onboardingVisible}
        onSaveName={handleSaveOnboarding}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvas,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.canvas,
  },
  mobileWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.canvas,
    position: 'relative',
    ...Platform.select({
      web: {
        minHeight: '100vh' as any,
        boxShadow: '0 0 40px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  scrollContent: {
    paddingBottom: 90,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.canvas,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textBody,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
    marginTop: 2,
  },
  manageAccHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surfaceCard,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    ...shadows.soft,
  },
  manageAccHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMain,
  },
  transactionsContainer: {
    paddingHorizontal: 20,
  },
  emptyContainer: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radii.card,
    padding: 28,
    alignItems: 'center',
    marginTop: 8,
    ...shadows.soft,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMain,
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryYellow,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radii.pill,
    gap: 6,
  },
  fabText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
  },
});
