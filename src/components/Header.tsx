import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, shadows } from '../theme/tokens';

interface HeaderProps {
  userName?: string;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
  onMenuPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName = 'Riza',
  onProfilePress,
  onNotificationPress,
  onMenuPress,
}) => {
  const initial = (userName || 'U').trim().charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.profileSection}
        onPress={onProfilePress}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.greeting}>Welcome back</Text>
          <View style={styles.userNameRow}>
            <Text style={styles.userName}>{userName || 'Pengguna'}</Text>
            <Ionicons name="pencil-sharp" size={11} color={colors.textMuted} style={styles.pencilIcon} />
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.actionSection}>
        <TouchableOpacity
          style={[styles.actionButton, shadows.soft]}
          onPress={onNotificationPress}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={20} color={colors.textMain} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, shadows.soft]}
          onPress={onMenuPress}
          activeOpacity={0.7}
        >
          <Ionicons name="menu-outline" size={22} color={colors.textMain} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: radii.round,
    backgroundColor: colors.primaryYellow,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.soft,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textMain,
  },
  textContainer: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    color: colors.textMain,
    fontWeight: '700',
  },
  pencilIcon: {
    marginLeft: 5,
    marginTop: 1,
  },
  actionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: radii.round,
    backgroundColor: colors.surfaceCard,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.expenseCoral,
    borderWidth: 1.5,
    borderColor: colors.surfaceCard,
  },
});
