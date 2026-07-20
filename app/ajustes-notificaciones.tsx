import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, useFonts } from '@expo-google-fonts/plus-jakarta-sans';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Switch, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cancelNotification, requestNotificationPermission, scheduleDailyExerciseReminder, scheduleDailyWaterReminder, scheduleWeeklyWeightReminder } from '@/lib/notifications';
import { useColors } from '@/lib/theme';

const NOTIF_SETTINGS_KEY = 'chiafit_notif_settings';

type NotifSettings = {
  peso: boolean;
  pesoHora: number;
  ejercicio: boolean;
  ejercicioHora: number;
  agua: boolean;
  aguaHora: number;
};

const DEFAULT_SETTINGS: NotifSettings = {
  peso: true, pesoHora: 9,
  ejercicio: true, ejercicioHora: 18,
  agua: true, aguaHora: 14,
};

function formatHora(h: number): string {
  const ampm = h >= 12 ? 'pm' : 'am';
  const hora = h % 12 === 0 ? 12 : h % 12;
  return `${hora}:00 ${ampm}`;
}

export default function AjustesNotificacionesScreen() {
  const c = useColors();
  const [settings, setSettings] = useState<NotifSettings>(DEFAULT_SETTINGS);
  const [hasPermission, setHasPermission] = useState(false);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => { cargarAjustes(); }, []);

  const cargarAjustes = async () => {
    const granted = await requestNotificationPermission();
    setHasPermission(granted);
    const saved = await AsyncStorage.getItem(NOTIF_SETTINGS_KEY);
    if (saved) setSettings(JSON.parse(saved));
  };

  const guardarYAplicar = async (newSettings: NotifSettings) => {
    setSettings(newSettings);
    await AsyncStorage.setItem(NOTIF_SETTINGS_KEY, JSON.stringify(newSettings));
    if (newSettings.peso) await scheduleWeeklyWeightReminder(newSettings.pesoHora);
    else await cancelNotification('weight-reminder');
    if (newSettings.ejercicio) await scheduleDailyExerciseReminder(newSettings.ejercicioHora);
    else await cancelNotification('exercise-reminder');
    if (newSettings.agua) await scheduleDailyWaterReminder(newSettings.aguaHora);
    else await cancelNotification('water-reminder');
  };

  if (!fontsLoaded) return null;

  const NOTIFS = [
    { key: 'peso', horaKey: 'pesoHora', title: 'Recordatorio de peso', sub: 'Lunes por la mañana', icon: 'scale-outline', color: c.green, frecuencia: 'Semanal' },
    { key: 'ejercicio', horaKey: 'ejercicioHora', title: 'Recordatorio de ejercicio', sub: 'Todos los días', icon: 'fitness-outline', color: '#F97316', frecuencia: 'Diario' },
    { key: 'agua', horaKey: 'aguaHora', title: 'Recordatorio de hidratación', sub: 'Todos los días', icon: 'water-outline', color: '#3B82F6', frecuencia: 'Diario' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 }}>
        <Pressable style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.backButton, alignItems: 'center', justifyContent: 'center' }} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Volver">
          <Ionicons name="arrow-back" size={20} color={c.backButtonIcon} />
        </Pressable>
        <Text style={{ fontSize: 17, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary }}>Notificaciones</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} showsVerticalScrollIndicator={false}>
        {!hasPermission && (
          <View style={{ backgroundColor: c.errorBg, borderRadius: 12, padding: 14, flexDirection: 'row', gap: 10, alignItems: 'flex-start', borderWidth: 0.5, borderColor: c.errorBorder }}>
            <Ionicons name="alert-circle-outline" size={18} color={c.errorText} />
            <Text style={{ flex: 1, fontSize: 13, color: c.errorText, lineHeight: 18 }}>Las notificaciones están desactivadas. Actívalas desde Ajustes del teléfono.</Text>
          </View>
        )}

        {NOTIFS.map((notif) => {
          const isOn = settings[notif.key as keyof NotifSettings] as boolean;
          const hora = settings[notif.horaKey as keyof NotifSettings] as number;
          return (
            <View key={notif.key} style={{ backgroundColor: c.surface, borderRadius: 16, borderWidth: 0.5, borderColor: c.border, overflow: 'hidden' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
                <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: notif.color + '20', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={notif.icon as any} size={20} color={notif.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary }}>{notif.title}</Text>
                  <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 1 }}>{notif.frecuencia} · {notif.sub}</Text>
                </View>
                <Switch value={isOn} onValueChange={(val) => guardarYAplicar({ ...settings, [notif.key]: val })} trackColor={{ false: c.border, true: notif.color + '80' }} thumbColor={isOn ? notif.color : c.textDisabled} />
              </View>
              {isOn && (
                <View style={{ borderTopWidth: 0.5, borderTopColor: c.border, paddingHorizontal: 16, paddingVertical: 12 }}>
                  <Text style={{ fontSize: 12, color: c.textMuted, marginBottom: 10, fontFamily: 'PlusJakartaSans_500Medium' }}>Hora del recordatorio</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {[8, 9, 10, 12, 14, 16, 18, 20, 21].map((h) => (
                      <Pressable key={h} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: hora === h ? notif.color : c.border, backgroundColor: hora === h ? notif.color + '15' : 'transparent' }} onPress={() => guardarYAplicar({ ...settings, [notif.horaKey]: h })}>
                        <Text style={{ fontSize: 13, fontFamily: hora === h ? 'PlusJakartaSans_600SemiBold' : 'PlusJakartaSans_400Regular', color: hora === h ? notif.color : c.textMuted }}>{formatHora(h)}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
