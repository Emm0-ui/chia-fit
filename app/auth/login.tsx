import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, useFonts } from '@expo-google-fonts/plus-jakarta-sans';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useColors } from '@/lib/theme';

export default function LoginScreen() {
  const c = useColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  const handleLogin = async () => {
    if (!email.trim() || !password) { setError('Introduce tu email y contraseña'); return; }
    setError(null);
    setIsLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setIsLoading(false);
    if (signInError) { setError(signInError.message); return; }
    router.replace('/(tabs)');
  };

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <KeyboardAvoidingView style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center', gap: 32 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* Header */}
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 40, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary, letterSpacing: -1 }}>ChIA Fit 🌿</Text>
          <Text style={{ fontSize: 16, color: c.textMuted, fontFamily: 'PlusJakartaSans_400Regular' }}>Inicia sesión para continuar</Text>
        </View>

        {/* Formulario */}
        <View style={{ gap: 12 }}>
          <Text style={{ fontSize: 13, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textMuted, marginTop: 4 }}>Email</Text>
          <TextInput
            style={{ borderWidth: 1, borderColor: c.inputBorder, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: c.textPrimary, backgroundColor: c.inputBg, fontFamily: 'PlusJakartaSans_400Regular' }}
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            placeholderTextColor={c.textDisabled}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={{ fontSize: 13, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textMuted, marginTop: 4 }}>Contraseña</Text>
          <TextInput
            style={{ borderWidth: 1, borderColor: c.inputBorder, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: c.textPrimary, backgroundColor: c.inputBg, fontFamily: 'PlusJakartaSans_400Regular' }}
            value={password}
            onChangeText={setPassword}
            placeholder="Tu contraseña"
            placeholderTextColor={c.textDisabled}
            secureTextEntry
          />

          {error && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.errorBg, padding: 12, borderRadius: 10 }}>
              <Text style={{ flex: 1, fontSize: 13, color: c.errorText, fontFamily: 'PlusJakartaSans_500Medium' }}>{error}</Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [{ backgroundColor: c.green, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 8, opacity: pressed ? 0.9 : 1 }]}
            onPress={handleLogin}
            disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'PlusJakartaSans_600SemiBold' }}>Iniciar sesión</Text>}
          </Pressable>
        </View>

        {/* Footer */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
          <Text style={{ color: c.textMuted, fontSize: 15, fontFamily: 'PlusJakartaSans_400Regular' }}>¿No tienes cuenta?</Text>
          <Link href="/auth/register" asChild>
            <Pressable>
              <Text style={{ color: c.green, fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold' }}>Regístrate</Text>
            </Pressable>
          </Link>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
