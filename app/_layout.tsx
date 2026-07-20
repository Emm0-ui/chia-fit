import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, useFonts } from '@expo-google-fonts/plus-jakarta-sans';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import 'react-native-reanimated';
import { ThemeProvider, useTheme } from '@/contexts/theme-context';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { requestNotificationPermission, scheduleDailyExerciseReminder, scheduleDailyWaterReminder, scheduleWeeklyWeightReminder } from '@/lib/notifications';

export const unstable_settings = { anchor: 'index' };

const NOTIF_REQUESTED_KEY = 'chiafit_notif_requested';

function SplashScreen({ onFinish, isDark }: { onFinish: () => void; isDark: boolean }) {
  const bg = isDark ? '#080B10' : '#FFFFFF';
  const textColor = isDark ? '#fff' : '#111827';
  const subColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)';
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
      ]),
      Animated.delay(200),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(800),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(taglineOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start(() => onFinish());
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <Animated.View style={{ opacity, transform: [{ scale }], alignItems: 'center', gap: 8 }}>
        <Text style={{ fontSize: 64 }}>🌿</Text>
        <Text style={{ fontSize: 28, color: textColor, fontWeight: 'bold', letterSpacing: 0 }}>ChIA Fit</Text>
      </Animated.View>
      <Animated.Text style={{ opacity: taglineOpacity, fontSize: 15, color: subColor }}>
        Tu nutrición inteligente 🇲🇽
      </Animated.Text>
    </View>
  );
}

function AppContent({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { isDark } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => { solicitarNotificaciones(); }, []);

  const solicitarNotificaciones = async () => {
    try {
      const yasolicitado = await AsyncStorage.getItem(NOTIF_REQUESTED_KEY);
      if (yasolicitado) return;
      await AsyncStorage.setItem(NOTIF_REQUESTED_KEY, 'true');
      const granted = await requestNotificationPermission();
      if (granted) {
        await scheduleWeeklyWeightReminder();
        await scheduleDailyExerciseReminder();
        await scheduleDailyWaterReminder();
      }
    } catch (e) {
      console.log('Error notificaciones:', e);
    }
  };

  const handleSplashFinish = () => {
    setSplashDone(true);
    if (fontsLoaded) setShowSplash(false);
  };

  useEffect(() => {
    if (fontsLoaded && splashDone) setShowSplash(false);
  }, [fontsLoaded, splashDone]);

  if (showSplash) return <SplashScreen onFinish={handleSplashFinish} isDark={isDark} />;

  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', animationDuration: 200, gestureEnabled: true, gestureDirection: 'horizontal' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="plan" />
        <Stack.Screen name="progress" />
        <Stack.Screen name="mi-dia" />
        <Stack.Screen name="calendario" />
        <Stack.Screen name="historial" />
        <Stack.Screen name="craving-check" />
        <Stack.Screen name="scan-detalle" />
        <Stack.Screen name="logros" />
        <Stack.Screen name="ajustes-notificaciones" />
        <Stack.Screen name="ajustes-metas" />
        <Stack.Screen name="politica-privacidad" />
        <Stack.Screen name="scanner" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="dish-scanner" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="produce_scanner" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', animation: 'slide_from_bottom', title: 'Modal' }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <OfflineBanner />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  return (
    <ThemeProvider>
      <AppContent fontsLoaded={fontsLoaded} />
    </ThemeProvider>
  );
}
