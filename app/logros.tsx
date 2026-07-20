import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, useFonts } from '@expo-google-fonts/plus-jakarta-sans';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cargarLogros, verificarYDesbloquearLogros, type Logro } from '@/lib/logros';
import { useColors } from '@/lib/theme';

export default function LogrosScreen() {
  const c = useColors();
  const [logros, setLogros] = useState<Logro[]>([]);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useFocusEffect(useCallback(() => { cargar(); }, []));

  const cargar = async () => {
    await verificarYDesbloquearLogros();
    const l = await cargarLogros();
    setLogros(l);
  };

  if (!fontsLoaded) return null;

  const completados = logros.filter(l => l.completado).length;
  const total = logros.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 }}>
        <Pressable style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.backButton, alignItems: 'center', justifyContent: 'center' }} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Volver">
          <Ionicons name="arrow-back" size={20} color={c.backButtonIcon} />
        </Pressable>
        <Text style={{ fontSize: 17, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary }}>Mis logros</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: c.surface, borderRadius: 16, padding: 16, borderWidth: 0.5, borderColor: c.border, gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary }}>Tu progreso</Text>
            <Text style={{ fontSize: 15, fontFamily: 'PlusJakartaSans_700Bold', color: c.green }}>{completados}/{total}</Text>
          </View>
          <View style={{ height: 8, backgroundColor: c.border, borderRadius: 4, overflow: 'hidden' }}>
            <View style={{ height: 8, width: total > 0 ? `${(completados / total) * 100}%` : '0%', backgroundColor: c.green, borderRadius: 4 }} />
          </View>
          <Text style={{ fontSize: 12, color: c.textMuted }}>
            {completados === 0 ? '¡Empieza a usar ChIA Fit para desbloquear logros!' :
             completados === total ? '¡Felicidades! Has desbloqueado todos los logros 🎉' :
             `Te faltan ${total - completados} logros por desbloquear`}
          </Text>
        </View>

        {logros.filter(l => l.completado).length > 0 && (
          <>
            <Text style={{ fontSize: 13, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>Desbloqueados</Text>
            {logros.filter(l => l.completado).map((logro) => (
              <View key={logro.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: logro.color + '12', borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: logro.color + '30' }}>
                <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: logro.color + '20', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Text style={{ fontSize: 28 }}>{logro.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary }}>{logro.titulo}</Text>
                  <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2, lineHeight: 17 }}>{logro.descripcion}</Text>
                  {logro.fecha && <Text style={{ fontSize: 11, color: logro.color, marginTop: 4, fontFamily: 'PlusJakartaSans_500Medium' }}>Desbloqueado el {logro.fecha}</Text>}
                </View>
                <Ionicons name="checkmark-circle" size={22} color={logro.color} />
              </View>
            ))}
          </>
        )}

        {logros.filter(l => !l.completado).length > 0 && (
          <>
            <Text style={{ fontSize: 13, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 4 }}>Por desbloquear</Text>
            {logros.filter(l => !l.completado).map((logro) => (
              <View key={logro.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: c.surface, borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: c.border, opacity: 0.6 }}>
                <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: c.border, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Text style={{ fontSize: 28, opacity: 0.4 }}>{logro.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontFamily: 'PlusJakartaSans_700Bold', color: c.textMuted }}>???</Text>
                  <Text style={{ fontSize: 12, color: c.textDisabled, marginTop: 2, lineHeight: 17 }}>{logro.descripcion}</Text>
                </View>
                <Ionicons name="lock-closed-outline" size={18} color={c.textDisabled} />
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
