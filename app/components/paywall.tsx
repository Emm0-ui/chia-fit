import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, useFonts } from '@expo-google-fonts/plus-jakarta-sans';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/lib/theme';

const FEATURES_FREE = [
  '20 escaneos gratuitos por mes',
  '1 plan nutricional (sin regenerar)',
  'Historial de 7 días',
  'Seguimiento diario',
];

const FEATURES_PREMIUM = [
  'Escaneos ilimitados',
  'Planes nutricionales ilimitados',
  'Historial completo',
  'Escáner de madurez de frutas',
  'Lista de compras con precios MX',
  'Soporte prioritario',
];

interface PaywallProps {
  mensaje: string;
  onVolver: () => void;
  onSuscribir?: () => void;
}

export default function Paywall({ mensaje, onVolver, onSuscribir }: PaywallProps) {
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
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40, gap: 20 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={{ alignItems: 'center', gap: 12 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: c.surfaceGreen, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: c.borderGreen }}>
            <Text style={{ fontSize: 40 }}>🌿</Text>
          </View>
          <Text style={{ fontSize: 26, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary, textAlign: 'center' }}>Límite alcanzado</Text>
          <Text style={{ fontSize: 15, color: c.textMuted, textAlign: 'center', lineHeight: 22 }}>{mensaje}</Text>
        </View>

        {/* Planes */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {/* Free */}
          <View style={{ flex: 1, backgroundColor: c.surface, borderRadius: 16, padding: 16, gap: 6, borderWidth: 0.5, borderColor: c.border }}>
            <Text style={{ fontSize: 16, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary }}>Free</Text>
            <Text style={{ fontSize: 28, fontFamily: 'PlusJakartaSans_700Bold', color: c.textMuted }}>$0</Text>
            <Text style={{ fontSize: 12, color: c.textDisabled }}>para siempre</Text>
            <View style={{ gap: 6, marginTop: 8 }}>
              {FEATURES_FREE.map((f, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
                  <Ionicons name="checkmark" size={14} color={c.textMuted} />
                  <Text style={{ flex: 1, fontSize: 11, color: c.textMuted, lineHeight: 16 }}>{f}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Premium */}
          <View style={{ flex: 1, backgroundColor: c.green, borderRadius: 16, padding: 16, gap: 6, borderWidth: 0.5, borderColor: c.green }}>
            <View style={{ backgroundColor: c.orange, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 4 }}>
              <Text style={{ fontSize: 10, fontFamily: 'PlusJakartaSans_700Bold', color: '#fff' }}>⭐ Recomendado</Text>
            </View>
            <Text style={{ fontSize: 16, fontFamily: 'PlusJakartaSans_700Bold', color: '#fff' }}>Premium</Text>
            <Text style={{ fontSize: 28, fontFamily: 'PlusJakartaSans_700Bold', color: '#fff' }}>$89</Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>MXN / mes</Text>
            <View style={{ gap: 6, marginTop: 8 }}>
              {FEATURES_PREMIUM.map((f, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
                  <Ionicons name="checkmark-circle" size={14} color="rgba(255,255,255,0.9)" />
                  <Text style={{ flex: 1, fontSize: 11, color: 'rgba(255,255,255,0.85)', lineHeight: 16 }}>{f}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Ahorro anual */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.surfaceOrange, borderRadius: 12, padding: 12, borderWidth: 0.5, borderColor: c.borderOrange }}>
          <Ionicons name="pricetag-outline" size={16} color={c.orange} />
          <Text style={{ flex: 1, fontSize: 13, color: c.orange, lineHeight: 18 }}>
            Plan anual: <Text style={{ fontFamily: 'PlusJakartaSans_700Bold' }}>$690 MXN</Text> — ahorras $378 MXN al año
          </Text>
        </View>

        {/* CTA */}
        <Pressable style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: c.green, paddingVertical: 18, borderRadius: 16, opacity: pressed ? 0.9 : 1 }]} onPress={onSuscribir}>
          <Ionicons name="star" size={18} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 17, fontFamily: 'PlusJakartaSans_700Bold' }}>Obtener Premium</Text>
        </Pressable>

        <Pressable style={{ alignItems: 'center', paddingVertical: 12 }} onPress={onVolver}>
          <Text style={{ fontSize: 15, color: c.textMuted, fontFamily: 'PlusJakartaSans_500Medium' }}>Continuar con plan gratuito</Text>
        </Pressable>

        <Text style={{ fontSize: 12, color: c.textDisabled, textAlign: 'center' }}>Cancela cuando quieras. Sin compromisos.</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
