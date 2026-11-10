import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior for foreground (Expo SDK 58)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions and setup Android channel
 */
export async function registerForPushNotificationsAsync(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Pengingat Tagihan',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#F9D938',
        sound: 'default',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch (error) {
    console.warn('Could not request notification permissions:', error);
    return false;
  }
}

/**
 * Schedule a local notification for a reminder on exact target date & time
 */
export async function scheduleReminderNotification(
  title: string,
  dueDate: string,
  targetDate?: Date,
  amount?: number
): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    const granted = await registerForPushNotificationsAsync();
    if (!granted) return false;

    const formattedAmount = amount
      ? ` • Rp ${amount.toLocaleString('id-ID')}`
      : '';

    const now = Date.now();
    const targetTimestamp = targetDate ? targetDate.getTime() : now + 60 * 1000;
    const diffSeconds = Math.max(1, Math.round((targetTimestamp - now) / 1000));

    // 1. Schedule the main reminder notification at the chosen date/time
    if (diffSeconds > 5 && targetDate) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ Pengingat Tagihan: ${title}`,
          body: `Jatuh tempo sekarang (${dueDate})${formattedAmount}. Jangan lupa diselesaikan ya!`,
          sound: 'default',
          data: { title, dueDate, amount },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: targetDate,
          channelId: 'reminders',
        },
      });
    } else {
      // If time is within 5 seconds or now, trigger in 3 seconds
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ Pengingat Tagihan: ${title}`,
          body: `Jatuh tempo: ${dueDate}${formattedAmount}. Jangan lupa diselesaikan!`,
          sound: 'default',
          data: { title, dueDate, amount },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 3,
          channelId: 'reminders',
        },
      });
    }

    // 2. Also send an immediate confirmation notification (after 2 seconds) so user gets instant proof
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `✅ Pengingat Dijadwalkan: ${title}`,
        body: `Notifikasi aktif untuk jadwal: ${dueDate}. Pengingat akan muncul otomatis!`,
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
        channelId: 'reminders',
      },
    });

    return true;
  } catch (error) {
    console.warn('Failed to schedule reminder notification:', error);
    return false;
  }
}

/**
 * Send an immediate test notification
 */
export async function sendTestNotification(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    const granted = await registerForPushNotificationsAsync();
    if (!granted) return false;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Notifikasi MyWallet Berhasil!',
        body: 'Notifikasi pengingat tagihan Anda aktif dan siap mengingatkan Anda tepat waktu.',
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
        channelId: 'reminders',
      },
    });
    return true;
  } catch (error) {
    console.warn('Failed to send test notification:', error);
    return false;
  }
}
