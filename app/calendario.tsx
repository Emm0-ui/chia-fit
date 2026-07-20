import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, useFonts } from '@expo-google-fonts/plus-jakarta-sans';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useColors } from '@/lib/theme';

type DayData = {
  peso?: number;
  cintura?: number;
  ejercicio?: boolean;
  vasos?: number;
};

export default function CalendarioScreen() {
  const c = useColors();
  const [isLoading, setIsLoading] = useState(true);
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [dayData, setDayData] = useState<Record<string, DayData>>({});
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsLoading(false); return; }

    const hace90dias = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const [{ data: progreso }, { data: ejercicio }, { data: hidratacion }] = await Promise.all([
      supabase.from('progress_entries').select('fecha, peso_kg, cintura_cm').eq('user_id', user.id).gte('fecha', hace90dias),
      supabase.from('ejercicio_completado').select('fecha, completado').eq('user_id', user.id).gte('fecha', hace90dias),
      supabase.from('hidratacion_diaria').select('fecha, vasos').eq('user_id', user.id).gte('fecha', hace90dias),
    ]);

    const datos: Record<string, DayData> = {};
    const marked: Record<string, any> = {};

    progreso?.forEach(p => { if (!datos[p.fecha]) datos[p.fecha] = {}; datos[p.fecha].peso = p.peso_kg; datos[p.fecha].cintura = p.cintura_cm; });
    ejercicio?.forEach(e => { if (!datos[e.fecha]) datos[e.fecha] = {}; datos[e.fecha].ejercicio = e.completado; });
    hidratacion?.forEach(h => { if (!datos[h.fecha]) datos[h.fecha] = {}; datos[h.fecha].vasos = h.vasos; });

    Object.entries(datos).forEach(([fecha, data]) => {
      const dots = [];
      if (data.peso) dots.push({ key: 'peso', color: '#16A34A' });
      if (data.ejercicio) dots.push({ key: 'ejercicio', color: '#3B82F6' });
      if (data.vasos && data.vasos >= 8) dots.push({ key: 'agua', color: '#60A5FA' });
      if (dots.length > 0) marked[fecha] = { dots, marked: true };
    });

    setDayData(datos);
    setMarkedDates(marked);
    setIsLoading(false);
  };

  const selectedData = selectedDay ? dayData[selectedDay] : null;

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 }}>
        <Pressable style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.backButton, alignItems: 'center', justifyContent: 'center' }} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Volver">
          <Ionicons name="arrow-back" size={20} color={c.backButtonIcon} />
        </Pressable>
        <Text style={{ fontSize: 17, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary }}>Mi calendario</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={c.green} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Calendar
            onDayPress={(day: { dateString: string }) => setSelectedDay(day.dateString)}
            markedDates={{
              ...markedDates,
              ...(selectedDay ? { [selectedDay]: { ...markedDates[selectedDay], selected: true, selectedColor: c.green } } : {}),
            }}
            markingType="multi-dot"
            theme={{
              calendarBackground: c.background,
              backgroundColor: c.background,
              todayTextColor: c.green,
              selectedDayBackgroundColor: c.green,
              selectedDayTextColor: '#fff',
              arrowColor: c.green,
              dotColor: c.green,
              monthTextColor: c.textPrimary,
              dayTextColor: c.textPrimary,
              textDisabledColor: c.textDisabled,
              textDayFontFamily: 'PlusJakartaSans_500Medium',
              textMonthFontFamily: 'PlusJakartaSans_700Bold',
              textDayHeaderFontFamily: 'PlusJakartaSans_600SemiBold',
            }}
          />

          {/* Leyenda */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20, paddingVertical: 12, paddingHorizontal: 16 }}>
            {[
              { color: c.green, label: 'Peso registrado' },
              { color: c.blue, label: 'Ejercicio completado' },
              { color: c.blueLight, label: 'Meta de agua' },
            ].map(item => (
              <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color }} />
                <Text style={{ fontSize: 12, color: c.textMuted }}>{item.label}</Text>
              </View>
            ))}
          </View>

          {Object.keys(markedDates).length === 0 && (
            <View style={{ alignItems: 'center', paddingHorizontal: 32, paddingVertical: 24, gap: 12 }}>
              <Text style={{ fontSize: 56 }}>📅</Text>
              <Text style={{ fontSize: 18, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary, textAlign: 'center' }}>Sin actividad registrada</Text>
              <Text style={{ fontSize: 13, color: c.textMuted, textAlign: 'center', lineHeight: 20 }}>Registra tu peso, completa ejercicio o alcanza tu meta de agua para ver puntos en el calendario.</Text>
            </View>
          )}

          {/* Detalle del día */}
          {selectedDay && (
            <View style={{ backgroundColor: c.surface, borderRadius: 16, margin: 16, padding: 16, gap: 12, borderWidth: 0.5, borderColor: c.border }}>
              <Text style={{ fontSize: 15, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary }}>{selectedDay}</Text>
              {!selectedData ? (
                <Text style={{ fontSize: 14, color: c.textMuted, textAlign: 'center', paddingVertical: 8 }}>Sin registros para este día</Text>
              ) : (
                <View style={{ gap: 10 }}>
                  {selectedData.peso && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Ionicons name="scale-outline" size={18} color={c.green} />
                      <Text style={{ fontSize: 14, color: c.textSecondary }}>Peso: <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary }}>{selectedData.peso} kg</Text></Text>
                    </View>
                  )}
                  {selectedData.cintura && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Ionicons name="body-outline" size={18} color={c.green} />
                      <Text style={{ fontSize: 14, color: c.textSecondary }}>Cintura: <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary }}>{selectedData.cintura} cm</Text></Text>
                    </View>
                  )}
                  {selectedData.ejercicio !== undefined && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Ionicons name={selectedData.ejercicio ? 'checkmark-circle' : 'close-circle'} size={18} color={selectedData.ejercicio ? c.green : c.red} />
                      <Text style={{ fontSize: 14, color: c.textSecondary }}>Ejercicio: <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary }}>{selectedData.ejercicio ? 'Completado ✅' : 'No completado'}</Text></Text>
                    </View>
                  )}
                  {selectedData.vasos !== undefined && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Ionicons name="water-outline" size={18} color={c.blue} />
                      <Text style={{ fontSize: 14, color: c.textSecondary }}>Agua: <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary }}>{selectedData.vasos}/8 vasos</Text></Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
