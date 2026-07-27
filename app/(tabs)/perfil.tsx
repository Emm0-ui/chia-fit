import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, useFonts } from '@expo-google-fonts/plus-jakarta-sans';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { exportarDatos } from '@/lib/export-data';
import { useTheme, type ThemePreference } from '@/contexts/theme-context';
import { useColors } from '@/lib/theme';

export default function PerfilScreen() {
  const c = useColors();
  const { preference, setPreference } = useTheme();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [objetivo, setObjetivo] = useState('');

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => { cargarPerfil(); }, []);

  const cargarPerfil = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setEmail(user.email ?? '');
    const { data: profile } = await supabase.from('profiles').select('onboarding_data').eq('id', user.id).single();
    const onboarding = profile?.onboarding_data;
    if (onboarding?.nombre) setNombre(onboarding.nombre);
    if (onboarding?.objetivo) {
      const objetivos: Record<string, string> = { bajar_peso: 'Bajar de peso', mantener_peso: 'Mantener peso', ganar_musculo: 'Ganar músculo', comer_saludable: 'Comer saludable' };
      setObjetivo(objetivos[onboarding.objetivo] ?? onboarding.objetivo);
    }
  };

  const handleCerrarSesion = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: async () => { await supabase.auth.signOut(); router.replace('/auth/login'); } },
    ]);
  };

  const handleRegenerarPlan = () => {
    Alert.alert('Regenerar plan', '¿Quieres crear un nuevo plan desde cero?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Regenerar', onPress: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) { await supabase.from('profiles').update({ nutrition_plan: null }).eq('id', user.id); router.replace('/onboarding/disclaimer'); }
      }},
    ]);
  };

  if (!fontsLoaded) return null;

  const TEMAS: { value: ThemePreference; label: string; icon: string }[] = [
    { value: 'light', label: 'Claro', icon: 'sunny-outline' },
    { value: 'dark', label: 'Oscuro', icon: 'moon-outline' },
    { value: 'auto', label: 'Automático', icon: 'phone-portrait-outline' },
  ];

  const inicial = nombre ? nombre.charAt(0).toUpperCase() : email.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 26, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary, letterSpacing: -0.5 }}>Perfil</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={{ alignItems: 'center', gap: 12, paddingVertical: 8 }}>
          <Pressable onPress={() => router.push('/editar-perfil')} style={{ position: 'relative' }}>
            <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: c.green, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 32, fontFamily: 'PlusJakartaSans_700Bold', color: '#fff' }}>{inicial}</Text>
            </View>
            <View style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, backgroundColor: c.green, borderWidth: 2, borderColor: c.background, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='pencil' size={12} color='#fff' />
            </View>
          </Pressable>
          {nombre ? <Text style={{ fontSize: 22, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary }}>{nombre}</Text> : null}
          <Text style={{ fontSize: 14, color: c.textMuted }}>{email}</Text>
          {objetivo ? (
            <View style={{ backgroundColor: c.surfaceGreen, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 0.5, borderColor: c.borderGreen }}>
              <Text style={{ fontSize: 13, color: c.green, fontFamily: 'PlusJakartaSans_600SemiBold' }}>🎯 {objetivo}</Text>
            </View>
          ) : null}
        </View>

        {/* Selector de tema */}
        <Text style={{ fontSize: 11, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textDisabled, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 4 }}>Apariencia</Text>
        <View style={{ backgroundColor: c.surface, borderRadius: 16, padding: 16, borderWidth: 0.5, borderColor: c.border, gap: 8 }}>
          <Text style={{ fontSize: 14, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary, marginBottom: 4 }}>Tema de la app</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {TEMAS.map((tema) => (
              <Pressable
                key={tema.value}
                style={{ flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: preference === tema.value ? c.green : c.border, backgroundColor: preference === tema.value ? c.surfaceGreen : c.background }}
                onPress={() => setPreference(tema.value)}>
                <Ionicons name={tema.icon as any} size={20} color={preference === tema.value ? c.green : c.textMuted} />
                <Text style={{ fontSize: 12, fontFamily: preference === tema.value ? 'PlusJakartaSans_600SemiBold' : 'PlusJakartaSans_400Regular', color: preference === tema.value ? c.green : c.textMuted }}>{tema.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Opciones */}
        <Text style={{ fontSize: 11, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textDisabled, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 4 }}>Cuenta</Text>
        {[
          { title: 'Regenerar mi plan', sub: 'Crear un nuevo plan desde cero', icon: 'refresh-outline', color: c.green, onPress: handleRegenerarPlan },
          { title: 'Mis logros', sub: 'Insignias y achievements', icon: 'trophy-outline', color: '#FACC15', onPress: () => router.push('/logros') },
          { title: 'Mis metas', sub: 'Calorías e hidratación', icon: 'options-outline', color: '#4ADE80', onPress: () => router.push('/ajustes-metas') },
          { title: 'Exportar mis datos', sub: 'Descarga tu historial en CSV', icon: 'download-outline', color: '#60A5FA', onPress: async () => { try { await exportarDatos(); } catch (e) { const msg = e instanceof Error ? e.message : String(e); const stack = e instanceof Error && e.stack ? e.stack.substring(0, 200) : ''; Alert.alert('Error', msg + ' | ' + stack); } } },
          { title: 'Notificaciones', sub: 'Gestiona tus recordatorios', icon: 'notifications-outline', color: '#FACC15', onPress: () => router.push('/ajustes-notificaciones') },
          { title: 'Política de privacidad', sub: 'Cómo protegemos tus datos', icon: 'shield-outline', color: c.blue, onPress: () => router.push('/politica-privacidad') },
          { title: 'Eliminar cuenta', sub: 'Borrar permanentemente tu cuenta', icon: 'trash-outline', color: c.red, onPress: () => {
    Alert.alert('Eliminar cuenta', '¿Estás seguro? Esta acción es permanente y eliminará todos tus datos.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          await supabase.from('consumo_diario').delete().eq('user_id', user.id);
          await supabase.from('progress_entries').delete().eq('user_id', user.id);
          await supabase.from('ejercicio_completado').delete().eq('user_id', user.id);
          await supabase.from('hidratacion_diaria').delete().eq('user_id', user.id);
          await supabase.from('scans').delete().eq('user_id', user.id);
          await supabase.from('profiles').delete().eq('id', user.id);
          await supabase.auth.signOut();
          router.replace('/auth/login');
        } catch (e) {
          Alert.alert('Error', 'No se pudo eliminar la cuenta. Intenta de nuevo.');
        }
      }}
    ]);
  }},
        ].map((item) => (
          <Pressable key={item.title} style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: c.surface, borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: c.border, opacity: pressed ? 0.85 : 1 }]} onPress={item.onPress}>
            <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: item.color + '20', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={item.icon as any} size={18} color={item.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary }}>{item.title}</Text>
              <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 1 }}>{item.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color={c.textDisabled} />
          </Pressable>
        ))}

        <Pressable style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 14, padding: 16, borderWidth: 0.5, borderColor: 'rgba(239,68,68,0.2)', marginTop: 8, opacity: pressed ? 0.85 : 1 }]} onPress={handleCerrarSesion}>
          <Ionicons name="log-out-outline" size={20} color={c.red} />
          <Text style={{ fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.red }}>Cerrar sesión</Text>
        </Pressable>

        <Text style={{ fontSize: 12, color: c.textDisabled, textAlign: 'center', marginTop: 8 }}>ChIA Fit v4.0 · Hecho con 🌿 en México</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
