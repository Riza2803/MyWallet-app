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
import { Account } from '../types';
import { colors, radii, shadows } from '../theme/tokens';

interface ManageAccountsModalProps {
  visible: boolean;
  onClose: () => void;
  accounts: Account[];
  onAddAccount: (name: string, balance: number, color: string, icon: string) => Promise<void> | void;
  onUpdateAccount: (id: string, name: string, balance: number) => Promise<void> | void;
  onDeleteAccount: (id: string, name: string) => Promise<void> | void;
}

const ACCOUNT_ICONS = [
  'motorbike',
  'card-outline',
  'wallet-outline',
  'cash-outline',
  'phone-portrait-outline',
  'trending-up-outline',
  'business-outline',
] as const;

const ACCOUNT_COLORS = [
  { color: '#F9D938', name: 'Kuning' },
  { color: '#2EC4B6', name: 'Mint' },
  { color: '#7B73F6', name: 'Lavender' },
  { color: '#E84D60', name: 'Coral' },
  { color: '#1AC8DB', name: 'Cyan' },
  { color: '#F97316', name: 'Orange' },
];

export const ManageAccountsModal: React.FC<ManageAccountsModalProps> = ({
  visible,
  onClose,
  accounts,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  // Add form fields
  const [newName, setNewName] = useState('');
  const [newBalanceStr, setNewBalanceStr] = useState('');
  const [newIcon, setNewIcon] = useState<string>('card-outline');
  const [newColor, setNewColor] = useState(ACCOUNT_COLORS[0].color);

  // Edit form fields
  const [editName, setEditName] = useState('');
  const [editBalanceStr, setEditBalanceStr] = useState('');

  const formatThousand = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (!digits) return '';
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const handleStartEdit = (acc: Account) => {
    setEditingAccountId(acc.id);
    setEditName(acc.name);
    setEditBalanceStr(formatThousand(String(Math.round(acc.balance))));
  };

  const handleSaveEdit = async () => {
    if (!editingAccountId) return;
    const trimmed = editName.trim();
    if (!trimmed) {
      alert('Nama akun tidak boleh kosong');
      return;
    }
    const rawDigits = editBalanceStr.replace(/\D/g, '');
    const balance = rawDigits ? parseFloat(rawDigits) : 0;

    await onUpdateAccount(editingAccountId, trimmed, balance);
    setEditingAccountId(null);
  };

  const handleSaveNew = async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      alert('Nama akun tidak boleh kosong');
      return;
    }
    const rawDigits = newBalanceStr.replace(/\D/g, '');
    const balance = rawDigits ? parseFloat(rawDigits) : 0;

    await onAddAccount(trimmed, balance, newColor, newIcon);
    setNewName('');
    setNewBalanceStr('');
    setShowAddForm(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (accounts.length <= 1) {
      alert('Minimal harus ada 1 akun aktif');
      return;
    }
    onDeleteAccount(id, name);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => {
            setShowAddForm(false);
            setEditingAccountId(null);
            onClose();
          }}
        />

        <View style={styles.sheetContainer}>
          <View style={styles.dragIndicator} />

          {/* Modal Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.modalTitle}>Sesuaikan Akun & Dompet</Text>
              <Text style={styles.modalSub}>{accounts.length} akun tersimpan</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setShowAddForm(false);
                setEditingAccountId(null);
                onClose();
              }}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={20} color={colors.textMain} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Accounts List */}
            {accounts.map((acc) => {
              const isEditing = editingAccountId === acc.id;

              if (isEditing) {
                return (
                  <View key={acc.id} style={styles.editCard}>
                    <Text style={styles.editCardTitle}>Ubah / Sesuaikan Saldo</Text>
                    <TextInput
                      style={styles.inputField}
                      placeholder="Nama Akun"
                      placeholderTextColor={colors.textMuted}
                      value={editName}
                      onChangeText={setEditName}
                    />

                    <View style={styles.amountInputRow}>
                      <Text style={styles.currencyPrefix}>Rp</Text>
                      <TextInput
                        style={styles.amountInput}
                        keyboardType="number-pad"
                        placeholder="0"
                        placeholderTextColor={colors.textMuted}
                        value={editBalanceStr}
                        onChangeText={(val) => setEditBalanceStr(formatThousand(val))}
                      />
                    </View>

                    <View style={styles.editActionRow}>
                      <TouchableOpacity
                        style={styles.cancelEditBtn}
                        onPress={() => setEditingAccountId(null)}
                      >
                        <Text style={styles.cancelEditText}>Batal</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.saveEditBtn, shadows.soft]}
                        onPress={handleSaveEdit}
                      >
                        <Text style={styles.saveEditText}>Simpan</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }

              return (
                <View key={acc.id} style={styles.accountRow}>
                  <View style={[styles.accountIcon, { backgroundColor: acc.color + '33' }]}>
                    <AppIcon name={acc.icon || 'card-outline'} size={22} color={acc.color} />
                  </View>

                  <View style={styles.accountInfo}>
                    <Text style={styles.accountName}>{acc.name}</Text>
                    <Text style={styles.accountBalance}>{formatCurrency(acc.balance)}</Text>
                  </View>

                  <View style={styles.accountActions}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleStartEdit(acc)}
                    >
                      <Ionicons name="pencil-outline" size={18} color={colors.textBody} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleDelete(acc.id, acc.name)}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.expenseCoral} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {/* + Tambah Akun Baru Section */}
            {!showAddForm ? (
              <TouchableOpacity
                style={styles.addAccountTrigger}
                onPress={() => setShowAddForm(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle" size={20} color={colors.textMain} />
                <Text style={styles.addAccountTriggerText}>+ Tambah Akun / Dompet Baru</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.addAccountCard}>
                <Text style={styles.addCardTitle}>Tambah Akun Baru</Text>

                <TextInput
                  style={styles.inputField}
                  placeholder="Nama Akun (contoh: Bank Jago, Mandiri, Bibit)"
                  placeholderTextColor={colors.textMuted}
                  value={newName}
                  onChangeText={setNewName}
                />

                <Text style={styles.fieldLabel}>Saldo Awal</Text>
                <View style={styles.amountInputRow}>
                  <Text style={styles.currencyPrefix}>Rp</Text>
                  <TextInput
                    style={styles.amountInput}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    value={newBalanceStr}
                    onChangeText={(val) => setNewBalanceStr(formatThousand(val))}
                  />
                </View>

                {/* Icon Selection */}
                <Text style={styles.fieldLabel}>Pilih Ikon</Text>
                <View style={styles.iconSelectionRow}>
                  {ACCOUNT_ICONS.map((ic) => (
                    <TouchableOpacity
                      key={ic}
                      style={[
                        styles.iconChip,
                        newIcon === ic && { backgroundColor: newColor, borderColor: newColor },
                      ]}
                      onPress={() => setNewIcon(ic)}
                    >
                      <AppIcon
                        name={ic}
                        size={18}
                        color={newIcon === ic ? '#FFFFFF' : colors.textMain}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Color Selection */}
                <Text style={styles.fieldLabel}>Pilih Warna</Text>
                <View style={styles.colorSelectionRow}>
                  {ACCOUNT_COLORS.map((c) => (
                    <TouchableOpacity
                      key={c.color}
                      style={[
                        styles.colorChip,
                        { backgroundColor: c.color },
                        newColor === c.color && styles.colorChipActive,
                      ]}
                      onPress={() => setNewColor(c.color)}
                    >
                      {newColor === c.color && (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Action Buttons */}
                <View style={styles.editActionRow}>
                  <TouchableOpacity
                    style={styles.cancelEditBtn}
                    onPress={() => setShowAddForm(false)}
                  >
                    <Text style={styles.cancelEditText}>Batal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveEditBtn, shadows.soft]}
                    onPress={handleSaveNew}
                  >
                    <Text style={styles.saveEditText}>Simpan Akun</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
    maxHeight: '85%',
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
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
  },
  modalSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
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
    paddingBottom: 20,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.cardSm,
    padding: 14,
    marginBottom: 10,
  },
  accountIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 3,
  },
  accountBalance: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textBody,
  },
  accountActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: radii.round,
    backgroundColor: colors.surfaceCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addAccountTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radii.cardSm,
    paddingVertical: 14,
    marginTop: 8,
  },
  addAccountTriggerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMain,
  },
  editCard: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.cardSm,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: colors.primaryYellowDark,
  },
  editCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 12,
  },
  addAccountCard: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.cardSm,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 12,
  },
  inputField: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textMain,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textBody,
    marginBottom: 6,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textBody,
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
  },
  iconSelectionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  iconChip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorSelectionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  colorChip: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorChipActive: {
    borderWidth: 2,
    borderColor: colors.textMain,
  },
  editActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelEditBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelEditText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textBody,
  },
  saveEditBtn: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryYellow,
  },
  saveEditText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMain,
  },
});
