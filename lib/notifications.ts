import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function scheduleWeeklyWeightReminder() {
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (Platform.OS !== 'android') return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌿 ChIA Fit',
      body: '¿Ya registraste tu peso esta semana? Lleva un registro de tu progreso real.',
      data: { screen: 'progress' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 2,
      hour: 9,
      minute: 0,
    },
  });
}

export async function scheduleDailyExerciseReminder(hour: number = 18) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '💪 ¿Completaste tu ejercicio hoy?',
      body: 'Recuerda marcar tu actividad física del día en ChIA Fit.',
      data: { screen: 'progress' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute: 0,
    },
  });
}

export async function scheduleDailyWaterReminder() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '💧 ¿Cómo va tu hidratación?',
      body: 'No olvides registrar tus vasos de agua del día en ChIA Fit.',
      data: { screen: 'mi-dia' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 14,
      minute: 0,
    },
  });
}

export async function sendInstantMotivation(mensaje: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌿 ChIA Fit',
      body: mensaje,
      data: { screen: 'progress' },
    },
    trigger: null,
  });
}
