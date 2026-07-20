import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, useFonts } from '@expo-google-fonts/plus-jakarta-sans';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
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

type ScanRow = {
  id: string;
  nombre_producto: string;
  semaforo: TrafficLight;
  calificacion: Rating;
  reporte: NutritionReport;
  created_at: string;
};

export default function HistorialScreen() {
  const c = useColors();
  const [scans, setScans] = useState<ScanRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useFocusEffect(useCallback(() => { loadScans(); }, []));

  const loadScans = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsLoading(false); return; }
    const { data, error } = await supabase.from('scans').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (!error && data) setScans(data as ScanRow[]);
    setIsLoading(false);
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  if (!fontsLoaded || isLoading) {
    return <SafeAreaView style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" color={c.green} /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 }}>
        <Pressable style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.backButton, alignItems: 'center', justifyContent: 'center' }} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Volver">
          <Ionicons name="arrow-back" size={20} color={c.backButtonIcon} />
        </Pressable>
        <Text style={{ fontSize: 17, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary }}>Mi historial</Text>
        <View style={{ width: 40 }} />
      </View>

      {scans.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 }}>
          <Text style={{ fontSize: 72 }}>🔍</Text>
          <Text style={{ fontSize: 20, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary, textAlign: 'center' }}>Tu historial está vacío</Text>
          <Text style={{ fontSize: 14, color: c.textMuted, textAlign: 'center', lineHeight: 22 }}>Escanea una etiqueta, platillo o fruta y verdura para ver tu historial de análisis aquí.</Text>
          <View style={{ backgroundColor: c.surfaceGreen, borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: c.borderGreen, width: '100%' }}>
            <Text style={{ fontSize: 13, color: c.green, textAlign: 'center', fontFamily: 'PlusJakartaSans_500Medium' }}>💡 Toca "Escanear" en la barra inferior para empezar</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={scans}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => (
            <Pressable
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: c.surface, borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: c.border }}
              onPress={() => router.push({ pathname: '/scan-detalle', params: { reporte: JSON.stringify(item.reporte) } })}
              accessibilityRole="button"
              accessibilityLabel={`Ver detalles de ${item.nombre_producto}`}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: TRAFFIC_LIGHT_COLORS[item.semaforo] }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary }} numberOfLines={1}>{item.nombre_producto}</Text>
                  <Text style={{ fontSize: 13, color: c.textMuted, marginTop: 2 }}>{formatDate(item.created_at)}</Text>
                </View>
              </View>
              <Text style={{ fontSize: 14, fontFamily: 'PlusJakartaSans_700Bold', color: RATING_COLORS[item.calificacion], marginLeft: 8 }}>{item.calificacion}</Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
