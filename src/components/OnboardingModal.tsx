import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, shadows } from '../theme/tokens';
import { triggerHaptic } from '../utils/haptics';

interface OnboardingModalProps {
  visible: boolean;
  onSaveName: (name: string) => Promise<void> | void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ visible, onSaveName }) => {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleStart = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      triggerHaptic('warning');
      if (Platform.OS === 'web') alert('Silakan masukkan nama Anda untuk memulai.');
      else Alert.alert('Perhatian', 'Silakan masukkan nama Anda untuk memulai.');
      return;
    }

    setSubmitting(true);
    triggerHaptic('success');
    await onSaveName(trimmed);
    setSubmitting(false);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={() => {}}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.backdrop} />

        <View style={[styles.card, shadows.card]}>
          {/* App Logo */}
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>

          {/* Welcome Text */}
          <Text style={styles.title}>Selamat Datang di MyWallet</Text>
          <Text style={styles.subtitle}>
            Aplikasi pencatatan keuangan pribadi Anda yang rapi, cepat, dan 100% aman offline.
          </Text>

          {/* Name Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Siapa nama Anda?</Text>
            <View style={styles.inputRow}>
              <Ionicons name="person-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Masukkan nama atau panggilan..."
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
                autoFocus
                maxLength={25}
                returnKeyType="done"
                onSubmitEditing={handleStart}
              />
            </View>
          </View>

          {/* Privacy & Offline Badge */}
          <View style={styles.privacyBadge}>
            <Ionicons name="shield-checkmark" size={14} color={colors.mint} />
            <Text style={styles.privacyText}>
              Privasi terjamin. Data tersimpan offline hanya di HP Anda.
            </Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.startButton, shadows.soft]}
            onPress={handleStart}
            disabled={submitting}
            activeOpacity={0.85}
          >
            <Text style={styles.startButtonText}>
              {submitting ? 'Menyiapkan...' : 'Mulai Menggunakan MyWallet'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={colors.textMain} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  card: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: colors.surfaceCard,
    borderRadius: 28,
    padding: 26,
    alignItems: 'center',
  },
  logoWrapper: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: '#000000',
    overflow: 'hidden',
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    ...shadows.soft,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textMain,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textBody,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  inputSection: {
    width: '100%',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.cardSm,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMain,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(46, 196, 182, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.pill,
    marginBottom: 20,
  },
  privacyText: {
    fontSize: 11,
    color: '#0D7A6F',
    fontWeight: '600',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    backgroundColor: colors.primaryYellow,
    paddingVertical: 14,
    borderRadius: radii.pill,
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMain,
  },
});
