import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, useFonts } from '@expo-google-fonts/plus-jakarta-sans';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SuccessAnimation } from '@/components/ui/success-animation';
import { analyzeProgress } from '@/lib/analyze-progress';
import { supabase } from '@/lib/supabase';
import { useColors } from '@/lib/theme';
import type { ProgressReport } from '@/types/progress-report';

const TONO_CONFIG = {
  celebracion: { color: '#16A34A', bg: 'rgba(22,163,74,0.1)',  border: 'rgba(22,163,74,0.25)',  emoji: '🎉', label: '¡Vas muy bien!' },
  aliento:     { color: '#F97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.25)', emoji: '💪', label: '¡Sigue adelante!' },
  redireccion: { color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)',border: 'rgba(156,163,175,0.2)', emoji: '🌿', label: 'Retomemos juntos' },
};

export default function ProgressScreen() {
  const c = useColors();
  const [pesoActual, setPesoActual] = useState('');
  const [cintura, setCintura] = useState('');
  const [ejercicioHoy, setEjercicioHoy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [report, setReport] = useState<ProgressReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [perfil, setPerfil] = useState<any>(null);
  const [diasEjercicio, setDiasEjercicio] = useState({ completados: 0, total: 7 });
  const [showSuccess, setShowSuccess] = useState(false);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [{ data: profileData }, { data: progressData }, { data: ejercicioData }] = await Promise.all([
      supabase.from('profiles').select('onboarding_data, nutrition_plan').eq('id', user.id).single(),
      supabase.from('progress_entries').select('*').eq('user_id', user.id).order('fecha', { ascending: false }).limit(8),
      supabase.from('ejercicio_completado').select('*').eq('user_id', user.id).gte('fecha', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
    ]);
    if (profileData) setPerfil(profileData);
    if (progressData) setHistorial(progressData);
    if (ejercicioData) {
      setDiasEjercicio({ completados: ejercicioData.filter(e => e.completado).length, total: 7 });
      const hoy = new Date().toISOString().split('T')[0];
      const hoyData = ejercicioData.find(e => e.fecha === hoy);
      if (hoyData) setEjercicioHoy(hoyData.completado);
    }
  };

  const toggleEjercicioHoy = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const nuevoEstado = !ejercicioHoy;
    setEjercicioHoy(nuevoEstado);
    await supabase.from('ejercicio_completado').upsert({ user_id: user.id, fecha: new Date().toISOString().split('T')[0], completado: nuevoEstado }, { onConflict: 'user_id,fecha' });
    cargarDatos();
  };

  const guardarYAnalizar = async () => {
    if (!pesoActual.trim()) return;
    setError(null);
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Debes iniciar sesión');
      const hoy = new Date().toISOString().split('T')[0];
      await supabase.from('progress_entries').upsert({ user_id: user.id, peso_kg: parseFloat(pesoActual), cintura_cm: cintura ? parseFloat(cintura) : null, fecha: hoy }, { onConflict: 'user_id,fecha' });
      await cargarDatos();
      setIsSaving(false);
      setIsLoading(true);
      const onboarding = perfil?.onboarding_data;
      const primerRegistro = historial[historial.length - 1];
      const result = await analyzeProgress({
        pesoInicial: primerRegistro?.peso_kg ?? parseFloat(pesoActual),
        pesoActual: parseFloat(pesoActual),
        pesoObjetivo: onboarding?.pesoObjetivo ?? parseFloat(pesoActual) - 5,
        objetivo: onboarding?.objetivo ?? 'bajar de peso',
        diasConPlan: historial.length * 7,
        diasEjercicioCompletados: diasEjercicio.completados,
        diasEjercicioTotal: diasEjercicio.total,
        nombre: onboarding?.nombre ?? 'tú',
      });
      setReport(result);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al analizar');
    } finally {
      setIsLoading(false);
      setIsSaving(false);
    }
  };

  if (!fontsLoaded) return null;

  const config = report ? TONO_CONFIG[report.tono] : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <SuccessAnimation visible={showSuccess} mensaje="¡Progreso guardado! 💪" />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 }}>
        <Pressable style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.backButton, alignItems: 'center', justifyContent: 'center' }} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Volver">
          <Ionicons name="arrow-back" size={20} color={c.backButtonIcon} />
        </Pressable>
        <Text style={{ fontSize: 17, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary }}>Mi progreso</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 14 }} showsVerticalScrollIndicator={false}>

        {/* Ejercicio hoy */}
        <View style={{ backgroundColor: c.surface, borderRadius: 14, padding: 16, gap: 12, borderWidth: 0.5, borderColor: c.border }}>
          <Text style={{ fontSize: 17, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary }}>Ejercicio de hoy</Text>
          <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, backgroundColor: ejercicioHoy ? c.surfaceGreen : c.backButton }} onPress={toggleEjercicioHoy} accessibilityRole="button" accessibilityLabel="Marcar ejercicio completado">
            <View style={{ width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: ejercicioHoy ? c.green : c.border, backgroundColor: ejercicioHoy ? c.green : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              {ejercicioHoy && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={{ flex: 1, fontSize: 14, color: ejercicioHoy ? c.green : c.textMuted, fontFamily: 'PlusJakartaSans_500Medium' }}>
              {ejercicioHoy ? '¡Ejercicio completado hoy! 💪' : 'Marcar ejercicio como completado'}
            </Text>
          </Pressable>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {Array.from({ length: 7 }, (_, i) => (
              <View key={i} style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: i < diasEjercicio.completados ? c.green : c.border }} />
            ))}
            <Text style={{ fontSize: 12, color: c.textMuted, marginLeft: 4 }}>{diasEjercicio.completados}/7 días esta semana</Text>
          </View>
        </View>

        {/* Registro peso */}
        <Text style={{ fontSize: 17, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary }}>Registra tu peso</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={{ fontSize: 12, color: c.textMuted, fontFamily: 'PlusJakartaSans_500Medium' }}>Peso actual (kg) *</Text>
            <TextInput style={{ backgroundColor: c.surface, borderRadius: 10, padding: 14, fontSize: 15, color: c.textPrimary, borderWidth: 1, borderColor: c.inputBorder }} placeholder="ej: 75.5" placeholderTextColor={c.textDisabled} value={pesoActual} onChangeText={setPesoActual} keyboardType="decimal-pad" accessibilityLabel="Peso actual en kilogramos" />
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={{ fontSize: 12, color: c.textMuted, fontFamily: 'PlusJakartaSans_500Medium' }}>Cintura (cm) opcional</Text>
            <TextInput style={{ backgroundColor: c.surface, borderRadius: 10, padding: 14, fontSize: 15, color: c.textPrimary, borderWidth: 1, borderColor: c.inputBorder }} placeholder="ej: 85" placeholderTextColor={c.textDisabled} value={cintura} onChangeText={setCintura} keyboardType="decimal-pad" accessibilityLabel="Cintura en centímetros" />
          </View>
        </View>

        {error && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.errorBg, padding: 12, borderRadius: 10 }}>
            <Ionicons name="alert-circle-outline" size={16} color={c.errorText} />
            <Text style={{ flex: 1, fontSize: 13, color: c.errorText }}>{error}</Text>
          </View>
        )}

        <Pressable style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: c.green, paddingVertical: 16, borderRadius: 14, opacity: (!pesoActual.trim() || isLoading || isSaving) ? 0.5 : 1 }} onPress={guardarYAnalizar} disabled={!pesoActual.trim() || isLoading || isSaving} accessibilityRole="button" accessibilityLabel="Guardar y analizar progreso">
          {isLoading || isSaving ? <ActivityIndicator color="#fff" /> : <>
            <Ionicons name="sparkles-outline" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'PlusJakartaSans_600SemiBold' }}>Guardar y analizar progreso</Text>
          </>}
        </Pressable>

        {/* Estado vacío */}
        {historial.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 24, gap: 12, backgroundColor: c.surface, borderRadius: 16, borderWidth: 0.5, borderColor: c.border }}>
            <Text style={{ fontSize: 48 }}>📊</Text>
            <Text style={{ fontSize: 16, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary }}>Sin registros aún</Text>
            <Text style={{ fontSize: 13, color: c.textMuted, textAlign: 'center', paddingHorizontal: 24, lineHeight: 20 }}>Registra tu peso hoy para empezar a ver tu progreso real con el tiempo.</Text>
          </View>
        )}

        {/* Historial */}
        {historial.length > 0 && (
          <>
            <Text style={{ fontSize: 17, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary }}>Historial de peso</Text>
            <View style={{ backgroundColor: c.surface, borderRadius: 14, overflow: 'hidden', borderWidth: 0.5, borderColor: c.border }}>
              {historial.slice(0, 4).map((entry, i) => (
                <View key={entry.id} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: i < historial.length - 1 ? 0.5 : 0, borderBottomColor: c.border }}>
                  <Text style={{ flex: 1, fontSize: 13, color: c.textMuted }}>{entry.fecha}</Text>
                  <Text style={{ fontSize: 14, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary }}>{entry.peso_kg} kg</Text>
                  {entry.cintura_cm && <Text style={{ fontSize: 13, color: c.textMuted, marginLeft: 12 }}>{entry.cintura_cm} cm</Text>}
                </View>
              ))}
            </View>
          </>
        )}

        {/* Reporte motivacional */}
        {report && config && (
          <View style={{ borderRadius: 16, borderWidth: 1.5, borderColor: config.border, backgroundColor: config.bg, padding: 20, gap: 10, alignItems: 'center' }}>
            <Text style={{ fontSize: 40 }}>{config.emoji}</Text>
            <Text style={{ fontSize: 18, fontFamily: 'PlusJakartaSans_700Bold', color: config.color }}>{config.label}</Text>
            <Text style={{ fontSize: 15, color: c.textSecondary, lineHeight: 22, textAlign: 'center' }}>{report.mensaje}</Text>
            <View style={{ width: '100%', height: 0.5, backgroundColor: c.border, marginVertical: 4 }} />
            {[
              { icon: 'trending-up-outline', text: report.ritmoActual },
              { icon: 'flag-outline', text: report.tiempoEstimadoObjetivo },
              { icon: 'bulb-outline', text: report.recomendacion },
            ].map((row, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, width: '100%' }}>
                <Ionicons name={row.icon as any} size={16} color={config.color} />
                <Text style={{ flex: 1, fontSize: 13, color: c.textSecondary, lineHeight: 19 }}>{row.text}</Text>
              </View>
            ))}
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(239,68,68,0.1)', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, marginTop: 4 }} onPress={() => Linking.openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(report.youtubeQuery)}`)} accessibilityRole="button" accessibilityLabel="Ver video motivacional en YouTube">
              <Ionicons name="logo-youtube" size={18} color="#DC2626" />
              <Text style={{ fontSize: 14, fontFamily: 'PlusJakartaSans_600SemiBold', color: '#DC2626' }}>Ver video motivacional</Text>
            </Pressable>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
