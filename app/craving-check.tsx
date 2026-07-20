import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, useFonts } from '@expo-google-fonts/plus-jakarta-sans';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Paywall from '@/app/components/paywall';
import { analyzeCraving } from '@/lib/analyze-craving';
import { useColors } from '@/lib/theme';
import type { CravingReport } from '@/types/craving-report';

const IMPACT_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; emoji: string }> = {
  bajo:     { label: 'Impacto bajo',     color: '#16A34A', bg: 'rgba(22,163,74,0.1)',   border: 'rgba(22,163,74,0.3)',   emoji: '🟢' },
  moderado: { label: 'Impacto moderado', color: '#EA580C', bg: 'rgba(234,88,12,0.1)',   border: 'rgba(234,88,12,0.3)',   emoji: '🟡' },
  alto:     { label: 'Impacto alto',     color: '#DC2626', bg: 'rgba(220,38,38,0.1)',   border: 'rgba(220,38,38,0.3)',   emoji: '🔴' },
};

export default function CravingCheckScreen() {
  const c = useColors();
  const [descripcion, setDescripcion] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<CravingReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  const handleAnalyze = async () => {
    if (!descripcion.trim() || isAnalyzing) return;
    setError(null);
    try {
      setIsAnalyzing(true);
      const result = await analyzeCraving(descripcion.trim());
      setReport(result);
    } catch (err) {
      if (err instanceof Error && err.name === 'LimitError') { setLimitReached(true); return; }
      setError(err instanceof Error ? err.message : 'Error al analizar');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => { setDescripcion(''); setReport(null); setError(null); setLimitReached(false); };

  if (!fontsLoaded) return null;

  if (limitReached) {
    return <Paywall mensaje="Alcanzaste tus 20 escaneos gratuitos de este mes." onVolver={() => { setLimitReached(false); router.back(); }} />;
  }

  if (report) {
    const config = IMPACT_CONFIG[report.impactoNivel];
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }} showsVerticalScrollIndicator={false}>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <Pressable style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.backButton, alignItems: 'center', justifyContent: 'center' }} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Volver">
              <Ionicons name="arrow-back" size={20} color={c.backButtonIcon} />
            </Pressable>
            <Text style={{ fontSize: 17, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary }}>Análisis de consumo</Text>
            <View style={{ width: 40 }} />
          </View>

          <Text style={{ fontSize: 26, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary, textAlign: 'center' }}>{report.alimentoIdentificado}</Text>

          <View style={{ borderRadius: 16, borderWidth: 1.5, borderColor: config.border, backgroundColor: config.bg, padding: 24, alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 36 }}>{config.emoji}</Text>
            <Text style={{ fontSize: 18, fontFamily: 'PlusJakartaSans_700Bold', color: config.color }}>{config.label}</Text>
            <Text style={{ fontSize: 15, color: c.textMuted }}>~{report.caloriasEstimadas} kcal</Text>
          </View>

          <View style={{ backgroundColor: c.surface, borderRadius: 14, padding: 16, borderWidth: 0.5, borderColor: c.border }}>
            <Text style={{ fontSize: 15, color: c.textSecondary, lineHeight: 22 }}>{report.mensaje}</Text>
          </View>

          <Text style={{ fontSize: 18, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary, marginTop: 4 }}>Cómo compensarlo</Text>
          {report.comoCompensar.map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.green, marginTop: 6, flexShrink: 0 }} />
              <Text style={{ flex: 1, fontSize: 14, color: c.textSecondary, lineHeight: 20 }}>{item}</Text>
            </View>
          ))}

          <Text style={{ fontSize: 18, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary, marginTop: 4 }}>Para tu siguiente comida</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: c.surfaceGreen, borderRadius: 14, padding: 16, borderWidth: 0.5, borderColor: c.borderGreen }}>
            <Ionicons name="restaurant-outline" size={18} color={c.green} />
            <Text style={{ flex: 1, fontSize: 14, color: c.textSecondary, lineHeight: 20 }}>{report.sugerenciasProximaComida}</Text>
          </View>

          <Pressable style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: c.green, paddingVertical: 16, borderRadius: 14, marginTop: 4 }} onPress={handleReset}>
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'PlusJakartaSans_600SemiBold' }}>Consultar otro alimento</Text>
          </Pressable>

        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 }}>
          <Pressable style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.backButton, alignItems: 'center', justifyContent: 'center' }} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Volver">
            <Ionicons name="arrow-back" size={20} color={c.backButtonIcon} />
          </Pressable>
          <Text style={{ fontSize: 17, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary }}>Consulta tu antojo</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40, gap: 16, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: c.surfaceGreen, alignItems: 'center', justifyContent: 'center', marginTop: 8, borderWidth: 0.5, borderColor: c.borderGreen }}>
            <Text style={{ fontSize: 36 }}>🌿</Text>
          </View>

          <Text style={{ fontSize: 22, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary, textAlign: 'center' }}>Cuéntame qué te comiste</Text>
          <Text style={{ fontSize: 14, color: c.textMuted, textAlign: 'center', lineHeight: 20, paddingHorizontal: 8 }}>¿Te diste un antojo o comiste algo fuera de tu plan? Sin culpa — te ayudo a entender el impacto real y cómo seguir adelante.</Text>

          <TextInput
            style={{ width: '100%', minHeight: 100, backgroundColor: c.surface, borderRadius: 14, padding: 16, fontSize: 15, color: c.textPrimary, borderWidth: 1, borderColor: c.inputBorder }}
            placeholder="Ej: Me comí una rebanada de pastel de chocolate"
            placeholderTextColor={c.textDisabled}
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {error && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.errorBg, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, width: '100%' }}>
              <Ionicons name="alert-circle-outline" size={18} color={c.errorText} />
              <Text style={{ flex: 1, fontSize: 13, color: c.errorText }}>{error}</Text>
            </View>
          )}

          <Pressable style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: c.green, paddingVertical: 16, borderRadius: 14, width: '100%', opacity: (!descripcion.trim() || isAnalyzing) ? 0.5 : 1 }} onPress={handleAnalyze} disabled={!descripcion.trim() || isAnalyzing}>
            {isAnalyzing ? <ActivityIndicator color="#fff" /> : <>
              <Ionicons name="sparkles-outline" size={20} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'PlusJakartaSans_600SemiBold' }}>Analizar</Text>
            </>}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
