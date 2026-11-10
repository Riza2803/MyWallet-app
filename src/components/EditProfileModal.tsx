import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, shadows } from '../theme/tokens';

interface EditProfileModalProps {
  visible: boolean;
  currentName: string;
  onClose: () => void;
  onSave: (name: string) => Promise<void> | void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  currentName,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    if (visible) {
      setName(currentName);
    }
  }, [visible, currentName]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      alert('Nama tidak boleh kosong');
      return;
    }
    await onSave(trimmed);
    onClose();
  };

  const previewInitial = (name || 'U').trim().charAt(0).toUpperCase();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={[styles.dialogCard, shadows.card]}>
          <View style={styles.headerRow}>
            <Text style={styles.dialogTitle}>Ubah Nama Profil</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={18} color={colors.textMain} />
            </TouchableOpacity>
          </View>

          {/* Avatar Preview */}
          <View style={styles.avatarPreview}>
            <Text style={styles.avatarInitial}>{previewInitial}</Text>
          </View>

          <Text style={styles.inputLabel}>Nama Pengguna</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Masukkan nama Anda..."
            placeholderTextColor={colors.textMuted}
            autoFocus
            maxLength={25}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveButton, shadows.soft]} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Simpan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surfaceCard,
    borderRadius: radii.card,
    padding: 22,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dialogTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textMain,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPreview: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryYellow,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    ...shadows.soft,
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textMain,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textBody,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMain,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceSubtle,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textBody,
  },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryYellow,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMain,
  },
});
