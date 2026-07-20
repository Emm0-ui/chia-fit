import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, useFonts } from '@expo-google-fonts/plus-jakarta-sans';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { generateNutritionPlan } from '@/lib/generate-plan';
import { supabase } from '@/lib/supabase';
import { useColors } from '@/lib/theme';
import type { NutritionPlan } from '@/types/nutrition-plan';
import type { OnboardingData } from '@/types/onboarding';

const ORANGE = '#F97316';
const BLUE = '#3B82F6';
const PURPLE = '#A855F7';
const TABS = ['Nutrición', 'Ejercicio', 'Compras', 'Consejos'];
const DAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

function parseMacro(val: string | number | undefined): number {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  return parseInt(String(val).replace(/[^0-9]/g, ''), 10) || 0;
}

function openYoutubeSearch(query: string) {
  Linking.openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
}

export default function PlanScreen() {
  const c = useColors();
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [activeTab, setActiveTab] = useState(0);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => { loadPlan(); }, []);

  const loadPlan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError('Debes iniciar sesión para ver tu plan'); setIsLoading(false); return; }
      const { data: profile, error: profileError } = await supabase.from('profiles').select('nutrition_plan, onboarding_data').eq('id', user.id).single();
      if (profileError) {
        if (profileError.code === 'PGRST116') { router.replace('/onboarding/disclaimer'); return; }
        throw new Error(profileError.message);
      }
      if (profile?.nutrition_plan) { setPlan(profile.nutrition_plan as NutritionPlan); return; }
      if (!profile?.onboarding_data) { router.replace('/onboarding/disclaimer'); return; }
      const generated = await generateNutritionPlan(profile.onboarding_data as OnboardingData);
      setPlan(generated);
      await supabase.from('profiles').update({ nutrition_plan: generated }).eq('id', user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar el plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegeneratePlan = async () => {
    setIsRegenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError('Debes iniciar sesión para regenerar tu plan'); return; }
      await supabase.from('profiles').update({ nutrition_plan: null }).eq('id', user.id);
      router.replace('/onboarding/disclaimer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo regenerar el plan');
    } finally {
      setIsRegenerating(false);
    }
  };

  if (!fontsLoaded || isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <ActivityIndicator size="large" color={c.green} />
        <Text style={{ fontSize: 18, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary, marginTop: 16 }}>Generando tu plan personalizado...</Text>
        <Text style={{ fontSize: 14, color: c.textMuted }}>Esto puede tardar unos segundos</Text>
      </SafeAreaView>
    );
  }

  if (error || !plan) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 }}>
        <Ionicons name="alert-circle-outline" size={48} color={c.red} />
        <Text style={{ fontSize: 16, color: c.textMuted, textAlign: 'center' }}>{error ?? 'No se pudo cargar el plan'}</Text>
        <Pressable style={{ backgroundColor: c.green, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }} onPress={() => { setIsLoading(true); setError(null); loadPlan(); }}>
          <Text style={{ color: '#fff', fontFamily: 'PlusJakartaSans_600SemiBold' }}>Reintentar</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Volver">
          <Text style={{ color: c.textMuted, marginTop: 8 }}>Volver</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const prot = parseMacro(plan.macros?.proteinas);
  const carb = parseMacro(plan.macros?.carbohidratos);
  const gras = parseMacro(plan.macros?.grasas);
  const totalMacros = prot + carb + gras || 1;
  const dailyCal = typeof plan.caloriasDiarias === 'number' ? plan.caloriasDiarias : parseMacro(plan.caloriasDiarias);
  const currentDia = plan.planNutricional?.[selectedDay];
  const currentEjercicio = plan.rutinaEjercicio?.[selectedDay];
  const totalDayCal = currentDia?.comidas?.reduce((s, c) => s + (c.calorias ?? 0), 0) ?? 0;
  const calPct = dailyCal > 0 ? Math.min(Math.round((totalDayCal / dailyCal) * 100), 100) : 0;

  const MacroBar = ({ label, value, total, color }: { label: string; value: number; total: number; color: string }) => {
    const pct = total > 0 ? Math.min(Math.round((value / total) * 100), 100) : 0;
    return (
      <View style={{ gap: 5 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 12, color: c.textMuted }}>{label}</Text>
          <Text style={{ fontSize: 12, fontFamily: 'PlusJakartaSans_600SemiBold', color }}>{value}g · {pct}%</Text>
        </View>
        <View style={{ height: 6, backgroundColor: c.border, borderRadius: 3, overflow: 'hidden' }}>
          <View style={{ height: 6, width: `${pct}%`, backgroundColor: color, borderRadius: 3 }} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 }}>
        <Pressable style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.backButton, alignItems: 'center', justifyContent: 'center' }} onPress={() => router.replace('/(tabs)')}>
          <Ionicons name="arrow-back" size={20} color={c.backButtonIcon} />
        </Pressable>
        <Text style={{ fontSize: 17, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary }}>Tu plan ChIA Fit</Text>
        <Pressable style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.surfaceGreen, alignItems: 'center', justifyContent: 'center' }} onPress={handleRegeneratePlan} disabled={isRegenerating}>
          {isRegenerating ? <ActivityIndicator size="small" color={c.green} /> : <Ionicons name="refresh-outline" size={20} color={c.green} />}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }} showsVerticalScrollIndicator={false}>

        <Text style={{ fontSize: 15, color: c.textSecondary, lineHeight: 24 }}>{plan.resumen}</Text>

        {/* Calorías */}
        <View style={{ backgroundColor: c.surface, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 16, borderWidth: 0.5, borderColor: c.border }}>
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingRight: 4 }}>
            <Text style={{ fontSize: 32, fontFamily: 'PlusJakartaSans_700Bold', color: c.green }}>{dailyCal}</Text>
            <Text style={{ fontSize: 11, color: c.textMuted, textAlign: 'center' }}>kcal / día</Text>
          </View>
          <View style={{ width: 0.5, backgroundColor: c.border, alignSelf: 'stretch' }} />
          <View style={{ flex: 1, gap: 10 }}>
            <Text style={{ fontSize: 13, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary }}>Macronutrientes</Text>
            <MacroBar label="Proteínas" value={prot} total={totalMacros} color={ORANGE} />
            <MacroBar label="Carbohidratos" value={carb} total={totalMacros} color={BLUE} />
            <MacroBar label="Grasas" value={gras} total={totalMacros} color={PURPLE} />
          </View>
        </View>

        {/* Duración */}
        {plan.duracionRecomendada && (
          <View style={{ backgroundColor: c.surfaceGreen, borderRadius: 14, padding: 14, gap: 8, borderWidth: 0.5, borderColor: c.borderGreen }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="time-outline" size={20} color={c.green} />
              <Text style={{ fontSize: 14, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary }}>Duración recomendada</Text>
            </View>
            <Text style={{ fontSize: 14, color: c.textSecondary, lineHeight: 20 }}>{plan.duracionRecomendada}</Text>
          </View>
        )}

        {/* Reevaluar */}
        {plan.cuandoReevaluar && plan.cuandoReevaluar.length > 0 && (
          <View style={{ backgroundColor: c.surfaceOrange, borderRadius: 14, padding: 14, gap: 8, borderWidth: 0.5, borderColor: c.borderOrange }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="alert-circle-outline" size={20} color={ORANGE} />
              <Text style={{ fontSize: 14, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary }}>Reevalúa tu plan antes si...</Text>
            </View>
            {plan.cuandoReevaluar.map((senal, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingLeft: 4 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: ORANGE, marginTop: 7, flexShrink: 0 }} />
                <Text style={{ flex: 1, fontSize: 13, color: c.textSecondary, lineHeight: 19 }}>{senal}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Días */}
        <Text style={{ fontSize: 17, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary }}>Semana</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {(plan.planNutricional ?? []).map((dia, i) => (
            <Pressable key={i} style={{ alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: selectedDay === i ? c.green : c.surface, minWidth: 52, borderWidth: 0.5, borderColor: selectedDay === i ? c.green : c.border }} onPress={() => setSelectedDay(i)}>
              <Text style={{ fontSize: 14, fontFamily: 'PlusJakartaSans_700Bold', color: selectedDay === i ? '#fff' : c.textMuted }}>{DAYS[i] ?? `D${i + 1}`}</Text>
              <Text style={{ fontSize: 10, color: selectedDay === i ? 'rgba(255,255,255,0.7)' : c.textDisabled, marginTop: 2 }}>{dia.dia?.substring(0, 3)}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', backgroundColor: c.surface, borderRadius: 12, padding: 4, gap: 2, borderWidth: 0.5, borderColor: c.border }}>
          {TABS.map((tab, i) => (
            <Pressable key={tab} style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 9, backgroundColor: activeTab === i ? c.background : 'transparent' }} onPress={() => setActiveTab(i)}>
              <Text style={{ fontSize: 11, color: activeTab === i ? c.textPrimary : c.textMuted, fontFamily: activeTab === i ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_500Medium' }}>{tab}</Text>
            </Pressable>
          ))}
        </View>

        {/* Nutrición */}
        {activeTab === 0 && currentDia && (
          <View style={{ gap: 10 }}>
            {currentDia.comidas?.map((comida, i) => (
              <View key={i} style={{ backgroundColor: c.surface, borderRadius: 14, padding: 14, gap: 8, borderWidth: 0.5, borderColor: c.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.surfaceGreen, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={i === 0 ? 'sunny-outline' : i === (currentDia.comidas.length - 1) ? 'moon-outline' : 'restaurant-outline'} size={14} color={c.green} />
                  </View>
                  <Text style={{ flex: 1, fontSize: 14, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary }}>{comida.nombre}</Text>
                  <View style={{ backgroundColor: c.surfaceGreen, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ fontSize: 12, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.green }}>{comida.calorias} kcal</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: c.textMuted, lineHeight: 18 }}>{comida.descripcion}</Text>
                <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }} onPress={() => openYoutubeSearch(`como preparar ${comida.descripcion.split(',')[0]}`)}>
                  <Ionicons name="logo-youtube" size={14} color="#DC2626" />
                  <Text style={{ fontSize: 12, fontFamily: 'PlusJakartaSans_600SemiBold', color: '#DC2626' }}>Ver cómo prepararlo</Text>
                </Pressable>
              </View>
            ))}
            <View style={{ backgroundColor: c.surfaceGreen, borderRadius: 14, padding: 14, gap: 8, borderWidth: 0.5, borderColor: c.borderGreen }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 13, color: c.textSecondary, fontFamily: 'PlusJakartaSans_500Medium' }}>Total del día</Text>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 20, fontFamily: 'PlusJakartaSans_700Bold', color: c.green }}>{totalDayCal} kcal</Text>
                  <Text style={{ fontSize: 11, color: c.textMuted }}>objetivo: {dailyCal} kcal</Text>
                </View>
              </View>
              <View style={{ height: 6, backgroundColor: c.border, borderRadius: 3, overflow: 'hidden' }}>
                <View style={{ height: 6, width: `${calPct}%`, backgroundColor: totalDayCal <= dailyCal ? c.green : c.red, borderRadius: 3 }} />
              </View>
              <Text style={{ fontSize: 12, color: c.textMuted, textAlign: 'right' }}>{calPct}% del objetivo diario</Text>
            </View>
          </View>
        )}

        {/* Ejercicio */}
        {activeTab === 1 && currentEjercicio && (
          <View style={{ backgroundColor: c.surface, borderRadius: 14, padding: 16, gap: 12, borderWidth: 0.5, borderColor: c.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: c.textMuted, marginBottom: 4 }}>{currentEjercicio.dia}</Text>
                <Text style={{ fontSize: 16, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary }}>{currentEjercicio.actividad}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.surfaceGreen, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                <Ionicons name="time-outline" size={13} color={c.green} />
                <Text style={{ fontSize: 12, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.green }}>{currentEjercicio.duracion}</Text>
              </View>
            </View>
            <Text style={{ fontSize: 14, color: c.textSecondary, lineHeight: 21 }}>{currentEjercicio.descripcion}</Text>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }} onPress={() => openYoutubeSearch(`como hacer ${currentEjercicio.actividad} correctamente`)}>
              <Ionicons name="logo-youtube" size={14} color="#DC2626" />
              <Text style={{ fontSize: 12, fontFamily: 'PlusJakartaSans_600SemiBold', color: '#DC2626' }}>Ver tutorial del ejercicio</Text>
            </Pressable>
          </View>
        )}

        {/* Compras */}
        {activeTab === 2 && (
          <View style={{ gap: 10 }}>
            {plan.listaCompras?.map((cat) => (
              <View key={cat.categoria} style={{ backgroundColor: c.surface, borderRadius: 14, padding: 16, gap: 8, borderWidth: 0.5, borderColor: c.border }}>
                <Text style={{ fontSize: 14, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary }}>{cat.categoria}</Text>
                {cat.items?.map((item, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 2 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.green, marginTop: 7, flexShrink: 0 }} />
                    <Text style={{ flex: 1, fontSize: 13, color: c.textSecondary, lineHeight: 20 }}>{item}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Consejos */}
        {activeTab === 3 && (
          <View style={{ gap: 10 }}>
            {plan.consejos?.map((consejo, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', backgroundColor: c.surface, borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: c.border }}>
                <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: c.green, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Text style={{ color: '#fff', fontSize: 13, fontFamily: 'PlusJakartaSans_700Bold' }}>{i + 1}</Text>
                </View>
                <Text style={{ flex: 1, fontSize: 14, color: c.textSecondary, lineHeight: 20 }}>{consejo}</Text>
              </View>
            ))}
          </View>
        )}

        <Pressable style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: c.surfaceGreen, borderWidth: 1.5, borderColor: c.green, paddingVertical: 14, borderRadius: 14, marginTop: 8 }} onPress={() => router.push('/progress')}>
          <Ionicons name="trending-up-outline" size={20} color={c.green} />
          <Text style={{ color: c.green, fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold' }}>📈 Ver mi progreso</Text>
        </Pressable>

        <Pressable style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: c.green, paddingVertical: 16, borderRadius: 14 }} onPress={handleRegeneratePlan} disabled={isRegenerating}>
          {isRegenerating ? <ActivityIndicator color="#fff" /> : <>
            <Ionicons name="refresh-outline" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'PlusJakartaSans_600SemiBold' }}>Regenerar plan</Text>
          </>}
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
