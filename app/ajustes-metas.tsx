import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, useFonts } from '@expo-google-fonts/plus-jakarta-sans';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useColors } from '@/lib/theme';

export const METAS_KEY = 'chiafit_metas_personalizadas';

export type MetasPersonalizadas = {
  caloriasOverride: number | null;
  metaVasos: number;
  unidades: "metric" | "imperial";
};

export const DEFAULT_METAS: MetasPersonalizadas = {
  caloriasOverride: null,
  metaVasos: 8,
  unidades: "metric",
};

export async function cargarMetas(): Promise<MetasPersonalizadas> {
  const saved = await AsyncStorage.getItem(METAS_KEY);
  if (saved) return JSON.parse(saved);
  return DEFAULT_METAS;
}

export default function AjustesMetasScreen() {
  const c = useColors();
  const [metas, setMetas] = useState<MetasPersonalizadas>(DEFAULT_METAS);
  const [caloriasInput, setCaloriasInput] = useState('');
  const [planCalorias, setPlanCalorias] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    const m = await cargarMetas();
    setMetas(m);
    if (m.caloriasOverride) setCaloriasInput(String(m.caloriasOverride));

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('nutrition_plan').eq('id', user.id).single();
      setPlanCalorias(profile?.nutrition_plan?.caloriasDiarias ?? null);
    }
  };

  const guardar = async () => {
    const cal = caloriasInput ? parseInt(caloriasInput) : null;
    if (cal && (cal < 800 || cal > 5000)) {
      Alert.alert('Valor inválido', 'La meta calórica debe estar entre 800 y 5,000 kcal');
      return;
    }
    const nuevasMetas = { ...metas, caloriasOverride: cal };
    setMetas(nuevasMetas);
    await AsyncStorage.setItem(METAS_KEY, JSON.stringify(nuevasMetas));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetCalorias = async () => {
    setCaloriasInput('');
    const nuevasMetas = { ...metas, caloriasOverride: null };
    setMetas(nuevasMetas);
    await AsyncStorage.setItem(METAS_KEY, JSON.stringify(nuevasMetas));
  };

  const setVasos = async (v: number) => {
    const nuevasMetas = { ...metas, metaVasos: v };
    setMetas(nuevasMetas);
    await AsyncStorage.setItem(METAS_KEY, JSON.stringify(nuevasMetas));
  };

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 }}>
        <Pressable style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.backButton, alignItems: 'center', justifyContent: 'center' }} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={c.backButtonIcon} />
        </Pressable>
        <Text style={{ fontSize: 17, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary }}>Mis metas</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} showsVerticalScrollIndicator={false}>

        {/* Meta calórica */}
        <View style={{ backgroundColor: c.surface, borderRadius: 16, padding: 16, borderWidth: 0.5, borderColor: c.border, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.surfaceGreen, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="flame-outline" size={20} color={c.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary }}>Meta calórica diaria</Text>
              {planCalorias && <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 1 }}>Tu plan recomienda {planCalorias} kcal/día</Text>}
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-end' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: c.textMuted, marginBottom: 6, fontFamily: 'PlusJakartaSans_500Medium' }}>Meta personalizada (kcal)</Text>
              <TextInput
                style={{ backgroundColor: c.inputBg, borderRadius: 10, padding: 14, fontSize: 16, color: c.textPrimary, borderWidth: 1, borderColor: c.inputBorder, fontFamily: 'PlusJakartaSans_500Medium' }}
                placeholder={planCalorias ? `${planCalorias} (del plan)` : 'Ej: 2000'}
                placeholderTextColor={c.textDisabled}
                value={caloriasInput}
                onChangeText={setCaloriasInput}
                keyboardType="number-pad"
              />
            </View>
            {caloriasInput ? (
              <Pressable style={{ padding: 14, borderRadius: 10, backgroundColor: c.errorBg, borderWidth: 0.5, borderColor: c.errorBorder }} onPress={resetCalorias}>
                <Ionicons name="refresh-outline" size={20} color={c.errorText} />
              </Pressable>
            ) : null}
          </View>

          <Pressable style={{ backgroundColor: saved ? c.surfaceGreen : c.green, paddingVertical: 14, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }} onPress={guardar}>
            <Ionicons name={saved ? 'checkmark-circle' : 'save-outline'} size={18} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold' }}>{saved ? '¡Guardado!' : 'Guardar meta'}</Text>
          </Pressable>
        </View>

        {/* Meta de hidratación */}
        <View style={{ backgroundColor: c.surface, borderRadius: 16, padding: 16, borderWidth: 0.5, borderColor: c.border, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.surfaceBlue, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="water-outline" size={20} color={c.blue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary }}>Meta de hidratación</Text>
              <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 1 }}>Actualmente: {metas.metaVasos} vasos/día</Text>
            </View>
          </View>

          <Text style={{ fontSize: 12, color: c.textMuted, fontFamily: 'PlusJakartaSans_500Medium' }}>Selecciona tu meta diaria de vasos de agua</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {[6, 7, 8, 9, 10, 11, 12].map((v) => (
              <Pressable
                key={v}
                style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, borderColor: metas.metaVasos === v ? c.blue : c.border, backgroundColor: metas.metaVasos === v ? c.surfaceBlue : 'transparent' }}
                onPress={() => setVasos(v)}>
                <Text style={{ fontSize: 14, fontFamily: metas.metaVasos === v ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_400Regular', color: metas.metaVasos === v ? c.blue : c.textMuted }}>{v} vasos</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Unidades de medida */}
        <View style={{ backgroundColor: c.surface, borderRadius: 16, padding: 16, borderWidth: 0.5, borderColor: c.border, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(168,85,247,0.12)', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="options-outline" size={20} color={c.purple} />
            </View>
            <Text style={{ fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary }}>Unidades de medida</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {([{ value: 'metric', label: 'Métrico', sub: 'kg · cm' }, { value: 'imperial', label: 'Imperial', sub: 'lb · in' }] as const).map((u) => (
              <Pressable key={u.value} style={{ flex: 1, alignItems: 'center', gap: 4, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: metas.unidades === u.value ? c.purple : c.border, backgroundColor: metas.unidades === u.value ? 'rgba(192,132,252,0.1)' : 'transparent' }} onPress={async () => { const n = { ...metas, unidades: u.value }; setMetas(n); await AsyncStorage.setItem(METAS_KEY, JSON.stringify(n)); }}>
                <Text style={{ fontSize: 15, fontFamily: 'PlusJakartaSans_700Bold', color: metas.unidades === u.value ? c.purple : c.textMuted }}>{u.label}</Text>
                <Text style={{ fontSize: 12, color: metas.unidades === u.value ? c.purple : c.textDisabled }}>{u.sub}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={{ backgroundColor: c.surfaceGreen, borderRadius: 12, padding: 12, flexDirection: 'row', gap: 10, alignItems: 'flex-start', borderWidth: 0.5, borderColor: c.borderGreen }}>
          <Ionicons name="information-circle-outline" size={16} color={c.green} />
          <Text style={{ flex: 1, fontSize: 12, color: c.green, lineHeight: 18 }}>Los cambios en tus metas se reflejan inmediatamente en la pantalla principal y en Mi día.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
