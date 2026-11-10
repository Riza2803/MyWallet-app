import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppIcon } from './AppIcon';
import { Account, Category, TransactionType } from '../types';
import { colors, radii, shadows } from '../theme/tokens';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
  initialType?: TransactionType;
  onSave: (
    type: TransactionType,
    amount: number,
    categoryId: string,
    accountId: string,
    date: string,
    note?: string
  ) => void;
  onAddCategory?: (
    name: string,
    type: TransactionType,
    icon: string,
    color: string,
    bgColor: string
  ) => Promise<void> | void;
  onDeleteCategory?: (id: string, name: string) => Promise<void> | void;
  onOpenManageAccounts?: () => void;
}

const PRESET_ICONS = [
  'motorbike',
  'car-outline',
  'restaurant-outline',
  'cafe-outline',
  'cart-outline',
  'airplane-outline',
  'paw-outline',
  'gift-outline',
  'fitness-outline',
  'medical-outline',
  'cash-outline',
  'trending-up-outline',
  'briefcase-outline',
  'game-controller-outline',
  'receipt-outline',
  'home-outline',
  'book-outline',
] as const;

const PRESET_COLORS = [
  { color: '#E84D60', bgColor: '#FCEBE9' },
  { color: '#F97316', bgColor: '#FFF7ED' },
  { color: '#F9D938', bgColor: '#FDF6D6' },
  { color: '#2EC4B6', bgColor: '#E6F7F5' },
  { color: '#7B73F6', bgColor: '#EFEBFE' },
  { color: '#1AC8DB', bgColor: '#E3F8FB' },
  { color: '#F24379', bgColor: '#FDE7EE' },
];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  visible,
  onClose,
  accounts,
  categories,
  initialType = 'EXPENSE',
  onSave,
  onAddCategory,
  onDeleteCategory,
  onOpenManageAccounts,
}) => {
  const [type, setType] = useState<TransactionType>(initialType);

  React.useEffect(() => {
    if (visible && initialType) {
      setType(initialType);
    }
  }, [visible, initialType]);
  const [amountStr, setAmountStr] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [note, setNote] = useState('');

  // Category management states
  const [isManageMode, setIsManageMode] = useState(false);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState<string>('cart-outline');
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0]);

  const filteredCategories = categories.filter((c) => c.type === type);

  // Format real-time number with Indonesian thousand dots (e.g. 30000 -> 30.000)
  const formatThousand = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (!digits) return '';
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleAmountChange = (text: string) => {
    setAmountStr(formatThousand(text));
  };

  const handleSave = () => {
    const rawDigits = amountStr.replace(/\D/g, '');
    const amount = parseFloat(rawDigits);
    if (!amount || amount <= 0) {
      if (Platform.OS === 'web') {
        window.alert('Masukkan jumlah nominal yang valid');
      } else {
        Alert.alert('Perhatian', 'Masukkan jumlah nominal yang valid');
      }
      return;
    }
    const catId = selectedCategoryId || filteredCategories[0]?.id;
    const accId = selectedAccountId || accounts[0]?.id;
    if (!catId || !accId) {
      if (Platform.OS === 'web') {
        window.alert('Pilih kategori dan akun');
      } else {
        Alert.alert('Perhatian', 'Pilih kategori dan akun');
      }
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    onSave(type, amount, catId, accId, today, note);

    // Reset and close
    setAmountStr('');
    setNote('');
    setIsManageMode(false);
    setShowAddCategoryForm(false);
    onClose();
  };

  const handleCreateCategory = async () => {
    const trimmed = newCatName.trim();
    if (!trimmed) {
      if (Platform.OS === 'web') {
        window.alert('Masukkan nama kategori');
      } else {
        Alert.alert('Perhatian', 'Masukkan nama kategori');
      }
      return;
    }

    if (onAddCategory) {
      await onAddCategory(
        trimmed,
        type,
        newCatIcon,
        newCatColor.color,
        newCatColor.bgColor
      );
      setNewCatName('');
      setShowAddCategoryForm(false);
    }
  };

  const handleDeleteCat = (id: string, name: string) => {
    if (onDeleteCategory) {
      onDeleteCategory(id, name);
      if (selectedCategoryId === id) {
        setSelectedCategoryId('');
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => {
            setIsManageMode(false);
            setShowAddCategoryForm(false);
            onClose();
          }}
        />

        <View style={styles.sheetContainer}>
          {/* Top Drag Indicator */}
          <View style={styles.dragIndicator} />

          {/* Modal Header */}
          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>Catat Transaksi</Text>
            <TouchableOpacity
              onPress={() => {
                setIsManageMode(false);
                setShowAddCategoryForm(false);
                onClose();
              }}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={20} color={colors.textMain} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Type Switcher (Pill) */}
            <View style={styles.typeSwitcher}>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  type === 'EXPENSE' && { backgroundColor: colors.expenseCoral },
                ]}
                onPress={() => {
                  setType('EXPENSE');
                  setSelectedCategoryId('');
                  setShowAddCategoryForm(false);
                }}
              >
                <Text
                  style={[
                    styles.typeBtnText,
                    type === 'EXPENSE' ? styles.typeTextActive : styles.typeTextInactive,
                  ]}
                >
                  Pengeluaran
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  type === 'INCOME' && { backgroundColor: colors.incomeLavender },
                ]}
                onPress={() => {
                  setType('INCOME');
                  setSelectedCategoryId('');
                  setShowAddCategoryForm(false);
                }}
              >
                <Text
                  style={[
                    styles.typeBtnText,
                    type === 'INCOME' ? styles.typeTextActive : styles.typeTextInactive,
                  ]}
                >
                  Pemasukan
                </Text>
              </TouchableOpacity>
            </View>

            {/* Amount Input with Thousand Formatting */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nominal</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencyPrefix}>Rp</Text>
                <TextInput
                  style={styles.amountInput}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  value={amountStr}
                  onChangeText={handleAmountChange}
                />
              </View>
            </View>

            {/* Account Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pilih Akun / Dompet</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                {accounts.map((acc) => {
                  const isSelected = (selectedAccountId || accounts[0]?.id) === acc.id;
                  return (
                    <TouchableOpacity
                      key={acc.id}
                      style={[
                        styles.chip,
                        isSelected && { backgroundColor: colors.primaryYellow, borderColor: colors.primaryYellowDark },
                      ]}
                      onPress={() => setSelectedAccountId(acc.id)}
                    >
                      <AppIcon name={acc.icon || 'wallet-outline'} size={16} color={colors.textMain} />
                      <Text style={[styles.chipText, isSelected && { fontWeight: '700' }]}>{acc.name}</Text>
                    </TouchableOpacity>
                  );
                })}

                {onOpenManageAccounts && (
                  <TouchableOpacity
                    style={[styles.chip, { borderStyle: 'dashed', borderColor: colors.border }]}
                    onPress={onOpenManageAccounts}
                  >
                    <Ionicons name="settings-outline" size={14} color={colors.textBody} />
                    <Text style={styles.chipText}>+ / Kelola</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>

            {/* Category Selector with Add/Delete Header */}
            <View style={styles.inputGroup}>
              <View style={styles.categoryHeaderRow}>
                <Text style={styles.inputLabel}>Pilih Kategori</Text>
                <View style={styles.catActionButtons}>
                  <TouchableOpacity
                    style={[styles.manageCatBtn, isManageMode && styles.manageCatBtnActive]}
                    onPress={() => {
                      setIsManageMode(!isManageMode);
                      if (showAddCategoryForm) setShowAddCategoryForm(false);
                    }}
                  >
                    <Ionicons
                      name={isManageMode ? 'checkmark-circle-outline' : 'trash-outline'}
                      size={14}
                      color={isManageMode ? colors.mint : colors.expenseCoral}
                    />
                    <Text
                      style={[
                        styles.manageCatBtnText,
                        { color: isManageMode ? colors.mint : colors.expenseCoral },
                      ]}
                    >
                      {isManageMode ? 'Selesai' : 'Hapus Kategori'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Category Grid */}
              <View style={styles.categoryGrid}>
                {filteredCategories.map((cat) => {
                  const isSelected = (selectedCategoryId || filteredCategories[0]?.id) === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryItem,
                        isSelected && !isManageMode && { borderColor: cat.color, borderWidth: 2 },
                        isManageMode && styles.categoryItemManage,
                      ]}
                      onPress={() => {
                        if (isManageMode) {
                          handleDeleteCat(cat.id, cat.name);
                        } else {
                          setSelectedCategoryId(cat.id);
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      {isManageMode && (
                        <View style={styles.deleteBadge}>
                          <Ionicons name="trash" size={12} color="#FFFFFF" />
                        </View>
                      )}
                      <View style={[styles.categoryIconCircle, { backgroundColor: cat.bgColor }]}>
                        <AppIcon name={cat.icon} size={20} color={cat.color} />
                      </View>
                      <Text style={styles.categoryName} numberOfLines={1}>{cat.name}</Text>
                    </TouchableOpacity>
                  );
                })}

                {/* + Tambah Kategori Button */}
                {!isManageMode && (
                  <TouchableOpacity
                    style={[styles.categoryItem, styles.addCategoryBtn]}
                    onPress={() => setShowAddCategoryForm(!showAddCategoryForm)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.addCategoryIconCircle}>
                      <Ionicons
                        name={showAddCategoryForm ? 'close' : 'add'}
                        size={22}
                        color={colors.textMain}
                      />
                    </View>
                    <Text style={styles.addCategoryName}>
                      {showAddCategoryForm ? 'Tutup' : 'Tambah'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Inline Add Category Form */}
              {showAddCategoryForm && (
                <View style={styles.addFormCard}>
                  <Text style={styles.addFormTitle}>
                    Tambah Kategori {type === 'EXPENSE' ? 'Pengeluaran' : 'Pemasukan'}
                  </Text>

                  {/* Name Input */}
                  <TextInput
                    style={styles.addFormInput}
                    placeholder="Nama Kategori (contoh: Kopi, Langganan)"
                    placeholderTextColor={colors.textMuted}
                    value={newCatName}
                    onChangeText={setNewCatName}
                  />

                  {/* Icon Selector */}
                  <Text style={styles.addFormSubtitle}>Pilih Ikon</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.iconPickerRow}>
                    {PRESET_ICONS.map((iconName) => (
                      <TouchableOpacity
                        key={iconName}
                        style={[
                          styles.iconChoice,
                          newCatIcon === iconName && {
                            backgroundColor: newCatColor.color,
                            borderColor: newCatColor.color,
                          },
                        ]}
                        onPress={() => setNewCatIcon(iconName)}
                      >
                        <AppIcon
                          name={iconName}
                          size={18}
                          color={newCatIcon === iconName ? '#FFFFFF' : colors.textMain}
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Color Selector */}
                  <Text style={styles.addFormSubtitle}>Pilih Warna</Text>
                  <View style={styles.colorPickerRow}>
                    {PRESET_COLORS.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.colorChoice,
                          { backgroundColor: item.color },
                          newCatColor.color === item.color && styles.colorChoiceActive,
                        ]}
                        onPress={() => setNewCatColor(item)}
                      >
                        {newCatColor.color === item.color && (
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Submit Add Category */}
                  <TouchableOpacity
                    style={[styles.saveCatButton, shadows.soft]}
                    onPress={handleCreateCategory}
                  >
                    <Text style={styles.saveCatButtonText}>Simpan Kategori Baru</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Note Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Catatan (Opsional)</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="Contoh: Makan siang, belanja bulanan..."
                placeholderTextColor={colors.textMuted}
                value={note}
                onChangeText={setNote}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={[styles.submitButton, shadows.activePill]} onPress={handleSave}>
              <Text style={styles.submitButtonText}>Simpan Transaksi</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: colors.surfaceCard,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '88%',
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.round,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  typeSwitcher: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.pill,
    padding: 4,
    marginBottom: 18,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBtnText: {
    fontSize: 14,
  },
  typeTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  typeTextInactive: {
    color: colors.textBody,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textBody,
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.cardSm,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  currencyPrefix: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textBody,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: colors.textMain,
    paddingVertical: 2,
  },
  chipsRow: {
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipText: {
    fontSize: 13,
    color: colors.textMain,
    fontWeight: '500',
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  catActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  manageCatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceSubtle,
  },
  manageCatBtnActive: {
    backgroundColor: colors.mintBg,
  },
  manageCatBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryItem: {
    width: '31%',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.cardSm,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    position: 'relative',
  },
  categoryItemManage: {
    borderColor: colors.expenseCoral,
    borderStyle: 'dashed',
    borderWidth: 1,
  },
  deleteBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.expenseCoral,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  categoryIconCircle: {
    width: 38,
    height: 38,
    borderRadius: radii.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMain,
    textAlign: 'center',
  },
  addCategoryBtn: {
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  addCategoryIconCircle: {
    width: 38,
    height: 38,
    borderRadius: radii.round,
    backgroundColor: colors.primaryYellowLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  addCategoryName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textBody,
  },
  addFormCard: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.cardSm,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addFormTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 10,
  },
  addFormInput: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.textMain,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  addFormSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  iconPickerRow: {
    gap: 8,
    paddingBottom: 10,
  },
  iconChoice: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorPickerRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  colorChoice: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorChoiceActive: {
    borderWidth: 2,
    borderColor: colors.textMain,
  },
  saveCatButton: {
    backgroundColor: colors.primaryYellow,
    borderRadius: radii.pill,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveCatButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMain,
  },
  noteInput: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.cardSm,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textMain,
  },
  submitButton: {
    backgroundColor: colors.primaryYellow,
    borderRadius: radii.pill,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
  },
});
