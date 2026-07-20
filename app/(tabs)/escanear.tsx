import { PlusJakartaSans_400Regular, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, useFonts } from '@expo-google-fonts/plus-jakarta-sans';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/lib/theme';

export default function EscanearScreen() {
  const c = useColors();
  const [fontsLoaded] = useFonts({ PlusJakartaSans_400Regular, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold });
  if (!fontsLoaded) return null;

  const navigate = (path: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(path as any);
  };

  const ESCANERES = [
    { title: 'Fotografiar etiqueta', sub: 'Análisis nutricional completo con IA', icon: 'camera-outline', color: '#4ADE80', bg: 'rgba(22,163,74,0.12)', path: '/scanner', badge: null },
    { title: 'Código de barras', sub: 'Base de datos oficial Open Food Facts', icon: 'barcode-outline', color: '#60A5FA', bg: 'rgba(59,130,246,0.12)', path: '/scanner', badge: null },
    { title: 'Escanear platillo', sub: 'Analiza calorías y macros de tu comida', icon: 'restaurant-outline', color: '#FB923C', bg: 'rgba(249,115,22,0.12)', path: '/dish-scanner', badge: null },
    { title: 'Analizar fruta o verdura', sub: 'Madurez, frescura y cuándo consumir', icon: 'leaf-outline', color: '#4ADE80', bg: 'rgba(22,163,74,0.12)', path: '/produce_scanner', badge: 'EXCLUSIVO' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 26, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary, letterSpacing: -0.5 }}>Escáneres</Text>
        <Text style={{ fontSize: 14, color: c.textMuted, marginTop: 4 }}>Analiza cualquier alimento con IA</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }} showsVerticalScrollIndicator={false}>
        {ESCANERES.map((item) => (
          <Pressable key={item.title} style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: c.surface, borderRadius: 16, padding: 16, borderWidth: 0.5, borderColor: c.border, opacity: pressed ? 0.85 : 1 }]} onPress={() => navigate(item.path)}>
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: item.bg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary }}>{item.title}</Text>
                {item.badge && <View style={{ backgroundColor: 'rgba(74,222,128,0.12)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 0.5, borderColor: 'rgba(74,222,128,0.3)' }}><Text style={{ fontSize: 9, fontFamily: 'PlusJakartaSans_700Bold', color: '#4ADE80', letterSpacing: 0.5 }}>{item.badge}</Text></View>}
              </View>
              <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>{item.sub}</Text>
            </View>
            <Ionicons name='chevron-forward' size={16} color={c.textDisabled} />
          </Pressable>
        ))}
        <Pressable style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: c.surfaceOrange, borderRadius: 16, padding: 16, borderWidth: 0.5, borderColor: c.borderOrange, opacity: pressed ? 0.85 : 1, marginTop: 6 }]} onPress={() => navigate('/craving-check')}>
          <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(249,115,22,0.2)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Ionicons name='search-outline' size={22} color={c.orange} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary }}>Consulta tu antojo</Text>
            <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>Te saliste del plan? Evalúa el impacto real</Text>
          </View>
          <Ionicons name='chevron-forward' size={16} color={c.textDisabled} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});