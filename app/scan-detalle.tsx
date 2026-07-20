import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, useFonts } from '@expo-google-fonts/plus-jakarta-sans';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/lib/theme';
import type { NutritionReport, Rating, TrafficLight } from '@/types/nutrition-report';

const TRAFFIC_LIGHT_COLORS: Record<TrafficLight, string> = {
  verde: '#16A34A',
  amarillo: '#EAB308',
  rojo: '#EF4444',
};

const RATING_COLORS: Record<Rating, string> = {
  Excelente: '#16A34A',
  Bueno: '#84CC16',
  Regular: '#EAB308',
  'Evítalo': '#EF4444',
};

export default function ScanDetalleScreen() {
  const c = useColors();
  const params = useLocalSearchParams<{ reporte: string }>();

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  let report: NutritionReport | null = null;
  try { report = JSON.parse(params.reporte) as NutritionReport; } catch { report = null; }

  if (!fontsLoaded) return null;

  if (!report) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Text style={{ fontSize: 16, color: c.textMuted }}>No se pudo cargar el informe</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: c.green, fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold' }}>Volver</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const ratingColor = RATING_COLORS[report.calificacion];
  const semColor = TRAFFIC_LIGHT_COLORS[report.semaforo];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }} showsVerticalScrollIndicator={false}>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <Pressable style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.backButton, alignItems: 'center', justifyContent: 'center' }} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={c.backButtonIcon} />
          </Pressable>
          <Text style={{ fontSize: 17, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary }}>Informe guardado</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={{ fontSize: 24, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary, textAlign: 'center' }}>{report.nombreProducto}</Text>

        <View style={{ alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20, backgroundColor: semColor }}>
          <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'PlusJakartaSans_700Bold' }}>
            {report.semaforo === 'verde' ? '🟢 Saludable' : report.semaforo === 'amarillo' ? '🟡 Moderación' : '🔴 Poco saludable'}
          </Text>
        </View>

        <View style={{ alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 12, backgroundColor: ratingColor + '20', borderWidth: 0.5, borderColor: ratingColor }}>
          <Text style={{ fontSize: 18, fontFamily: 'PlusJakartaSans_700Bold', color: ratingColor }}>{report.calificacion}</Text>
        </View>

        <Text style={{ fontSize: 18, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary, marginTop: 4 }}>Nutrientes</Text>
        {report.nutrientes.map((nutrient, index) => (
          <View key={`${nutrient.nombre}-${index}`} style={{ backgroundColor: c.surface, borderRadius: 12, padding: 14, gap: 6, borderWidth: 0.5, borderColor: c.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary }}>{nutrient.nombre}</Text>
              <Text style={{ fontSize: 15, fontFamily: 'PlusJakartaSans_700Bold', color: ratingColor }}>{nutrient.cantidad}</Text>
            </View>
            <Text style={{ fontSize: 13, color: c.textMuted, lineHeight: 19 }}>{nutrient.descripcionSimple}</Text>
          </View>
        ))}

        <Text style={{ fontSize: 18, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary, marginTop: 4 }}>3 puntos clave</Text>
        {report.puntosClave.map((point, index) => (
          <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: ratingColor, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Text style={{ color: '#fff', fontSize: 13, fontFamily: 'PlusJakartaSans_700Bold' }}>{index + 1}</Text>
            </View>
            <Text style={{ flex: 1, fontSize: 14, color: c.textSecondary, lineHeight: 22 }}>{point}</Text>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
