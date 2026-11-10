import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Reminder } from '../types';
import { colors, radii, shadows } from '../theme/tokens';
import { scheduleReminderNotification, sendTestNotification } from '../utils/notifications';
import { triggerHaptic } from '../utils/haptics';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  periodLabel?: string;
  reminders: Reminder[];
  onAddReminder: (title: string, dueDate: string, amount?: number) => Promise<void> | void;
  onToggleReminder: (id: string) => Promise<void> | void;
  onDeleteReminder: (id: string) => Promise<void> | void;
}

const INDO_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const INDO_MONTHS = [
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

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
  reminders,
  onAddReminder,
  onToggleReminder,
  onDeleteReminder,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [isTestingNotif, setIsTestingNotif] = useState(false);

  // Date & Time states
  const [selectedDateTime, setSelectedDateTime] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // default: Besok
    d.setHours(9, 0, 0, 0); // default: 09:00 WIB
    return d;
  });

  // iOS Picker Modal state
  const [showIOSPicker, setShowIOSPicker] = useState(false);
  const [iosPickerMode, setIOSPickerMode] = useState<'date' | 'time'>('date');

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
    }).format(Math.abs(val));
  };

  const formatDateDisplay = (date: Date) => {
    const day = INDO_DAYS[date.getDay()];
    const d = date.getDate();
    const m = INDO_MONTHS[date.getMonth()];
    const y = date.getFullYear();
    return `${day}, ${d} ${m} ${y}`;
  };

  const formatTimeDisplay = (date: Date) => {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm} WIB`;
  };

  const getFullDueDateString = (date: Date) => {
    return `${formatDateDisplay(date)} pukul ${formatTimeDisplay(date)}`;
  };

  // Open Date Picker (Android & iOS)
  const handleOpenDatePicker = () => {
    triggerHaptic('light');
    if (Platform.OS === 'android') {
      try {
        DateTimePickerAndroid.open({
          value: selectedDateTime,
          mode: 'date',
          is24Hour: true,
          minimumDate: new Date(),
          onChange: (event: DateTimePickerEvent, date?: Date) => {
            if (event.type === 'set' && date) {
              const updated = new Date(selectedDateTime);
              updated.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
              setSelectedDateTime(updated);
              triggerHaptic('medium');
            }
          },
        });
      } catch (e) {
        console.warn('Android DatePicker error:', e);
      }
    } else if (Platform.OS === 'ios') {
      setIOSPickerMode('date');
      setShowIOSPicker(true);
    }
  };

  // Open Time Picker (Android & iOS)
  const handleOpenTimePicker = () => {
    triggerHaptic('light');
    if (Platform.OS === 'android') {
      try {
        DateTimePickerAndroid.open({
          value: selectedDateTime,
          mode: 'time',
          is24Hour: true,
          onChange: (event: DateTimePickerEvent, date?: Date) => {
            if (event.type === 'set' && date) {
              const updated = new Date(selectedDateTime);
              updated.setHours(date.getHours(), date.getMinutes(), 0, 0);
              setSelectedDateTime(updated);
              triggerHaptic('medium');
            }
          },
        });
      } catch (e) {
        console.warn('Android TimePicker error:', e);
      }
    } else if (Platform.OS === 'ios') {
      setIOSPickerMode('time');
      setShowIOSPicker(true);
    }
  };

  // Quick Preset Handlers
  const handlePreset = (type: 'today_night' | 'tomorrow_morning' | 'in_3_days' | 'end_month') => {
    triggerHaptic('light');
    const d = new Date();
    if (type === 'today_night') {
      d.setHours(19, 0, 0, 0); // Today 19:00
      if (d.getTime() < Date.now()) {
        d.setDate(d.getDate() + 1); // If 19:00 already passed, tomorrow 19:00
      }
    } else if (type === 'tomorrow_morning') {
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0); // Tomorrow 09:00
    } else if (type === 'in_3_days') {
      d.setDate(d.getDate() + 3);
      d.setHours(9, 0, 0, 0); // In 3 days 09:00
    } else if (type === 'end_month') {
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      d.setDate(lastDay);
      d.setHours(10, 0, 0, 0); // End of month 10:00
    }
    setSelectedDateTime(d);
  };

  const handleSaveReminder = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      if (Platform.OS === 'web') alert('Masukkan judul pengingat');
      else Alert.alert('Perhatian', 'Masukkan nama atau judul tagihan/pengingat');
      return;
    }

    const dueDateFormatted = getFullDueDateString(selectedDateTime);
    const rawDigits = amountStr.replace(/\D/g, '');
    const amount = rawDigits ? parseFloat(rawDigits) : undefined;

    triggerHaptic('success');
    await onAddReminder(trimmedTitle, dueDateFormatted, amount);

    // Schedule notification at exact target date and time + immediate confirmation!
    await scheduleReminderNotification(trimmedTitle, dueDateFormatted, selectedDateTime, amount);

    setTitle('');
    setAmountStr('');
    setShowAddForm(false);
  };

  const handleTestNotification = async () => {
    setIsTestingNotif(true);
    triggerHaptic('medium');
    const success = await sendTestNotification();
    setIsTestingNotif(false);
    if (!success && Platform.OS !== 'web') {
      Alert.alert(
        'Izin Notifikasi Diperlukan',
        'Mohon izinkan notifikasi di pengaturan HP Anda agar pengingat dapat berbunyi tepat waktu.'
      );
    }
  };

  const activeRemindersCount = reminders.filter((r) => !r.isCompleted).length;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => {
            setShowAddForm(false);
            setShowIOSPicker(false);
            onClose();
          }}
        />

        <View style={styles.sheetContainer}>
          <View style={styles.dragIndicator} />

          {/* Modal Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Pengingat & Notifikasi</Text>
              <Text style={styles.subtitle}>
                {activeRemindersCount > 0
                  ? `${activeRemindersCount} tagihan perlu diselesaikan`
                  : 'Semua tagihan telah diselesaikan'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                triggerHaptic('light');
                setShowAddForm(false);
                setShowIOSPicker(false);
                onClose();
              }}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={20} color={colors.textMain} />
            </TouchableOpacity>
          </View>

          {/* Notification Status Banner */}
          <View style={styles.notifBanner}>
            <View style={styles.notifBannerLeft}>
              <View style={styles.bellIconCircle}>
                <Ionicons name="notifications" size={18} color={colors.primaryYellowDark} />
              </View>
              <View style={styles.bannerTextCol}>
                <Text style={styles.bannerTitle}>Notifikasi Otomatis Aktif</Text>
                <Text style={styles.bannerDesc}>
                  Notifikasi akan berbunyi di HP Anda persis saat tanggal & jam pengingat tiba.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.testNotifBtn}
              onPress={handleTestNotification}
              disabled={isTestingNotif}
              activeOpacity={0.8}
            >
              <Ionicons name="paper-plane-outline" size={13} color={colors.textMain} />
              <Text style={styles.testNotifBtnText}>
                {isTestingNotif ? 'Mengirim...' : 'Tes Notif'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          >
            {/* Reminders Header Row */}
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionHeaderTitle}>Daftar Tagihan & Pengingat</Text>
              <TouchableOpacity
                style={styles.addReminderTrigger}
                onPress={() => {
                  triggerHaptic('light');
                  setShowAddForm(!showAddForm);
                }}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={showAddForm ? 'close-circle' : 'add-circle'}
                  size={16}
                  color={colors.textMain}
                />
                <Text style={styles.addReminderTriggerText}>
                  {showAddForm ? 'Batal' : '+ Tambah'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Inline Add Reminder Form */}
            {showAddForm && (
              <View style={styles.addFormCard}>
                <Text style={styles.formTitle}>Tambah Pengingat Tagihan Baru</Text>

                {/* Title Input */}
                <TextInput
                  style={styles.formInput}
                  placeholder="Judul (contoh: WiFi Indihome, Kost, Listrik)"
                  placeholderTextColor={colors.textMuted}
                  value={title}
                  onChangeText={setTitle}
                />

                {/* Date & Time Picker Section */}
                <Text style={styles.fieldSectionLabel}>Jadwal Jatuh Tempo & Jam:</Text>

                {/* Quick Presets */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.presetsRow}
                >
                  <TouchableOpacity
                    style={styles.presetChip}
                    onPress={() => handlePreset('today_night')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="time-outline" size={12} color={colors.textMain} />
                    <Text style={styles.presetChipText}>Nanti Malam (19:00)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.presetChip}
                    onPress={() => handlePreset('tomorrow_morning')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="sunny-outline" size={12} color={colors.textMain} />
                    <Text style={styles.presetChipText}>Besok Pagi (09:00)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.presetChip}
                    onPress={() => handlePreset('in_3_days')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="calendar-outline" size={12} color={colors.textMain} />
                    <Text style={styles.presetChipText}>3 Hari Lagi</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.presetChip}
                    onPress={() => handlePreset('end_month')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="wallet-outline" size={12} color={colors.textMain} />
                    <Text style={styles.presetChipText}>Akhir Bulan</Text>
                  </TouchableOpacity>
                </ScrollView>

                {/* Date and Time Selector Buttons */}
                <View style={styles.pickersDuoRow}>
                  {/* Date Button */}
                  <TouchableOpacity
                    style={styles.pickerSelectorBtn}
                    onPress={handleOpenDatePicker}
                    activeOpacity={0.8}
                  >
                    <View style={styles.pickerSelectorIconCircle}>
                      <Ionicons name="calendar" size={15} color={colors.primaryYellowDark} />
                    </View>
                    <View style={styles.pickerSelectorTextCol}>
                      <Text style={styles.pickerSelectorLabel}>Tanggal</Text>
                      <Text style={styles.pickerSelectorValue} numberOfLines={1}>
                        {formatDateDisplay(selectedDateTime)}
                      </Text>
                    </View>
                    <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
                  </TouchableOpacity>

                  {/* Time Button */}
                  <TouchableOpacity
                    style={styles.pickerSelectorBtn}
                    onPress={handleOpenTimePicker}
                    activeOpacity={0.8}
                  >
                    <View style={styles.pickerSelectorIconCircle}>
                      <Ionicons name="alarm" size={15} color={colors.primaryYellowDark} />
                    </View>
                    <View style={styles.pickerSelectorTextCol}>
                      <Text style={styles.pickerSelectorLabel}>Jam / Waktu</Text>
                      <Text style={styles.pickerSelectorValue} numberOfLines={1}>
                        {formatTimeDisplay(selectedDateTime)}
                      </Text>
                    </View>
                    <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                {/* Live Notification Schedule Badge */}
                <View style={styles.schedulePreviewBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.mint} />
                  <Text style={styles.schedulePreviewText}>
                    Alarm diset untuk: {getFullDueDateString(selectedDateTime)}
                  </Text>
                </View>

                {/* Amount Input */}
                <View style={styles.amountInputRow}>
                  <Text style={styles.currencyPrefix}>Rp</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="Nominal (opsional, contoh: 350.000)"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    value={amountStr}
                    onChangeText={(val) => setAmountStr(formatThousand(val))}
                  />
                </View>

                {/* Save Button */}
                <TouchableOpacity
                  style={[styles.saveReminderBtn, shadows.soft]}
                  onPress={handleSaveReminder}
                  activeOpacity={0.85}
                >
                  <Ionicons name="notifications" size={16} color={colors.textMain} />
                  <Text style={styles.saveReminderBtnText}>Simpan & Pasang Alarm Notifikasi</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* List of Reminders */}
            {reminders.length === 0 ? (
              <View style={styles.emptyReminders}>
                <Ionicons name="calendar-outline" size={36} color={colors.textMuted} />
                <Text style={styles.emptyRemindersText}>Belum ada pengingat tagihan aktif.</Text>
                <Text style={styles.emptyRemindersSubtext}>
                  Ketuk "+ Tambah" di atas untuk membuat jadwal tagihan Anda.
                </Text>
              </View>
            ) : (
              reminders.map((rem) => (
                <View
                  key={rem.id}
                  style={[
                    styles.reminderItem,
                    rem.isCompleted && styles.reminderItemCompleted,
                  ]}
                >
                  <TouchableOpacity
                    style={styles.checkboxTouch}
                    onPress={() => {
                      triggerHaptic('light');
                      onToggleReminder(rem.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={rem.isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={rem.isCompleted ? colors.mint : colors.primaryYellowDark}
                    />
                  </TouchableOpacity>

                  <View style={styles.reminderContent}>
                    <Text
                      style={[
                        styles.reminderTitle,
                        rem.isCompleted && styles.reminderTitleCompleted,
                      ]}
                    >
                      {rem.title}
                    </Text>
                    <View style={styles.metaRow}>
                      <View style={styles.dueDateBadge}>
                        <Ionicons name="alarm-outline" size={12} color={colors.textBody} />
                        <Text style={styles.dueDateText}>{rem.dueDate}</Text>
                      </View>
                      {rem.amount ? (
                        <Text style={styles.amountText}>{formatCurrency(rem.amount)}</Text>
                      ) : null}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteRemBtn}
                    onPress={() => {
                      triggerHaptic('warning');
                      onDeleteReminder(rem.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={17} color={colors.expenseCoral} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>

          <TouchableOpacity
            style={[styles.dismissButton, shadows.soft]}
            onPress={() => {
              triggerHaptic('light');
              onClose();
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.dismissButtonText}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* iOS Date/Time Picker Modal */}
      {Platform.OS === 'ios' && showIOSPicker && (
        <Modal
          visible={showIOSPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowIOSPicker(false)}
        >
          <View style={styles.iosModalOverlay}>
            <TouchableOpacity
              style={styles.iosModalBackdrop}
              activeOpacity={1}
              onPress={() => setShowIOSPicker(false)}
            />
            <View style={styles.iosPickerBox}>
              <View style={styles.iosPickerHeader}>
                <Text style={styles.iosPickerTitle}>
                  {iosPickerMode === 'date' ? 'Pilih Tanggal' : 'Pilih Jam / Waktu'}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowIOSPicker(false)}
                  style={styles.iosDoneBtn}
                >
                  <Text style={styles.iosDoneBtnText}>Selesai</Text>
                </TouchableOpacity>
              </View>

              <DateTimePicker
                value={selectedDateTime}
                mode={iosPickerMode}
                display="spinner"
                is24Hour={true}
                minimumDate={iosPickerMode === 'date' ? new Date() : undefined}
                onChange={(event: DateTimePickerEvent, date?: Date) => {
                  if (date) {
                    setSelectedDateTime(date);
                  }
                }}
                textColor={colors.textMain}
                style={styles.iosPicker}
              />
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
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
    maxHeight: '90%',
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
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
  },
  subtitle: {
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
  notifBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 217, 56, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(235, 196, 16, 0.35)',
    borderRadius: radii.cardSm,
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },
  notifBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  bellIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primaryYellowLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMain,
  },
  bannerDesc: {
    fontSize: 11,
    color: colors.textBody,
    marginTop: 1,
    lineHeight: 14,
  },
  testNotifBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryYellow,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
  },
  testNotifBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMain,
  },
  listContainer: {
    gap: 10,
    paddingBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  sectionHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textBody,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  addReminderTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
  },
  addReminderTriggerText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMain,
  },
  addFormCard: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.cardSm,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMain,
  },
  formInput: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: colors.textMain,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fieldSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textBody,
    marginTop: 2,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: radii.pill,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMain,
  },
  pickersDuoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pickerSelectorBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  pickerSelectorIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primaryYellowLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerSelectorTextCol: {
    flex: 1,
  },
  pickerSelectorLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  pickerSelectorValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMain,
    marginTop: 1,
  },
  schedulePreviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(46, 196, 182, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  schedulePreviewText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0D7A6F',
    flex: 1,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencyPrefix: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textBody,
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textMain,
    paddingVertical: 4,
  },
  saveReminderBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryYellow,
    borderRadius: radii.pill,
    paddingVertical: 11,
    marginTop: 2,
  },
  saveReminderBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMain,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.cardSm,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reminderItemCompleted: {
    opacity: 0.55,
    backgroundColor: '#F3F4F6',
  },
  checkboxTouch: {
    marginRight: 10,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 4,
  },
  reminderTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  dueDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dueDateText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textBody,
  },
  amountText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryYellowDark,
  },
  deleteRemBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyReminders: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 6,
  },
  emptyRemindersText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textBody,
  },
  emptyRemindersSubtext: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
  dismissButton: {
    backgroundColor: colors.primaryYellow,
    borderRadius: radii.pill,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  dismissButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMain,
  },
  // iOS Picker Modal styles
  iosModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  iosModalBackdrop: {
    flex: 1,
  },
  iosPickerBox: {
    backgroundColor: colors.surfaceCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iosPickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
  },
  iosDoneBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: colors.primaryYellow,
    borderRadius: radii.pill,
  },
  iosDoneBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMain,
  },
  iosPicker: {
    height: 200,
  },
});
