import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, useFonts } from '@expo-google-fonts/plus-jakarta-sans';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/lib/theme';

export default function DisclaimerScreen() {
  const c = useColors();

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40, gap: 16 }} showsVerticalScrollIndicator={false}>

        <View style={{ alignItems: 'center', marginTop: 8, marginBottom: 8 }}>
          <Text style={{ fontSize: 56 }}>🌿</Text>
        </View>

        <Text style={{ fontSize: 28, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary, textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 }}>Antes de comenzar</Text>

        {[
          { title: '⚠️ Aviso importante', text: 'ChIA Fit es una herramienta de orientación nutricional basada en inteligencia artificial. Los planes de alimentación, rutinas de ejercicio y análisis de alimentos que genera esta app son de carácter informativo y educativo únicamente.' },
          { title: '🩺 No sustituye atención médica', text: 'La información proporcionada por ChIA Fit no reemplaza el diagnóstico, consejo o tratamiento de un médico, nutriólogo o profesional de la salud certificado. Siempre consulta a un profesional antes de realizar cambios significativos en tu alimentación o rutina de ejercicio, especialmente si tienes condiciones médicas preexistentes.' },
          { title: '📊 Estimaciones de IA', text: 'Los valores nutricionales, calorías y macronutrientes generados por inteligencia artificial son estimaciones aproximadas. Pueden variar según la preparación, la marca del producto y otros factores. No los uses como única referencia para decisiones médicas o clínicas.' },
        ].map((card) => (
          <View key={card.title} style={{ backgroundColor: c.surface, borderRadius: 14, padding: 16, gap: 8, borderLeftWidth: 3, borderLeftColor: c.green, borderWidth: 0.5, borderColor: c.border }}>
            <Text style={{ fontSize: 16, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary }}>{card.title}</Text>
            <Text style={{ fontSize: 14, color: c.textSecondary, lineHeight: 22 }}>{card.text}</Text>
          </View>
        ))}

        <Text style={{ fontSize: 13, color: c.textMuted, textAlign: 'center', lineHeight: 20 }}>Al continuar, confirmas que has leído y comprendido este aviso.</Text>

        <Pressable style={({ pressed }) => [{ backgroundColor: c.green, paddingVertical: 18, borderRadius: 14, alignItems: 'center', marginTop: 8, opacity: pressed ? 0.85 : 1 }]} onPress={() => router.push('/onboarding/objetivo')}>
          <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'PlusJakartaSans_600SemiBold' }}>Entendido, continuar</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
