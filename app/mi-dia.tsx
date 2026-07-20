import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, useFonts } from '@expo-google-fonts/plus-jakarta-sans';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SuccessAnimation } from '@/components/ui/success-animation';
import { estimateFood } from '@/lib/estimate-food';
import { supabase } from '@/lib/supabase';
import { cargarMetas } from '@/app/ajustes-metas';
import { useColors } from '@/lib/theme';

type ConsumoRow = {
  id: string;
  nombre: string;
  calorias: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
  created_at: string;
};

function fechaLocalHoy(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function MiDiaScreen() {
  const c = useColors();
  const [items, setItems] = useState<ConsumoRow[]>([]);
  const [metaCalorias, setMetaCalorias] = useState<number | null>(null);
  const [metaVasos, setMetaVasos] = useState(8);
  const [isLoading, setIsLoading] = useState(true);
  const [vasos, setVasos] = useState(0);
  const [showInput, setShowInput] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimaResult, setEstimaResult] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useFocusEffect(useCallback(() => { loadDia(); }, []));

  const loadDia = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsLoading(false); return; }
    const hoy = fechaLocalHoy();
    const [{ data: consumo }, { data: profile }, { data: hidratacion }] = await Promise.all([
      supabase.from('consumo_diario').select('*').eq('user_id', user.id).eq('fecha', hoy).order('created_at', { ascending: false }),
      supabase.from('profiles').select('nutrition_plan').eq('id', user.id).single(),
      supabase.from('hidratacion_diaria').select('vasos').eq('user_id', user.id).eq('fecha', hoy).single(),
    ]);
    if (consumo) setItems(consumo as ConsumoRow[]);
    const calorias = profile?.nutrition_plan?.caloriasDiarias;
    setMetaCalorias(typeof calorias === 'number' ? calorias : null);
    setVasos(hidratacion?.vasos ?? 0);
    const metas = await cargarMetas();
    setMetaVasos(metas.metaVasos ?? 8);
    setIsLoading(false);
  };

  const toggleVaso = async (index: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const nuevoValor = index < vasos ? index : index + 1;
    setVasos(nuevoValor);
    await supabase.from('hidratacion_diaria').upsert({ user_id: user.id, fecha: fechaLocalHoy(), vasos: nuevoValor, updated_at: new Date().toISOString() }, { onConflict: 'user_id,fecha' });
  };

  const handleEstimar = async () => {
    if (!inputText.trim()) return;
    setIsEstimating(true);
    setEstimaResult(null);
    try {
      const result = await estimateFood(inputText.trim());
      setEstimaResult(result);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo estimar');
    } finally {
      setIsEstimating(false);
    }
  };

  const handleAgregarEstima = async () => {
    if (!estimaResult) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('consumo_diario').insert({
      user_id: user.id,
      nombre: estimaResult.nombre,
      calorias: estimaResult.calorias,
      proteinas: estimaResult.proteinas,
      carbohidratos: estimaResult.carbohidratos,
      grasas: estimaResult.grasas,
      fecha: fechaLocalHoy(),
    });
    setInputText('');
    setEstimaResult(null);
    setShowInput(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1800);
    loadDia();
  };

  const handleDelete = (item: ConsumoRow) => {
    Alert.alert('Eliminar', `¿Quitar "${item.nombre}" de tu día?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => { await supabase.from('consumo_diario').delete().eq('id', item.id); loadDia(); } },
    ]);
  };

  const totales = items.reduce((acc, item) => ({
    calorias: acc.calorias + item.calorias,
    proteinas: acc.proteinas + item.proteinas,
    carbohidratos: acc.carbohidratos + item.carbohidratos,
    grasas: acc.grasas + item.grasas,
  }), { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 });

  const progreso = metaCalorias ? Math.min(totales.calorias / metaCalorias, 1) : 0;
  const formatHora = (iso: string) => new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  if (!fontsLoaded || isLoading) {
    return <SafeAreaView style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" color={c.green} /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <SuccessAnimation visible={showSuccess} mensaje="¡Alimento agregado! 🥗" />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 }}>
        <Pressable style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.backButton, alignItems: 'center', justifyContent: 'center' }} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Volver">
          <Ionicons name="arrow-back" size={20} color={c.backButtonIcon} />
        </Pressable>
        <Text style={{ fontSize: 17, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary }}>Mi día</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={{ backgroundColor: c.surfaceGreen, borderRadius: 20, padding: 20, margin: 16, alignItems: 'center', borderWidth: 0.5, borderColor: c.borderGreen }}>
            <Text style={{ fontSize: 44, fontFamily: 'PlusJakartaSans_700Bold', color: c.green }}>{totales.calorias}</Text>
            <Text style={{ fontSize: 14, color: c.textMuted, marginTop: 2 }}>{metaCalorias ? `de ${metaCalorias} kcal de tu meta` : 'calorías consumidas hoy'}</Text>
            {metaCalorias && (
              <View style={{ width: '100%', height: 6, backgroundColor: c.border, borderRadius: 3, marginTop: 14, overflow: 'hidden' }}>
                <View style={{ height: 6, width: `${progreso * 100}%`, backgroundColor: totales.calorias <= metaCalorias ? c.green : c.red, borderRadius: 3 }} />
              </View>
            )}
            <View style={{ flexDirection: 'row', gap: 24, marginTop: 16 }}>
              {[{ val: totales.proteinas, lbl: 'Proteínas' }, { val: totales.carbohidratos, lbl: 'Carbos' }, { val: totales.grasas, lbl: 'Grasas' }].map(m => (
                <View key={m.lbl} style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 17, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary }}>{m.val}g</Text>
                  <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>{m.lbl}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ backgroundColor: c.surfaceBlue, borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 16, gap: 12, borderWidth: 0.5, borderColor: c.borderBlue }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="water-outline" size={20} color={c.blueLight} />
              <Text style={{ flex: 1, fontSize: 15, fontFamily: 'PlusJakartaSans_700Bold', color: c.blueLight }}>Hidratación</Text>
              <Text style={{ fontSize: 14, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.blue }}>{vasos}/{metaVasos} vasos</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {Array.from({ length: metaVasos }, (_, i) => (
                <TouchableOpacity key={i} onPress={() => toggleVaso(i)} style={{ padding: 8 }} activeOpacity={0.6}>
                  <Ionicons name={i < vasos ? 'water' : 'water-outline'} size={28} color={i < vasos ? c.blue : c.border} />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ fontSize: 12, color: c.textMuted, textAlign: 'center' }}>
              {vasos === 0 ? 'Toca cada gotita cuando tomes un vaso 💧' : vasos < metaVasos / 2 ? '¡Buen inicio! 💪' : vasos < metaVasos ? '¡Casi llegas! 🌊' : '¡Meta completada! 🎉'}
            </Text>
          </View>

          <View style={{ marginHorizontal: 16, marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 17, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary }}>Alimentos del día</Text>
              <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.surfaceGreen, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 0.5, borderColor: c.borderGreen }} onPress={() => setShowInput(!showInput)} accessibilityRole="button" accessibilityLabel="Agregar alimento">
                <Ionicons name={showInput ? 'close' : 'add'} size={16} color={c.green} />
                <Text style={{ fontSize: 13, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.green }}>{showInput ? 'Cancelar' : 'Agregar'}</Text>
              </Pressable>
            </View>

            {showInput && (
              <View style={{ backgroundColor: c.surface, borderRadius: 14, padding: 14, gap: 10, borderWidth: 0.5, borderColor: c.border, marginBottom: 10 }}>
                <Text style={{ fontSize: 13, color: c.textMuted, fontFamily: 'PlusJakartaSans_500Medium' }}>Describe lo que comiste y la IA estimará las calorías</Text>
                <TextInput style={{ backgroundColor: c.inputBg, borderRadius: 10, padding: 14, fontSize: 15, color: c.textPrimary, borderWidth: 1, borderColor: c.inputBorder }} placeholder="Ej: 2 tacos de canasta..." placeholderTextColor={c.textDisabled} value={inputText} onChangeText={setInputText} multiline accessibilityLabel="Descripción del alimento" />
                {estimaResult && (
                  <View style={{ backgroundColor: c.surfaceGreen, borderRadius: 10, padding: 12, gap: 6, borderWidth: 0.5, borderColor: c.borderGreen }}>
                    <Text style={{ fontSize: 14, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary }}>{estimaResult.nombre}</Text>
                    <Text style={{ fontSize: 22, fontFamily: 'PlusJakartaSans_700Bold', color: c.green }}>{estimaResult.calorias} kcal</Text>
                    <Text style={{ fontSize: 12, color: c.textMuted }}>{estimaResult.proteinas}g prot · {estimaResult.carbohidratos}g carbos · {estimaResult.grasas}g grasas</Text>
                    <Text style={{ fontSize: 11, color: c.textMuted, fontStyle: 'italic' }}>{estimaResult.nota}</Text>
                    <Pressable style={{ backgroundColor: c.green, paddingVertical: 12, borderRadius: 10, alignItems: 'center' }} onPress={handleAgregarEstima} accessibilityRole="button" accessibilityLabel="Agregar a mi día">
                      <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'PlusJakartaSans_600SemiBold' }}>Agregar a mi día</Text>
                    </Pressable>
                  </View>
                )}
                <Pressable style={{ backgroundColor: isEstimating || !inputText.trim() ? c.border : c.green, paddingVertical: 14, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }} onPress={handleEstimar} disabled={isEstimating || !inputText.trim()} accessibilityRole="button" accessibilityLabel="Estimar con IA">
                  {isEstimating ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="sparkles-outline" size={18} color="#fff" />}
                  <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold' }}>{isEstimating ? 'Estimando...' : 'Estimar con IA'}</Text>
                </Pressable>
              </View>
            )}

            {items.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 32, gap: 8 }}>
                <Ionicons name="restaurant-outline" size={48} color={c.textDisabled} />
                <Text style={{ fontSize: 15, color: c.textMuted, fontFamily: 'PlusJakartaSans_500Medium' }}>Aún no hay alimentos registrados</Text>
                <Text style={{ fontSize: 13, color: c.textDisabled, textAlign: 'center' }}>Escanea un platillo o agrégalo manualmente</Text>
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                {items.map((item) => (
                  <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: c.surface, borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: c.border }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary }} numberOfLines={1}>{item.nombre}</Text>
                      <Text style={{ fontSize: 13, color: c.textMuted, marginTop: 2 }}>{item.calorias} kcal · {formatHora(item.created_at)}</Text>
                    </View>
                    <Pressable style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.errorBg, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }} onPress={() => handleDelete(item)} accessibilityRole="button" accessibilityLabel={`Eliminar ${item.nombre}`}>
                      <Ionicons name="trash-outline" size={18} color={c.errorText} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
