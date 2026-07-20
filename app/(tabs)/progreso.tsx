import { PlusJakartaSans_400Regular, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, useFonts } from '@expo-google-fonts/plus-jakarta-sans';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/lib/theme';

export default function ProgresoTabScreen() {
  const c = useColors();
  const [fontsLoaded] = useFonts({ PlusJakartaSans_400Regular, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold });
  if (!fontsLoaded) return null;

  const OPCIONES = [
    { title: 'Mi progreso', sub: 'Registra peso, cintura y analiza tu avance', icon: 'trending-up-outline', color: '#4ADE80', bg: 'rgba(22,163,74,0.12)', path: '/progress' },
    { title: 'Mi día', sub: 'Resumen calórico e hidratación de hoy', icon: 'sunny-outline', color: '#FACC15', bg: 'rgba(250,204,21,0.12)', path: '/mi-dia' },
    { title: 'Mi calendario', sub: 'Historial de peso, ejercicio y agua', icon: 'calendar-outline', color: '#60A5FA', bg: 'rgba(59,130,246,0.12)', path: '/calendario' },
    { title: 'Mi historial', sub: 'Todos tus escaneos anteriores', icon: 'time-outline', color: '#C084FC', bg: 'rgba(192,132,252,0.12)', path: '/historial' },
    { title: 'Mi plan nutricional', sub: 'Ver y gestionar tu plan personalizado', icon: 'clipboard-list-outline', color: '#4ADE80', bg: 'rgba(22,163,74,0.12)', path: '/plan' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 26, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary, letterSpacing: -0.5 }}>Seguimiento</Text>
        <Text style={{ fontSize: 14, color: c.textMuted, marginTop: 4 }}>Monitorea tu progreso y hábitos</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }} showsVerticalScrollIndicator={false}>
        {OPCIONES.map((item) => (
          <Pressable key={item.title} style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: c.surface, borderRadius: 16, padding: 16, borderWidth: 0.5, borderColor: c.border, opacity: pressed ? 0.85 : 1 }]} onPress={() => router.push(item.path as any)}>
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: item.bg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary }}>{item.title}</Text>
              <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>{item.sub}</Text>
            </View>
            <Ionicons name='chevron-forward' size={16} color={c.textDisabled} />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});