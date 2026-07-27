import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useColors } from '@/lib/theme';

const ORANGE = '#F97316';
const BLUE = '#3B82F6';
const GREEN = '#16A34A';

type DaySummary = {
  calorias: number;
  metaCalorias: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
  vasos: number;
  racha: number;
  diasPlan: number;
  totalDiasPlan: number;
  nombre: string;
};

function getSaludo(): string {
  const hora = new Date().getHours();
  if (hora < 12) return 'Buenos días';
  if (hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function HomeScreen() {
  const c = useColors();
  const [summary, setSummary] = useState<DaySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => { cargarResumen(); }, []);

  const cargarResumen = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoading(false); return; }
      const hoy = new Date().toISOString().split('T')[0];
      const hace7dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const [{ data: profile }, { data: consumo }, { data: agua }, { data: ejercicio }, { data: peso }] = await Promise.all([
        supabase.from('profiles').select('onboarding_data, nutrition_plan').eq('id', user.id).single(),
        supabase.from('consumo_diario').select('calorias, proteinas, carbohidratos, grasas').eq('user_id', user.id).eq('fecha', hoy),
        supabase.from('hidratacion_diaria').select('vasos').eq('user_id', user.id).eq('fecha', hoy).single(),
        supabase.from('ejercicio_completado').select('fecha, completado').eq('user_id', user.id).gte('fecha', hace7dias).order('fecha', { ascending: false }),
        supabase.from('progress_entries').select('fecha').eq('user_id', user.id).gte('fecha', hace7dias).order('fecha', { ascending: false }),
      ]);
      const totales = (consumo ?? []).reduce((acc: any, item: any) => ({
        calorias: acc.calorias + (item.calorias ?? 0),
        proteinas: acc.proteinas + (item.proteinas ?? 0),
        carbohidratos: acc.carbohidratos + (item.carbohidratos ?? 0),
        grasas: acc.grasas + (item.grasas ?? 0),
      }), { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 });
      let racha = 0;
      for (let i = 0; i < 7; i++) {
        const dia = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const tieneEjercicio = ejercicio?.find((e: any) => e.fecha === dia)?.completado ?? false;
        const tienePeso = peso?.some((p: any) => p.fecha === dia) ?? false;
        if (tieneEjercicio || tienePeso) racha++;
        else if (i > 0) break;
      }
      const onboarding = profile?.onboarding_data;
      const plan = profile?.nutrition_plan;
      setSummary({
        calorias: Math.round(totales.calorias),
        metaCalorias: plan?.caloriasDiarias ?? 2000,
        proteinas: Math.round(totales.proteinas),
        carbohidratos: Math.round(totales.carbohidratos),
        grasas: Math.round(totales.grasas),
        vasos: agua?.vasos ?? 0,
        racha,
        diasPlan: 7,
        totalDiasPlan: 30,
        nombre: onboarding?.nombre ?? 'tú',
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded || isLoading) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={GREEN} />
      </SafeAreaView>
    );
  }

  const progreso = summary ? Math.min(summary.calorias / summary.metaCalorias, 1) : 0;
  const pct = Math.round(progreso * 100);

  const navigate = (path: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(path as any);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getSaludo()}</Text>
            <Text style={styles.name}>{summary?.nombre ?? 'bienvenido'} 👋</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable style={styles.notifBtn} accessibilityLabel="Notificaciones" accessibilityRole="button">
              <Ionicons name="notifications-outline" size={18} color="rgba(255,255,255,0.4)" />
            </Pressable>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(summary?.nombre ?? 'U').charAt(0).toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <Pressable style={styles.heroCard} onPress={() => navigate('/mi-dia')}>
          <View style={styles.heroTop}>
            <View style={styles.heroTag}>
              <View style={styles.heroTagDot} />
              <Text style={styles.heroTagText}>HOY</Text>
            </View>
            <View>
              <Text style={styles.heroPlanLbl}>Plan activo</Text>
              <Text style={styles.heroPlanVal}>Día {summary?.diasPlan} de {summary?.totalDiasPlan}</Text>
            </View>
          </View>
          <View style={styles.heroNumRow}>
            <Text style={styles.heroNum}>{summary?.calorias.toLocaleString() ?? '0'}</Text>
            <Text style={styles.heroUnit}>kcal</Text>
          </View>
          <Text style={styles.heroSub}>de {summary?.metaCalorias.toLocaleString()} kcal · {pct}% completado</Text>
          <View style={styles.heroProgTrack}>
            <View style={[styles.heroProgFill, { width: `${pct}%` }]} />
          </View>
          <View style={styles.heroMacros}>
            <View style={styles.macro}><Text style={styles.macroVal}>{summary?.proteinas}g</Text><Text style={styles.macroLbl}>PROTEÍNAS</Text></View>
            <View style={[styles.macro, styles.macroBorder]}><Text style={styles.macroVal}>{summary?.carbohidratos}g</Text><Text style={styles.macroLbl}>CARBOS</Text></View>
            <View style={[styles.macro, styles.macroBorder]}><Text style={styles.macroVal}>{summary?.grasas}g</Text><Text style={styles.macroLbl}>GRASAS</Text></View>
          </View>
        </Pressable>

        <View style={styles.metricsRow}>
          <Pressable style={[styles.metricCard, styles.metricFire]} onPress={() => navigate('/progress')} accessibilityRole="button" accessibilityLabel="Ver racha de ejercicio">
            <View style={styles.metricTop}>
              <Text style={styles.metricLbl}>RACHA</Text>
              <Text style={{ fontSize: 13 }}>🔥</Text>
            </View>
            <Text style={[styles.metricBig, { color: ORANGE }]}>{summary?.racha ?? 0}</Text>
            <Text style={[styles.metricUnit, { color: 'rgba(249,115,22,0.5)' }]}>días seguidos</Text>
            <View style={styles.metricBars}>
              {Array.from({ length: 7 }, (_, i) => (
                <View key={i} style={[styles.mbar, i < (summary?.racha ?? 0) ? styles.mbarFireOn : styles.mbarFireOff]} />
              ))}
            </View>
          </Pressable>
          <Pressable style={[styles.metricCard, styles.metricWater]} onPress={() => navigate('/mi-dia')} accessibilityRole="button" accessibilityLabel="Ver hidratación del día">
            <View style={styles.metricTop}>
              <Text style={styles.metricLbl}>AGUA</Text>
              <Ionicons name="water-outline" size={13} color={BLUE} />
            </View>
            <Text style={[styles.metricBig, { color: BLUE }]}>{summary?.vasos ?? 0}</Text>
            <Text style={[styles.metricUnit, { color: 'rgba(59,130,246,0.5)' }]}>de 8 vasos</Text>
            <View style={styles.metricBars}>
              {Array.from({ length: 8 }, (_, i) => (
                <View key={i} style={[styles.mbar, i < (summary?.vasos ?? 0) ? styles.mbarWaterOn : styles.mbarWaterOff]} />
              ))}
            </View>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>Accesos rápidos</Text>
        <View style={styles.quickGrid}>
          {[
            { title: 'Mi plan', sub: 'Plan nutricional', icon: 'clipboard-list-outline', color: '#4ADE80', bg: 'rgba(22,163,74,0.12)', path: '/plan' },
            { title: 'Consulta antojo', sub: 'Evalúa el impacto', icon: 'search-outline', color: '#FB923C', bg: 'rgba(249,115,22,0.12)', path: '/craving-check' },
            { title: 'Calendario', sub: 'Tu historial', icon: 'calendar-outline', color: '#60A5FA', bg: 'rgba(59,130,246,0.12)', path: '/calendario' },
            { title: 'Mi historial', sub: 'Escaneos previos', icon: 'time-outline', color: '#C084FC', bg: 'rgba(168,85,247,0.12)', path: '/historial' },
          ].map((item) => (
            <Pressable key={item.path} style={styles.quickChip} onPress={() => navigate(item.path)} accessibilityRole="button" accessibilityLabel={item.title}>
              <View style={[styles.quickIcon, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon as any} size={14} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.quickTitle}>{item.title}</Text>
                <Text style={styles.quickSub}>{item.sub}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.starRow}>
          <Text style={styles.sectionLabel}>Función estrella</Text>
          <View style={styles.starBadge}><Text style={styles.starBadgeText}>ÚNICO EN MÉXICO</Text></View>
        </View>
        <AnimatedPressable haptic="medium" scaleValue={0.98} style={styles.madurezCard} onPress={() => navigate('/produce_scanner')} accessibilityRole="button" accessibilityLabel="Analizar fruta o verdura con IA">
          <View style={styles.madurezTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.madurezEyebrow}>INTELIGENCIA ARTIFICIAL</Text>
              <Text style={styles.madurezTitle}>Analizar fruta{'\n'}o verdura</Text>
              <Text style={styles.madurezSub}>Madurez, frescura y cuándo consumir</Text>
            </View>
            <View style={styles.madurezIcon}>
              <Ionicons name="leaf-outline" size={22} color="#4ADE80" />
            </View>
          </View>
          <View style={styles.madurezScale}>
            {[
              { color: '#4ADE80', label: 'Lista para comer', bg: 'rgba(74,222,128,0.07)', border: 'rgba(74,222,128,0.18)' },
              { color: '#FACC15', label: 'Casi lista', bg: 'rgba(250,204,21,0.06)', border: 'rgba(250,204,21,0.18)' },
              { color: '#FB923C', label: 'Espera 1-2 días', bg: 'rgba(251,146,60,0.06)', border: 'rgba(251,146,60,0.18)' },
              { color: '#F87171', label: 'No consumir', bg: 'rgba(248,113,113,0.06)', border: 'rgba(248,113,113,0.18)' },
            ].map((s) => (
              <View key={s.color} style={[styles.scalePill, { backgroundColor: s.bg, borderColor: s.border }]}>
                <View style={[styles.scaleDot, { backgroundColor: s.color }]} />
                <Text style={styles.scaleText}>{s.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.madurezCta}>
            <View style={styles.ctaIcon}><Ionicons name="camera-outline" size={18} color="#fff" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>Tomar foto ahora</Text>
              <Text style={styles.ctaSub}>Resultado instantáneo · Sin costo adicional</Text>
            </View>
            <Ionicons name="chevron-forward" size={15} color="rgba(255,255,255,0.35)" />
          </View>
        </AnimatedPressable>

        <Text style={styles.sectionLabel}>Más escáneres</Text>
        <View style={styles.moreGrid}>
          {[
            { title: 'Fotografiar etiqueta', icon: 'camera-outline', color: '#4ADE80', bg: 'rgba(22,163,74,0.12)', path: '/scanner' },
            { title: 'Código de barras', icon: 'barcode-outline', color: '#60A5FA', bg: 'rgba(59,130,246,0.12)', path: '/scanner' },
            { title: 'Escanear platillo', icon: 'restaurant-outline', color: '#FB923C', bg: 'rgba(249,115,22,0.12)', path: '/dish-scanner' },
          ].map((item) => (
            <Pressable key={item.title} style={styles.moreCard} onPress={() => navigate(item.path)} accessibilityRole="button" accessibilityLabel={item.title}>
              <View style={[styles.moreIcon, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon as any} size={14} color={item.color} />
              </View>
              <Text style={styles.moreTitle}>{item.title}</Text>
            </Pressable>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080B10' },
  centered: { flex: 1, backgroundColor: '#080B10', alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  greeting: { fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'PlusJakartaSans_400Regular', marginBottom: 3 },
  name: { fontSize: 26, fontFamily: 'PlusJakartaSans_700Bold', color: '#fff', letterSpacing: -0.8 },
  headerRight: { flexDirection: 'row', gap: 8 },
  notifBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 38, height: 38, borderRadius: 12, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontFamily: 'PlusJakartaSans_700Bold', color: '#fff' },
  heroCard: { marginHorizontal: 16, marginBottom: 10, backgroundColor: '#0D1F14', borderWidth: 0.5, borderColor: 'rgba(22,163,74,0.18)', borderRadius: 20, padding: 16 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  heroTag: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(74,222,128,0.1)', borderWidth: 0.5, borderColor: 'rgba(74,222,128,0.22)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  heroTagDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#4ADE80' },
  heroTagText: { fontSize: 10, fontFamily: 'PlusJakartaSans_700Bold', color: '#4ADE80', letterSpacing: 0.5 },
  heroPlanLbl: { fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'PlusJakartaSans_400Regular', textAlign: 'right' },
  heroPlanVal: { fontSize: 13, fontFamily: 'PlusJakartaSans_600SemiBold', color: 'rgba(255,255,255,0.75)', textAlign: 'right' },
  heroNumRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginBottom: 3 },
  heroNum: { fontSize: 46, fontFamily: 'PlusJakartaSans_700Bold', color: '#fff', letterSpacing: -2 },
  heroUnit: { fontSize: 13, fontFamily: 'PlusJakartaSans_500Medium', color: 'rgba(255,255,255,0.35)', paddingBottom: 8 },
  heroSub: { fontSize: 11, fontFamily: 'PlusJakartaSans_400Regular', color: 'rgba(255,255,255,0.3)', marginBottom: 10 },
  heroProgTrack: { height: 3, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 12, overflow: 'hidden' },
  heroProgFill: { height: 3, backgroundColor: GREEN, borderRadius: 2 },
  heroMacros: { flexDirection: 'row' },
  macro: { flex: 1 },
  macroBorder: { borderLeftWidth: 0.5, borderLeftColor: 'rgba(255,255,255,0.06)', paddingLeft: 14 },
  macroVal: { fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold', color: '#fff' },
  macroLbl: { fontSize: 9, fontFamily: 'PlusJakartaSans_500Medium', color: 'rgba(255,255,255,0.3)', marginTop: 1, letterSpacing: 0.5 },
  metricsRow: { flexDirection: 'row', gap: 8, marginHorizontal: 16, marginBottom: 10 },
  metricCard: { flex: 1, borderRadius: 16, padding: 12, borderWidth: 0.5 },
  metricFire: { backgroundColor: '#130A04', borderColor: 'rgba(249,115,22,0.18)' },
  metricWater: { backgroundColor: '#04090F', borderColor: 'rgba(59,130,246,0.18)' },
  metricTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 },
  metricLbl: { fontSize: 10, fontFamily: 'PlusJakartaSans_600SemiBold', color: 'rgba(255,255,255,0.3)', letterSpacing: 0.5 },
  metricBig: { fontSize: 26, fontFamily: 'PlusJakartaSans_700Bold', letterSpacing: -1 },
  metricUnit: { fontSize: 10, fontFamily: 'PlusJakartaSans_400Regular', marginTop: 1 },
  metricBars: { flexDirection: 'row', gap: 3, marginTop: 8 },
  mbar: { flex: 1, height: 3, borderRadius: 2 },
  mbarFireOn: { backgroundColor: ORANGE },
  mbarFireOff: { backgroundColor: 'rgba(249,115,22,0.1)' },
  mbarWaterOn: { backgroundColor: BLUE },
  mbarWaterOff: { backgroundColor: 'rgba(59,130,246,0.1)' },
  sectionLabel: { fontSize: 10, fontFamily: 'PlusJakartaSans_600SemiBold', color: 'rgba(255,255,255,0.25)', letterSpacing: 0.8, textTransform: 'uppercase', marginHorizontal: 16, marginBottom: 8 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginHorizontal: 16, marginBottom: 14 },
  quickChip: { width: '48.5%', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#0D1525', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: 10 },
  quickIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  quickTitle: { fontSize: 12, fontFamily: 'PlusJakartaSans_600SemiBold', color: 'rgba(255,255,255,0.8)' },
  quickSub: { fontSize: 9, fontFamily: 'PlusJakartaSans_400Regular', color: 'rgba(255,255,255,0.3)', marginTop: 1 },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 8 },
  starBadge: { backgroundColor: 'rgba(74,222,128,0.1)', borderWidth: 0.5, borderColor: 'rgba(74,222,128,0.2)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  starBadgeText: { fontSize: 9, fontFamily: 'PlusJakartaSans_700Bold', color: '#4ADE80', letterSpacing: 0.5 },
  madurezCard: { marginHorizontal: 16, marginBottom: 14, backgroundColor: '#060F08', borderWidth: 0.5, borderColor: 'rgba(74,222,128,0.18)', borderRadius: 20, padding: 16 },
  madurezTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 13 },
  madurezEyebrow: { fontSize: 9, fontFamily: 'PlusJakartaSans_700Bold', color: '#4ADE80', letterSpacing: 0.8, marginBottom: 5 },
  madurezTitle: { fontSize: 19, fontFamily: 'PlusJakartaSans_700Bold', color: '#fff', letterSpacing: -0.5, lineHeight: 24 },
  madurezSub: { fontSize: 11, fontFamily: 'PlusJakartaSans_400Regular', color: 'rgba(255,255,255,0.35)', marginTop: 4 },
  madurezIcon: { width: 50, height: 50, borderRadius: 15, backgroundColor: 'rgba(74,222,128,0.09)', borderWidth: 0.5, borderColor: 'rgba(74,222,128,0.18)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  madurezScale: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 13 },
  scalePill: { width: '48.5%', flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 9, padding: 7, borderWidth: 0.5 },
  scaleDot: { width: 6, height: 6, borderRadius: 3 },
  scaleText: { fontSize: 10, fontFamily: 'PlusJakartaSans_500Medium', color: 'rgba(255,255,255,0.6)' },
  madurezCta: { backgroundColor: GREEN, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 11 },
  ctaIcon: { width: 34, height: 34, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  ctaTitle: { fontSize: 14, fontFamily: 'PlusJakartaSans_700Bold', color: '#fff' },
  ctaSub: { fontSize: 10, fontFamily: 'PlusJakartaSans_400Regular', color: 'rgba(255,255,255,0.55)', marginTop: 1 },
  moreGrid: { flexDirection: 'row', gap: 7, marginHorizontal: 16, marginBottom: 8 },
  moreCard: { flex: 1, backgroundColor: '#0D1525', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 13, padding: 11, gap: 7 },
  moreIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  moreTitle: { fontSize: 10, fontFamily: 'PlusJakartaSans_600SemiBold', color: 'rgba(255,255,255,0.6)', lineHeight: 14 },
});
