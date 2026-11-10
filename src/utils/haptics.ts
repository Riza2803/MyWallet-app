import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' = 'light') => {
  if (Platform.OS === 'web') return;
  try {
    switch (type) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
    }
  } catch {
    // Ignore haptic errors on unsupported hardware
  }
};
